// Стикеры LMH — главный символ бренда. Продаются пачками с тиражной ценой.
// Товар лежит в БД (category: "sticker", один Product), фото в /public/stickers.
// Цены пачек — здесь (без колонки в БД). `size` совпадает с size варианта в БД,
// чтобы сервер (api/orders) мог взять цену пачки по (slug, size).

export type StickerPack = { size: string; qty: number; price: number };
export type Sticker = {
  slug: string;
  title: string;
  images: string[]; // первое — переливающееся (главное на карточке)
  packs: StickerPack[]; // по возрастанию цены
};

export const STICKERS: Sticker[] = [
  {
    slug: "holography",
    title: "Стикер «Голография»",
    images: ["/stickers/holography-1.jpg", "/stickers/holography-2.jpg"],
    packs: [
      { size: "50 шт", qty: 50, price: 1000 },
      { size: "100 шт", qty: 100, price: 1800 },
      { size: "500 шт", qty: 500, price: 6000 },
      { size: "1000 шт", qty: 1000, price: 10000 },
    ],
  },
];

export function getSticker(slug: string): Sticker | undefined {
  return STICKERS.find((s) => s.slug === slug);
}

export function isSticker(slug: string): boolean {
  return STICKERS.some((s) => s.slug === slug);
}

/** Минимальная цена пачки — её показываем главной на карточке («от …»). */
export function stickerMinPrice(slug: string): number | null {
  const s = getSticker(slug);
  return s ? Math.min(...s.packs.map((p) => p.price)) : null;
}

/** Цена пачки по размеру — сервер использует при расчёте заказа. */
export function stickerPackPrice(slug: string, size: string): number | null {
  return getSticker(slug)?.packs.find((p) => p.size === size)?.price ?? null;
}
