import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import ProductCard from "@/components/ProductCard";
import { getPublishedProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getPublishedProducts();
  const featured = products.slice(0, 8);

  return (
    <div>
      {/* HERO */}
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog" className="btn btn-accent">
              Смотреть каталог
            </Link>
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
