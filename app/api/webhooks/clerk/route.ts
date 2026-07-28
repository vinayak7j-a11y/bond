import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

// Configure this URL in the Clerk dashboard (Webhooks → Add Endpoint) for
// the "user.created" event, with Clerk's "Enable username" sign-up option
// turned on so a username is collected at sign-up time.
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
    const handle = username ?? id.slice(-8); // fallback so signup never hard-fails

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

  return NextResponse.json({ received: true });
}
