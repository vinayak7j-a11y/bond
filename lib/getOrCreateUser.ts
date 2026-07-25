import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

// Webhooks need a publicly reachable URL, which localhost isn't — so in
// local dev (and as a safety net in production if a webhook delivery ever
// fails or races), we create the User row the first time it's actually
// needed instead of depending solely on /api/webhooks/clerk having fired.
export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (existing) return existing;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkUser.id}@bond.app`;
  const handle = clerkUser.username ?? clerkUser.id.slice(-8);

  try {
    return await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        username: handle,
        email,
        identities: {
          create: {
            slug: "main",
            label: "Main",
            isDefault: true,
            name: clerkUser.firstName || handle,
          },
        },
      },
    });
  } catch {
    const stale = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: handle }] },
    });
    if (stale) {
      return prisma.user.update({ where: { id: stale.id }, data: { clerkId: clerkUser.id } });
    }

    const retry = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (retry) return retry;

    throw new Error("Failed to create or find user");
  }
}
