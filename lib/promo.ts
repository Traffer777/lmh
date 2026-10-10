// Промокоды — манифест в коде (как stickers.ts / limited.ts).
// Скидка применяется к цене каждой единицы одежды, поэтому чек 54-ФЗ
// (цена × кол-во по каждой позиции) всегда сходится с суммой заказа.

export type Promo = {
  code: string;
  percent: number;
  minTotal: number; // минимальная сумма товаров в корзине (до скидки), ₽
};

export const PROMOS: Promo[] = [
  { code: "колялмх", percent: 10, minTotal: 5000 },
  { code: "алфлмх", percent: 10, minTotal: 5000 },
];

// Не одежда — скидка на них не действует.
const NON_CLOTHING = ["accessory", "sticker"];
export const isClothing = (category: string) => !NON_CLOTHING.includes(category);

export const normalizePromo = (code: string) => code.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, "");

export function findPromo(code: string | undefined | null): Promo | null {
  if (!code) return null;
  const c = normalizePromo(code);
  return PROMOS.find((p) => normalizePromo(p.code) === c) ?? null;
}

type Line = { category: string; price: number; qty: number };

/** Цены за единицу после скидки (в том же порядке) или ошибка. */
export function applyPromo(
  code: string,
  lines: Line[],
): { ok: true; promo: Promo; prices: number[]; discount: number } | { ok: false; error: string } {
  const promo = findPromo(code);
  if (!promo) return { ok: false, error: "Промокод не найден." };
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  if (total < promo.minTotal)
    return { ok: false, error: `Промокод действует для заказов от ${promo.minTotal.toLocaleString("ru-RU")} ₽.` };
  if (!lines.some((l) => isClothing(l.category)))
    return { ok: false, error: "Промокод действует только на одежду." };
  let discount = 0;
  const prices = lines.map((l) => {
    if (!isClothing(l.category)) return l.price;
    const p = Math.round((l.price * (100 - promo.percent)) / 100);
    discount += (l.price - p) * l.qty;
    return p;
  });
  return { ok: true, promo, prices, discount };
}
