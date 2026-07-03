// Справочники магазина (русский).

export const SIZES = ["XS", "S", "M", "L", "XL", "OS"] as const;
export type Size = (typeof SIZES)[number];

export const CATEGORIES = [
  { value: "top", label: "Верх" },
  { value: "bottom", label: "Низ" },
  { value: "accessory", label: "Аксессуары" },
] as const;

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// Способы доставки. cost — базовый тариф, руб. (демо; в проде — расчёт по API курьера).
export const DELIVERY_METHODS = [
  { value: "cdek", label: "СДЭК (ПВЗ / курьер)", cost: 350, eta: "2–5 дней" },
  { value: "pochta", label: "Почта России", cost: 300, eta: "5–14 дней" },
  { value: "pickup", label: "Самовывоз", cost: 0, eta: "по договорённости" },
  { value: "intl", label: "Беларусь / другие страны", cost: 0, eta: "стоимость согласуем в Telegram" },
  { value: "telegram", label: "Нет СДЭК и Почты рядом — оформить через поддержку", cost: 0, eta: "обсудим индивидуально в Telegram" },
] as const;

// Способы доставки, которые оформляются через поддержку (без онлайн-оплаты на сайте):
// стоимость доставки и оплату согласуем в Telegram.
export const SUPPORT_DELIVERY = ["intl", "telegram"] as const;

export function isSupportDelivery(value: string): boolean {
  return (SUPPORT_DELIVERY as readonly string[]).includes(value);
}

export function deliveryLabel(value: string): string {
  return DELIVERY_METHODS.find((d) => d.value === value)?.label ?? value;
}

export const PAYMENT_METHODS = [
  { value: "sbp", label: "СБП (по QR / телефону)" },
  { value: "card", label: "Карта Мир / банковская карта" },
  { value: "installment", label: "Разделить платеж на 4 части" },
] as const;

export function paymentLabel(value: string): string {
  return PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value;
}

export const ORDER_STATUSES = [
  { value: "new", label: "Новый" },
  { value: "paid", label: "Оплачен" },
  { value: "shipped", label: "Отправлен" },
  { value: "done", label: "Выполнен" },
  { value: "canceled", label: "Отменён" },
] as const;

export function orderStatusLabel(value: string): string {
  return ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const FREE_SHIPPING_THRESHOLD = Number(
  process.env.FREE_SHIPPING_THRESHOLD ?? process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD ?? 15000,
);
