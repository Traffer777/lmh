import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthed } from "@/lib/auth";

// Скриншот отзыва ВК, приложенный к заказу (только для админки).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return new NextResponse("401", { status: 401 });
  const { id } = await params;
  const shot = await prisma.reviewShot.findUnique({ where: { orderId: Number(id) } });
  if (!shot) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(shot.data), {
    headers: { "Content-Type": shot.mime, "Cache-Control": "private, max-age=86400" },
  });
}
