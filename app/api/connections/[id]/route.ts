import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/getOrCreateUser";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.connection.findFirst({
      where: { id: params.id, ownerId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    if (typeof body.note !== "string" && body.note !== null) {
      return NextResponse.json({ error: "note must be a string or null" }, { status: 400 });
    }

    const connection = await prisma.connection.update({
      where: { id: params.id },
      data: { note: body.note === "" ? null : body.note },
    });

    return NextResponse.json({ connection });
  } catch (err) {
    console.error("PATCH /api/connections/[id] failed:", err);
    return NextResponse.json({ error: "Something went wrong saving that note." }, { status: 500 });
  }
}
