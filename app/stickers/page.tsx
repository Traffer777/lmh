import Link from "next/link";
import PeelSticker from "@/components/PeelSticker";
import { formatPrice } from "@/lib/format";
import { STICKERS, stickerMinPrice } from "@/lib/stickers";

export const metadata = {
  title: "Стикеры — LMH",
  description: "Те самые стикеры LMH, которые ты видишь по городу. Возьми пачку и расклей.",
};

export default function StickersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent">Стикеры</p>
      <h1 className="display mt-3 text-5xl md:text-7xl">Те самые наклейки</h1>
      <p className="mt-4 max-w-2xl text-fg-dim">
        Стикеры LMH — не дополнение к одежде, а самостоятельный продукт и главный символ
        бренда. Их клеят по всему городу. Возьми пачку — и расклей свой район.
      </p>

      {STICKERS.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-8 text-center">
          <PeelSticker src="/stickers/demo-lmh.png" alt="Стикер LMH" size={160} rotate={-5} />
          <p className="mono text-fg-dim">Дропаем совсем скоро. Следи в Telegram.</p>
          <a
            href="https://t.me/LmhFuckSleep"
            target="_blank"
            rel="noreferrer"
            className="btn btn-accent"
          >
            Telegram-канал
          </a>
        </div>
      ) : (
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
          {STICKERS.map((s, i) => {
            const min = stickerMinPrice(s.slug);
            return (
              <div key={s.slug} className="flex flex-col items-center text-center">
                <PeelSticker
                  src={s.images[0]}
                  alt={s.title}
                  size={190}
                  rotate={i % 2 === 0 ? -4 : 5}
                  href={`/product/${s.slug}`}
                />
                <h3 className="mono mt-6 text-sm uppercase tracking-widest">{s.title}</h3>
                {min != null && (
                  <span className="mono mt-1 text-sm text-accent">от {formatPrice(min)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-20 border-t border-line pt-8">
        <Link href="/catalog" className="mono text-xs uppercase tracking-widest hover:text-accent">
          ← Весь каталог
        </Link>
      </div>
    </div>
  );
}
