import { prisma } from "@/lib/prisma";

export async function getPublishedProducts() {
  // В dev показываем и черновики (для превью до деплоя); в проде — только опубликованные.
  const includeUnpublished = process.env.NODE_ENV !== "production";
  return prisma.product.findMany({
    where: includeUnpublished ? {} : { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      drop: true,
    },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      drop: true,
    },
  });
}

export async function getDropProducts(
  slug: string,
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {},
) {
  return prisma.product.findMany({
    // Черновики дропа видны только в dev (includeUnpublished). В проде — лишь опубликованные.
    where: { drop: { slug }, ...(includeUnpublished ? {} : { published: true }) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { id: "asc" } },
      drop: true,
    },
  });
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
