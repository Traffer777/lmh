import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import ProductCard from "@/components/ProductCard";
import CtrlVDrop from "@/components/CtrlVDrop";
import PeelSticker from "@/components/PeelSticker";
import { getPublishedProducts, getDropProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Подборка «Новое» — разнообразие категорий: худи, штаны (стразы CRYSTAL),
// сумка и футболки. Порядок = порядок на витрине; недоступные (черновики в
// проде) просто выпадают из выборки.
const FEATURED_SLUGS = [
  "stripe-blackyellow", // кофта страйп (лонгслив Stripe)
  "stripe-navygreen", // полосатый лонгслив Stripe (синий)
  "lmh-tee-van", // футболка «Van»
  "ctrl-v-gold-tee", // футболка с золотом (CTRL+V Gold, глиттер)
  "lmh-tee-tyson", // футболка «Tyson»
  "pants-crystal", // штаны со стразами (CRYSTAL)
  "lmh-worldwide-gold", // футболка Worldwide (золотая)
  // TODO: маленькая сумка «Нах*й луи» — в базе только большая (bag-nahuy) + клатч; добавить, когда будет фото
];

export default async function Home() {
  const products = await getPublishedProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const featured = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const ctrlv = await getDropProducts("ctrl-v", {
    includeUnpublished: process.env.NODE_ENV !== "production",
  });

  return (
    <div>
      {/* HERO — видео первым */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden border-b border-line">
        <HeroVideo />
        <div
          className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/30"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 md:px-6">
          <p className="mono mb-3 text-xs uppercase tracking-[0.3em] text-accent">
            Уличная одежда с характером
          </p>
          <h1 className="display text-6xl md:text-8xl">
            Форма
            <br />
            улицы
          </h1>
          <p className="mt-5 max-w-md text-fg-dim">
            Лимитированные дропы LMH. Здесь нет лишнего — только то, что носится
            каждый день и говорит за тебя.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="relative inline-block">
              <Link href="/catalog" className="btn btn-accent">
                Смотреть каталог
              </Link>
              {/* пасхалка: стикер «держит» кнопку */}
              <PeelSticker
                src="/stickers/demo-lmh.png"
                alt="Стикер LMH"
                size={46}
                rotate={11}
                className="pointer-events-none absolute -right-4 -top-5 z-10"
              />
            </span>
            <a
              href="https://t.me/LmhFuckSleep"
              className="btn"
              target="_blank"
              rel="noreferrer"
            >
              Telegram-канал
            </a>
          </div>
        </div>
      </section>

      {/* ДРОП CTRL+V — после видео */}
      <CtrlVDrop products={ctrlv} />

      {/* СЕТКА ТОВАРОВ */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="display text-4xl md:text-5xl">Новое</h2>
          <Link href="/catalog" className="mono text-xs uppercase tracking-widest hover:text-accent">
            Весь каталог →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link href="/catalog" className="btn btn-accent">
            Смотреть весь каталог
          </Link>
        </div>
      </section>

      {/* МАНИФЕСТ */}
      <section className="border-y border-line bg-accent">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6">
          <p className="display text-4xl text-white md:text-7xl">Leading Makes History</p>
        </div>
      </section>
    </div>
  );
}
