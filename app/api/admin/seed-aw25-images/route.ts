import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EXTRAS: Record<string, string[]> = {
  "aw25-pants-velour-wide": ["2"],
  "aw25-puffer": ["2", "3"],
  "aw25-bag-lmh": ["2"],
};

export async function POST() {
  if (!(await isAuthed())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.product.findMany({
    where: { drop: { slug: "aw25" } },
    select: { id: true, slug: true, title: true },
  });

  const report: Array<{ slug: string; count: number }> = [];
  for (const p of rows) {
    await prisma.productImage.deleteMany({ where: { productId: p.id } });
    const images: { url: string; alt: string; sortOrder: number }[] = [
      { url: `/products/${p.slug}.jpg`, alt: p.title, sortOrder: 0 },
    ];
    (EXTRAS[p.slug] ?? []).forEach((suf, i) =>
      images.push({ url: `/products/${p.slug}-${suf}.jpg`, alt: p.title, sortOrder: i + 1 }),
    );
    await prisma.productImage.createMany({
      data: images.map((im) => ({ productId: p.id, ...im })),
    });
    report.push({ slug: p.slug, count: images.length });
  }

  const upd = await prisma.product.updateMany({
    where: { drop: { slug: "aw25" } },
    data: { published: true, releaseAt: null },
  });

  return NextResponse.json({ published: upd.count, images: report });
}
