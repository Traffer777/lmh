// Лимитированные по времени релизы: товар доступен только до даты `until`.
// Реализовано в коде (без колонки в БД). ПРИ ДЕПЛОЕ переставь `until` = день запуска + 7 дней,
// чтобы отсчёт «только 7 дней» начался с момента публикации на лмх.com.

export const LIMITED_UNTIL: Record<string, string> = {
  // Футболка CTRL+V Gold — 7 дней (сейчас плейсхолдер от даты сборки; сбросить на деплое)
  "ctrl-v-gold-tee": "2026-08-03T23:59:59+03:00",
};

export function limitedUntil(slug: string): string | null {
  return LIMITED_UNTIL[slug] ?? null;
}

/** Осталось полных дней (floor), null — если товар не лимитирован по времени. */
export function limitedDaysLeft(slug: string): number | null {
  const u = LIMITED_UNTIL[slug];
  if (!u) return null;
  const ms = new Date(u).getTime() - Date.now();
  return ms <= 0 ? 0 : Math.floor(ms / 86_400_000);
}

/** Завершён ли лимит по времени (для скрытия покупки). */
export function limitedEnded(slug: string): boolean {
  const u = LIMITED_UNTIL[slug];
  return u ? Date.now() > new Date(u).getTime() : false;
}
