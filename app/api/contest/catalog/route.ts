import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ticketsPerUnit } from "@/lib/tickets";

// Feed каталога для бота конкурса LMH × Глебас: SKU → категория → цена →
// сколько билетов даст 1 шт. Используется в UI бота («купи худи — +2 билета»).

export const revalidate = 300; // 5 мин

export async function GET() {
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, title: true, category: true, price: true },
    orderBy: { sortOrder: "asc" },
  });

  const items = products.map((p) => ({
    sku: p.slug,
    title: p.title,
    category: p.category,
    priceRub: p.price,
    ticketsPerUnit: ticketsPerUnit(p.category),
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/product/${p.slug}`,
  }));

  return NextResponse.json({ items });
}
