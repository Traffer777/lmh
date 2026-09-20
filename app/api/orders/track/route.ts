import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Публичный статус заказа по номеру (для страницы «спасибо» — клиент без кабинета
// видит трек СДЭК). Отдаём только статус и трек, не раскрывая прочие данные.
export async function GET(request: NextRequest) {
  const number = request.nextUrl.searchParams.get("number") ?? "";
  if (!number.trim()) return NextResponse.json({ ok: false }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { number: number.trim() },
    select: { status: true, deliveryMethod: true, trackNumber: true },
  });
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({
    ok: true,
    status: order.status,
    isCdek: order.deliveryMethod === "cdek",
    track: order.trackNumber ?? null,
  });
}
