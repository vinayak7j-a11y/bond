import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { safeUsername } from "@/lib/reservedUsernames";

// Configure this URL in the Clerk dashboard (Webhooks → Add Endpoint) for
// BOTH the "user.created" and "user.updated" events, with Clerk's "Enable
// username" sign-up option turned on so a username is collected at
// sign-up time. "user.updated" is what makes usernameLocked actually
// enforceable — without it subscribed in the Clerk dashboard, this file
// never even sees username changes made through Clerk's own account
// settings, so the lock silently has no effect.
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: any;
  try {
    event = new Webhook(secret).verify(payload, headers);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, username, email_addresses, first_name } = event.data;
    const email = email_addresses?.[0]?.email_address ?? `${id}@bond.app`;
    const handle = safeUsername(username ?? id.slice(-8), id); // fallback so signup never hard-fails

    // getOrCreateUser (lib/getOrCreateUser.ts) may already have created this
    // row as a fallback if the browser hit an authenticated API route before
    // this webhook delivery arrived — that's an expected race, not an error.
    const existing = await prisma.user.findUnique({ where: { clerkId: id } });
    if (!existing) {
      try {
        await prisma.user.create({
          data: {
            clerkId: id,
            username: handle,
            email,
            // Every account starts with one default identity so bond.app/username
            // always resolves to something immediately after signup.
            identities: {
              create: {
                slug: "main",
                label: "Main",
                isDefault: true,
                name: first_name || handle,
              },
            },
          },
        });
      } catch (err) {
        console.error("Clerk webhook: user.created race, getOrCreateUser likely won it:", err);
      }
    }
  }

  if (event.type === "user.updated") {
    const { id, username, email_addresses } = event.data;
    const existing = await prisma.user.findUnique({ where: { clerkId: id } });
    if (existing) {
      const email = email_addresses?.[0]?.email_address ?? existing.email;
      const data: { email: string; username?: string } = { email };

      // This is the ACTUAL enforcement point for usernameLocked. Clerk has
      // no concept of our lock — its own hosted account settings will
      // happily let someone change their username regardless of whether
      // a physical accessory already points at the old one. Without this
      // check, that Clerk-side change would just silently overwrite our
      // locked value the next time this webhook fires, defeating the
      // entire point of locking it in the first place.
      if (!existing.usernameLocked && username) {
        data.username = safeUsername(username, id);
      }

      await prisma.user.update({ where: { clerkId: id }, data }).catch((err: unknown) => {
        console.error("Clerk webhook: user.updated failed:", err);
      });
    }
  }

  return NextResponse.json({ received: true });
}
