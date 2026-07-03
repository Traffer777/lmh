// Общие настройки для всех платёжных провайдеров (ЮKassa, Т-Банк «Долями»):
// единый переключатель режима и базовый URL сайта для callback'ов.

export function paymentMode(): "mock" | "test" | "live" {
  const m = (process.env.PAYMENT_MODE ?? "mock").toLowerCase();
  return m === "live" ? "live" : m === "test" ? "test" : "mock";
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
