import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getDropBySlug, getDropProducts, type ProductWithRelations } from "@/lib/queries";

export const dynamic = "force-dynamic";

// На вкладке дропа Lead The Crowd показываем ещё и формы игроков CTRL+V.
const COMPANION: Record<string, { slug: string; heading: string }[]> = {
  "lead-the-crowd": [{ slug: "ctrl-v", heading: "Формы CTRL+V" }],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  return { title: drop ? `${drop.title} — LMH` : "Дроп не найден — LMH" };
}

function Grid({ products }: { products: ProductWithRelations[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default async function DropPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const drop = await getDropBySlug(slug);
  if (!drop) notFound();

  const includeUnpublished = process.env.NODE_ENV !== "production";
  const [own, ...companions] = await Promise.all([
    getDropProducts(slug, { includeUnpublished }),
    ...(COMPANION[slug] ?? []).map((c) => getDropProducts(c.slug, { includeUnpublished })),
  ]);
  const companionMeta = COMPANION[slug] ?? [];

  const empty = own.length === 0 && companions.every((c) => c.length === 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      {/* Шапка дропа */}
      <div>
        <p className="mono mb-3 text-xs uppercase tracking-[0.3em] text-accent">Дроп</p>
        <h1 className="display text-5xl md:text-7xl">{drop.title}</h1>
        {drop.description && (
          <p className="mt-4 max-w-2xl text-fg-dim">{drop.description}</p>
        )}
      </div>

      {/* Видео-баннер дропа CTRL+V (с субтитрами) */}
      {slug === "lead-the-crowd" && (
        <div className="relative mt-8 overflow-hidden border-2 border-line bg-black">
          <video
            className="ctrlv-video aspect-video h-full w-full object-cover"
            poster="/ctrlv/ctrlv-bg-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/ctrlv/ctrlv-bg.mp4" type="video/mp4" />
            <track
              default
              kind="subtitles"
              srcLang="ru"
              label="Русские субтитры"
              src="/ctrlv/ctrlv-bg.vtt"
            />
          </video>
        </div>
      )}

      {empty ? (
        <p className="mt-16 text-center text-fg-dim">Дроп скоро появится.</p>
      ) : (
        <>
          {/* Формы игроков CTRL+V */}
          {companions.map((prods, i) =>
            prods.length > 0 ? (
              <section key={companionMeta[i].slug} className="mt-14">
                <h2 className="display text-3xl md:text-4xl">{companionMeta[i].heading}</h2>
                <Grid products={prods} />
              </section>
            ) : null,
          )}

          {/* Товары самого дропа */}
          {own.length > 0 && (
            <section className="mt-14">
              <h2 className="display text-3xl md:text-4xl">{drop.title}</h2>
              <Grid products={own} />
            </section>
          )}
        </>
      )}

      <div className="mt-16">
        <Link href="/catalog" className="mono text-xs uppercase tracking-widest hover:text-accent">
          ← Весь каталог
        </Link>
      </div>
    </div>
  );
}
