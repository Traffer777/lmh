import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductWithRelations } from "@/lib/queries";

/**
 * Секция дропа «LMH CTRL+V» — сразу под хэдером.
 * Раскладка: НАЗВАНИЕ сверху → ПАЦАНЫ по центру → поверх них на уровне пояса
 * КРУТЯЩИЙСЯ КАТАЛОГ (авто-прокрутка, пауза по наведению). Человек (фото 1) — фоном сзади.
 * Пока в дропе нет реальных товаров — каталог показывается образцами (mock).
 */

// карточка-образец для мокапа (пока нет реальных товаров)
const MOCK = [
  { tee: "white", name: "Футболка CTRL+V" },
  { tee: "black", name: "Футболка CTRL+V" },
  { tee: "white", name: "Лонгслив CTRL+V" },
  { tee: "black", name: "Футболка CTRL+V" },
  { tee: "white", name: "Футболка CTRL+V" },
  { tee: "black", name: "Худи CTRL+V" },
];

function TeePrint({ dark }: { dark: boolean }) {
  return (
    <div className="text-center leading-tight">
      <span className="mono inline-block rounded-sm bg-[#1a3aa0] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
        CTRL+V
      </span>
      <p className={`mt-2 text-[11px] font-semibold ${dark ? "text-white/90" : "text-[#0a0a0a]"}`}>
        <span className="text-accent">Repeat</span> CTRL+V daily
        <br />
        Don&apos;t follow
        <br />
        the crowd, lead it.
      </p>
    </div>
  );
}

function MockCard({ tee, name }: { tee: string; name: string }) {
  const dark = tee === "black";
  return (
    <div className="group/card w-40 shrink-0 select-none sm:w-44">
      <div
        className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden border-2 border-line transition-transform duration-150 group-hover/card:-translate-y-1 ${
          dark ? "bg-[#141414]" : "bg-white"
        }`}
      >
        <TeePrint dark={dark} />
        <span className="mono absolute left-0 top-0 bg-accent px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-white">
          Образец
        </span>
        {/* флуд-инверсия в кислотный (kinetic brutalism) */}
        <div className="absolute inset-0 flex items-center justify-center bg-accent-2 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100">
          <span className="display text-2xl text-black">CTRL+V</span>
        </div>
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <h4 className="display text-sm leading-tight transition-colors group-hover/card:text-accent-2">
          {name}
        </h4>
        <span className="mono whitespace-nowrap text-[10px] uppercase tracking-wider text-fg-dim">
          скоро
        </span>
      </div>
    </div>
  );
}

function RealCard({ p }: { p: ProductWithRelations }) {
  const front = p.images[0]?.url ?? `/api/placeholder?t=${encodeURIComponent(p.title)}`;
  const back = p.images[1]?.url ?? null;
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group w-40 shrink-0 outline-none sm:w-44"
      aria-label={`${p.title}${back ? " — перёд и спина" : ""}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden border-2 border-line bg-white transition-transform duration-150 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-accent-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-bg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={front}
          alt={p.title}
          className={`h-full w-full object-contain transition-opacity duration-500 ${back ? "group-hover:opacity-0" : ""}`}
        />
        {back && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={back}
              alt={`${p.title} — спина`}
              className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            <span className="mono pointer-events-none absolute bottom-0 left-0 bg-bg/80 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-fg-dim transition-opacity group-hover:opacity-0">
              Перёд / спина
            </span>
          </>
        )}
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <h4 className="display text-sm leading-tight transition-colors group-hover:text-accent">{p.title}</h4>
        <span className="mono whitespace-nowrap text-xs tabular-nums">{formatPrice(p.price)}</span>
      </div>
    </Link>
  );
}

export default function CtrlVDrop({ products = [] }: { products?: ProductWithRelations[] }) {
  if (products.length === 0) return null;
  const hasReal = products.length > 0;
  // дублируем ленту ×2 для бесшовной прокрутки
  const track = hasReal ? [...products, ...products] : [...MOCK, ...MOCK];

  const FIELD = ["/ctrlv/field-1.jpg", "/ctrlv/field-2.jpg", "/ctrlv/field-3.jpg"];

  return (
    <section className="relative overflow-hidden border-y-2 border-line bg-bg">
      {/* ФОН: 3 кадра в ряд — единый триптих с турнира */}
      <div className="pointer-events-none absolute inset-0 flex" aria-hidden>
        {FIELD.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="h-full w-1/3 object-cover"
            style={{ objectPosition: "center 35%" }}
          />
        ))}
        {/* затемнение для читаемости заголовка и каталога */}
        <div className="absolute inset-0 bg-bg/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/90 via-bg/30 to-bg/90" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col px-4 pb-14 pt-14 md:px-6 md:pt-16">
        {/* НАЗВАНИЕ сверху */}
        <div className="text-center [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
          <p className="mono mb-3 text-xs uppercase tracking-[0.3em] text-accent">Новый дроп</p>
          <h2 className="display text-6xl leading-[0.85] md:text-8xl">
            LMH CTRL<span className="text-accent">+</span>V
          </h2>
          <p className="mx-auto mt-4 max-w-md text-fg">
            Repeat CTRL+V daily. Don&apos;t follow the crowd, lead it.
          </p>
        </div>

        {/* КРУТЯЩИЙСЯ КАТАЛОГ — поверх фона */}
        <div className="ctrlv-rail relative mt-12 overflow-hidden md:mt-16">
          {/* мягкие края ленты */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />
          <div className="ctrlv-marquee gap-3 py-4">
            {track.map((it, i) =>
              hasReal ? (
                <RealCard key={i} p={it as ProductWithRelations} />
              ) : (
                <MockCard key={i} {...(it as { tee: string; name: string })} />
              ),
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/drops/lead-the-crowd" className="btn btn-accent">
            Смотреть дроп
          </Link>
        </div>
      </div>
    </section>
  );
}
