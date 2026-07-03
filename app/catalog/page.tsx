import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getPublishedProducts, getDrops } from "@/lib/queries";
import { CATEGORIES, categoryLabel } from "@/lib/constants";

export const metadata = { title: "Каталог — LMH" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ drop?: string; cat?: string }>;
}) {
  const { drop, cat } = await searchParams;
  const [all, drops] = await Promise.all([getPublishedProducts(), getDrops()]);

  let products = all;
  if (drop) products = products.filter((p) => p.drop?.slug === drop);
  if (cat) products = products.filter((p) => p.category === cat);

  const activeDrop = drops.find((d) => d.slug === drop);
  const usedCats = CATEGORIES.filter((c) => all.some((p) => p.category === c.value));

  const chip = (active: boolean) =>
    `mono border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
      active ? "border-accent bg-accent text-white" : "border-line text-fg-dim hover:text-fg"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="display text-5xl md:text-6xl">Каталог</h1>
      {activeDrop?.description && (
        <p className="mt-3 max-w-2xl text-fg-dim">{activeDrop.description}</p>
      )}

      {/* Фильтр: категории */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/catalog" className={chip(!cat)}>
          Все
        </Link>
        {usedCats.map((c) => (
          <Link
            key={c.value}
            href={cat === c.value ? "/catalog" : `/catalog?cat=${c.value}`}
            className={chip(cat === c.value)}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <p className="mono mt-6 text-xs uppercase tracking-widest text-fg-dim">
        {products.length} {plural(products.length)}
        {cat ? ` · ${categoryLabel(cat)}` : ""}
      </p>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-fg-dim">В этой подборке пока пусто.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function plural(n: number): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return "товаров";
  if (b > 1 && b < 5) return "товара";
  if (b === 1) return "товар";
  return "товаров";
}
