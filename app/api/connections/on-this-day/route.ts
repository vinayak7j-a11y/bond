import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// Returns "3 months ago" / "1 year ago" style label if `from` (a
// Connection.createdAt) lands on the same day-of-month as `to` (today) and
// at least one full month has elapsed — otherwise null, meaning today isn't
// a meaningful anniversary for that connection.
function onThisDayLabel(from: Date, to: Date): string | null {
  if (to.getDate() !== from.getDate()) return null;

  const monthsElapsed =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (monthsElapsed < 1) return null;

  if (monthsElapsed % 12 === 0) {
    const years = monthsElapsed / 12;
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
  return monthsElapsed === 1 ? "1 month ago" : `${monthsElapsed} months ago`;
}

// GET powers the dashboard's "On this day" widget — resurfaces connections
// whose save date matches today's day-of-month from a prior month/year, so
// the "Remember" half of Tap → Meet → Connect → Remember has something
// active instead of only being a page you have to think to visit.
export async function GET() {
  try {
    const owner = await getOrCreateUser();
    if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const connections = await prisma.connection.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
    });

    const today = new Date();
    const matches = connections
      .map((c) => {
        const label = onThisDayLabel(new Date(c.createdAt), today);
        return label ? { ...c, onThisDayLabel: label } : null;
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return NextResponse.json({ matches });
  } catch (err) {
    console.error("GET /api/connections/on-this-day failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
