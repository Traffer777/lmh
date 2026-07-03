import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/constants";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) return NextResponse.json({ ok: false, error: "401" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const status = String(body.status ?? "");
  if (!ORDER_STATUSES.some((s) => s.value === status)) {
    return NextResponse.json({ ok: false, error: "Некорректный статус." }, { status: 400 });
  }
  await prisma.order.update({ where: { id: Number(id) }, data: { status } });
  return NextResponse.json({ ok: true });
}
