import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RETURN_STATUSES } from "@/lib/returns";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: "401" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const data: { status?: string; adminNote?: string } = {};
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!RETURN_STATUSES.some((s) => s.value === status))
      return NextResponse.json({ ok: false, error: "Некорректный статус." }, { status: 400 });
    data.status = status;
  }
  if (body.adminNote !== undefined) data.adminNote = String(body.adminNote).slice(0, 4000);
  await prisma.returnRequest.update({ where: { id: Number(id) }, data });
  return NextResponse.json({ ok: true });
}
