import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { inStock, type ProductWithRelations } from "@/lib/queries";
import { limitedDaysLeft, limitedEnded } from "@/lib/limited";

export default function ProductCard({ product }: { product: ProductWithRelations }) {
  const cover = product.images[0]?.url ?? `/api/placeholder?t=${encodeURIComponent(product.title)}`;
  const back = product.images[1]?.url ?? null; // вторая сторона (спина футболки)
  const available = inStock(product.variants);
  const daysLeft = limitedDaysLeft(product.slug); // null — если товар не лимитирован по времени
  const limitOver = limitedEnded(product.slug);
  const notReleased = !!product.releaseAt && new Date(product.releaseAt).getTime() > Date.now();

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={product.images[0]?.alt ?? product.title}
          className={`h-full w-full object-contain transition-all duration-500 group-hover:scale-[1.03] ${
            back ? "group-hover:opacity-0" : ""
          }`}
          loading="lazy"
        />
        {back && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={back}
              alt={product.images[1]?.alt ?? `${product.title} — спина`}
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
              loading="lazy"
            />
            <span className="mono pointer-events-none absolute bottom-0 left-0 bg-bg/80 px-2 py-1 text-[10px] uppercase tracking-widest text-fg-dim transition-opacity duration-300 group-hover:opacity-0">
              Перёд / спина
            </span>
          </>
        )}
        <div className="absolute left-0 top-0 flex flex-col gap-px">
          {product.limited && (
            <span className="mono bg-accent px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              Лимит
            </span>
          )}
          {daysLeft !== null && (
            <span className="mono bg-accent-2 px-2 py-1 text-[10px] uppercase tracking-widest text-bg">
              {limitOver ? "Финал" : `${Math.max(1, daysLeft)} дн.`}
            </span>
          )}
          {notReleased ? (
            <span className="mono bg-accent px-2 py-1 text-[10px] uppercase tracking-widest text-white">
              Скоро · 18:00
            </span>
          ) : !available ? (
            <span className="mono bg-bg px-2 py-1 text-[10px] uppercase tracking-widest text-fg-dim">
              Продано
            </span>
          ) : null}
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
