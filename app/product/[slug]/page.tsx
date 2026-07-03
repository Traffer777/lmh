import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { getProductBySlug } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Товар не найден — LMH" };
  return {
    title: `${product.title} — LMH`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.published) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <ProductDetail
        product={{
          id: product.id,
          slug: product.slug,
          title: product.title,
          description: product.description,
          composition: product.composition,
          price: product.price,
          limited: product.limited,
          dropTitle: product.drop?.title ?? null,
          images: product.images.map((im) => ({ url: im.url, alt: im.alt })),
          variants: product.variants.map((v) => ({ size: v.size, stock: v.stock })),
        }}
      />
    </div>
  );
}
