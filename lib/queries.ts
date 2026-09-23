import { prisma } from "@/lib/prisma";

// AW25-фото отдаём через jsDelivr (GitHub CDN) — Timeweb Docker кэширует public/ и файлы дропа
// физически не попадают в контейнер. Файлы лежат в git → CDN отдаёт их напрямую.
const CDN_BASE = "https://cdn.jsdelivr.net/gh/Traffer777/lmh@main/public";

function productUrl(filename: string): string {
  if (filename.startsWith("aw25-") || filename.startsWith("glebas-"))
    return `${CDN_BASE}/products/${filename}`;
  return `/products/${filename}`;
}

// Фолбэк-галерея на случай, если в БД ещё нет ProductImage.
const FILE_EXTRAS: Record<string, string[]> = {
  "aw25-pants-velour-wide": ["2"],
  "aw25-puffer": ["2", "3"],
  "aw25-bag-lmh": ["2"],
  "glebas-pants": ["2"],
  "glebas-pants-rhinestone": ["2", "3"],
  "glebas-ziphoodie-rhinestone": ["2", "3"],
  "glebas-ziphoodie": ["2"],
  "glebas-hoodie": ["2"],
};

type ImgLike = { url: string; alt: string | null; sortOrder: number };
function synthesizeImages(slug: string, title: string): ImgLike[] {
  const imgs: ImgLike[] = [{ url: productUrl(`${slug}.jpg`), alt: title, sortOrder: 0 }];
  (FILE_EXTRAS[slug] ?? []).forEach((suf, i) =>
    imgs.push({ url: productUrl(`${slug}-${suf}.jpg`), alt: title, sortOrder: i + 1 }),
  );
  return imgs;
}

// Переписывает уже существующие в БД URL типа /products/aw25-*.jpg на CDN.
function rewriteToCdn(images: ImgLike[]): ImgLike[] {
  return images.map((im) => {
    const m = im.url.match(/^\/products\/((aw25|glebas)-[^/]+)$/);
    return m ? { ...im, url: `${CDN_BASE}/products/${m[1]}` } : im;
  });
}

function fillFallbackImages(p: { slug: string; title: string; images: ImgLike[] }): void {
  if (!p.images || p.images.length === 0) {
    p.images = synthesizeImages(p.slug, p.title);
  } else {
    p.images = rewriteToCdn(p.images);
  }
}

export async function getPublishedProducts() {
  // В dev показываем и черновики (для превью до деплоя); в проде — только опубликованные.
  const includeUnpublished = process.env.NODE_ENV !== "production";
  const rows = await prisma.product.findMany({
    where: includeUnpublished ? {} : { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      drop: true,
    },
  });
  for (const p of rows) fillFallbackImages(p);
  return rows;
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      drop: true,
    },
  });
  if (p) fillFallbackImages(p);
  return p;
}

export async function getDropProducts(
  slug: string,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {},
) {
  const rows = await prisma.product.findMany({
    // Черновики дропа видны только в dev (includeUnpublished). В проде — лишь опубликованные.
    where: { drop: { slug }, ...(includeUnpublished ? {} : { published: true }) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      drop: true,
    },
  });
  for (const p of rows) fillFallbackImages(p);
  return rows;
}

export async function getDropBySlug(slug: string) {
  return prisma.drop.findUnique({ where: { slug } });
}

export async function getDrops() {
  return prisma.drop.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function inStock(variants: { stock: number }[]): boolean {
  return variants.some((v) => v.stock > 0);
}

export type ProductWithRelations = Awaited<ReturnType<typeof getPublishedProducts>>[number];
