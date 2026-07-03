import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (Number.isNaN(productId)) notFound();

  const [product, drops] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { id: "asc" } },
      },
    }),
    prisma.drop.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent">
        ← К товарам
      </Link>
      <h1 className="display mt-2 text-4xl">{product.title}</h1>
      <div className="mt-6">
        <ProductForm
          drops={drops.map((d) => ({ id: d.id, title: d.title }))}
          initial={{
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: product.price,
            category: product.category,
            dropId: product.dropId,
            description: product.description ?? "",
            composition: product.composition ?? "",
            limited: product.limited,
            published: product.published,
            sortOrder: product.sortOrder,
            images: product.images.map((im) => ({ url: im.url, alt: im.alt ?? "" })),
            variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
          }}
        />
      </div>
    </div>
  );
}
