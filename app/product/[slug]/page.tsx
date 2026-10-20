import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import StickerDetail from "@/components/StickerDetail";
import ProductCard from "@/components/ProductCard";
import AlsoBought from "@/components/AlsoBought";
import { getProductBySlug, getAlsoBought } from "@/lib/queries";
import { limitedUntil } from "@/lib/limited";

// Товары с возможностью нанесения имени/номера на спину.
const CUSTOMIZABLE_SLUGS = new Set(["ctrl-v-custom", "ctrl-v-custom-white"]);

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
  // Черновики видны только в dev (для превью дропа); в проде — 404.
  const draftHidden = product && !product.published && process.env.NODE_ENV === "production";
  if (!product || draftHidden) notFound();

  const also = await getAlsoBought(product.id);
  const alsoBought = also.length > 0 && (
    <AlsoBought>
      {also.map((p) => (
        <div key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
          <ProductCard product={p} />
        </div>
      ))}
    </AlsoBought>
  );

  // Стикеры — своя карточка с выбором пачки (цена зависит от количества).
  if (product.category === "sticker") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <StickerDetail
          id={product.id}
          slug={product.slug}
          title={product.title}
          description={product.description}
          images={product.images.map((im) => ({ url: im.url, alt: im.alt }))}
          variants={product.variants.map((v) => ({ size: v.size, stock: v.stock }))}
        />
        {alsoBought}
      </div>
    );
  }

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
          customizable: CUSTOMIZABLE_SLUGS.has(product.slug),
          customDark: product.slug === "ctrl-v-custom-white",
          releaseAt: product.releaseAt ? product.releaseAt.toISOString() : null,
        }}
        limitedUntil={limitedUntil(product.slug)}
      />
      {alsoBought}
    </div>
  );
}
