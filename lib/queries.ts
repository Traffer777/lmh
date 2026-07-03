import { prisma } from "@/lib/prisma";

export async function getPublishedProducts() {
  return prisma.product.findMany({
    where: { published: true },
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
