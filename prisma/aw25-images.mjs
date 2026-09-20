// Регистрация галерей AW25: сбрасывает ProductImage и записывает главную + доп. углы.
// Также включает продажу сейчас (published=true, releaseAt=null).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// slug → массив суффиксов после главного slug.jpg (добавляются как {slug}-N.jpg)
const EXTRAS = {
  "aw25-pants-velour-wide": ["2"],
  "aw25-puffer": ["2", "3"],
  "aw25-bag-lmh": ["2"],
};

const rows = await prisma.product.findMany({
  where: { drop: { slug: "aw25" } },
  select: { id: true, slug: true, title: true },
});

for (const p of rows) {
  await prisma.productImage.deleteMany({ where: { productId: p.id } });
  const images = [{ url: `/products/${p.slug}.jpg`, alt: p.title, sortOrder: 0 }];
  const ex = EXTRAS[p.slug] || [];
  ex.forEach((suf, i) =>
    images.push({ url: `/products/${p.slug}-${suf}.jpg`, alt: p.title, sortOrder: i + 1 })
  );
  await prisma.productImage.createMany({
    data: images.map((im) => ({ productId: p.id, ...im })),
  });
  console.log(`✓ ${p.slug} · ${images.length} фото`);
}

const r = await prisma.product.updateMany({
  where: { drop: { slug: "aw25" } },
  data: { published: true, releaseAt: null },
});
console.log(`\nAW25 опубликовано: ${r.count} товаров, releaseAt=null`);

await prisma.$disconnect();
