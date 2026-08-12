import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

// GET powers the dashboard's "My Tags" section — until now there was no
// way to see whether a claim actually worked beyond landing back on
// /dashboard with no visible confirmation.
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tags = await prisma.tag.findMany({
      where: { claimedById: user.id },
      orderBy: { claimedAt: "desc" },
      select: { id: true, code: true, claimedAt: true },
    });

    return NextResponse.json({ tags });
  } catch (err) {
    console.error("GET /api/tags failed:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
