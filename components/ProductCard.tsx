import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { inStock, type ProductWithRelations } from "@/lib/queries";

export default function ProductCard({ product }: { product: ProductWithRelations }) {
  const cover = product.images[0]?.url ?? `/api/placeholder?t=${encodeURIComponent(product.title)}`;
  const available = inStock(product.variants);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={product.images[0]?.alt ?? product.title}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute left-0 top-0 flex flex-col gap-px">
          {product.limited && (
            <span className="mono bg-accent px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              Лимит
            </span>
          )}
          {!available && (
            <span className="mono bg-bg px-2 py-1 text-[10px] uppercase tracking-widest text-fg-dim">
              Продано
            </span>
          )}
        </div>
        {product.drop && (
          <span className="mono absolute bottom-0 right-0 bg-bg/80 px-2 py-1 text-[10px] uppercase tracking-widest text-fg-dim">
            {product.drop.title}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="display text-lg leading-tight group-hover:text-accent">
          {product.title}
        </h3>
        <span className="mono whitespace-nowrap text-sm">
          {product.price > 0 ? formatPrice(product.price) : "Цена уточняется"}
        </span>
      </div>
    </Link>
  );
}
