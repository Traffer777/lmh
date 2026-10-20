import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import PeelSticker from "@/components/PeelSticker";
import { getPublishedProducts, getDrops } from "@/lib/queries";
import { categoryLabel } from "@/lib/constants";
import { GROUPS, findGroup } from "@/lib/groups";

export const metadata = { title: "Каталог — LMH" };

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ drop?: string; cat?: string; g?: string }>;
}) {
  const { drop, cat, g } = await searchParams;
  const group = findGroup(g);
  const [all, drops] = await Promise.all([getPublishedProducts(), getDrops()]);

  let products = all;
  if (drop) products = products.filter((p) => p.drop?.slug === drop);
  if (cat) products = products.filter((p) => p.category === cat);
  if (group) products = products.filter((p) => group.match(p));

  const activeDrop = drops.find((d) => d.slug === drop);

  const chip = (active: boolean) =>
    `mono border px-3 py-1.5 text-xs uppercase tracking-widest transition-colors ${
      active ? "border-accent bg-accent text-white" : "border-line text-fg-dim hover:text-fg"
    }`;

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6">
      {/* пасхалка — верхний правый угол */}
      <PeelSticker
        src="/stickers/demo-lmh.png"
        alt="Стикеры LMH"
        href="/stickers"
        size={58}
        rotate={9}
        className="absolute right-3 top-4 z-10 hidden sm:inline-block"
      />
      <h1 className="display text-5xl md:text-6xl">Каталог</h1>
      {activeDrop?.description && (
        <p className="mt-3 max-w-2xl text-fg-dim">{activeDrop.description}</p>
      )}

      {/* Фильтр: категории */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/catalog" className={chip(!cat && !group)}>
          Все
        </Link>
        {GROUPS.map((gr) => (
          <Link
            key={gr.key}
            href={group?.key === gr.key ? "/catalog" : `/catalog?g=${gr.key}`}
            className={chip(group?.key === gr.key)}
          >
            {gr.label}
          </Link>
        ))}
      </div>

      <p className="mono mt-6 text-xs uppercase tracking-widest text-fg-dim">
        {products.length} {plural(products.length)}
        {cat ? ` · ${categoryLabel(cat)}` : ""}
        {group ? ` · ${group.label}` : ""}
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
