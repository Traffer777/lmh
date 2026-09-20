import Link from "next/link";

type Props = {
  src: string;
  alt?: string;
  /** ширина в px (стикер квадратный) */
  size?: number;
  /** наклон, град */
  rotate?: number;
  href?: string;
  className?: string;
  /** true — чёрная «бумага» под стикером; по умолчанию — белая наклейка */
  dark?: boolean;
  /** true — уголок статично отогнут (как будто стикер уже отклеивается) */
  peeled?: boolean;
};

/**
 * Наклейка LMH: квадратный глянцевый стикер с загнутым уголком.
 * Покой — уголок чуть отогнут (виден и на телефоне без hover).
 * Hover/фокус — уголок отгибается сильнее, стикер приподнимается.
 * Всё на % и статичных transform (см. .lmh-sticker в globals.css):
 * var() внутри transform Lightning CSS дропает — поэтому наклон инлайном на обёртке.
 */
export default function PeelSticker({
  src,
  alt = "Стикер LMH",
  size = 120,
  rotate = -4,
  href,
  className = "",
  dark = false,
  peeled = false,
}: Props) {
  const inner = (
    <span
      className={`lmh-sticker-rot ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span
        className={`lmh-sticker ${dark ? "lmh-sticker--dark" : ""} ${peeled ? "lmh-sticker--peeled" : ""}`}
        style={{ width: size, height: size }}
      >
        <span className="lmh-sticker__face">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lmh-sticker__img" src={src} alt={alt} draggable={false} />
          <span className="lmh-sticker__gloss" aria-hidden />
        </span>
        <span className="lmh-sticker__curl" aria-hidden />
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={alt} className="lmh-sticker-link inline-block leading-none">
        {inner}
      </Link>
    );
  }
  return inner;
}
