import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stickerPackPrice } from "@/lib/stickers";
import { applyPromo } from "@/lib/promo";

// Проверка промокода для страницы оформления (итоговый пересчёт — в /api/orders).
export async function POST(request: NextRequest) {
  let body: { code?: string; items?: { productId: number; size: string; qty: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос." }, { status: 400 });
  }
  const items = body.items ?? [];
  if (!body.code?.trim() || !items.length)
    return NextResponse.json({ ok: false, error: "Введите промокод." }, { status: 400 });

  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(items.map((i) => i.productId))] }, published: true },
    select: { id: true, slug: true, price: true, category: true },
  });
  const lines = items.flatMap((it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return [];
    return [{ category: p.category, price: stickerPackPrice(p.slug, it.size) ?? p.price, qty: Math.max(1, Math.floor(it.qty)) }];
  });
  const res = applyPromo(body.code, lines);
  if (!res.ok) return NextResponse.json(res);
  return NextResponse.json({ ok: true, code: res.promo.code, percent: res.promo.percent, discount: res.discount });
}
