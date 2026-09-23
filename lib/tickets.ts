// LMH × Глебас — расчёт билетов конкурса.
// Правила утверждены владельцем: базовые билеты по категориям, +3 бонусных
// при итоге ≥ 30 000 ₽, ×2 при итоге ≥ 50 000 ₽. Реальные категории в БД:
// tshirt, longsleeve, hoodie, pants, shorts, suit, accessory (+ puffer/jacket на будущее).

const PER_UNIT: Record<string, number> = {
  tshirt: 1,
  top: 1,
  longsleeve: 1,
  shorts: 1,
  pants: 1,
  bottom: 1,
  accessory: 1,
  sticker: 1,
  футболка: 1,
  штаны: 1,
  hoodie: 2,
  худи: 2,
  suit: 2,
  костюм: 2,
  puffer: 4,
  jacket: 4,
  куртка: 4,
};

export const TICKET_BONUS_THRESHOLD = 30000;
export const TICKET_MULTIPLIER_THRESHOLD = 50000;
export const TICKET_BONUS_FLAT = 3;
export const TICKET_MULTIPLIER = 2;

export function ticketsPerUnit(category: string | null | undefined): number {
  if (!category) return 0;
  return PER_UNIT[category] ?? 0;
}

export type TicketItem = { category: string | null | undefined; qty: number };

export type TicketBreakdown = {
  base: number;
  bonusFlat: number;
  multiplier: number;
  total: number;
  nextGoal: null | { addRub: number; kind: "bonus" | "multiplier" };
};

export function ticketsForOrder(items: TicketItem[], totalRub: number): TicketBreakdown {
  const base = items.reduce((s, i) => s + ticketsPerUnit(i.category) * (i.qty || 0), 0);
  const bonusFlat = totalRub >= TICKET_BONUS_THRESHOLD ? TICKET_BONUS_FLAT : 0;
  const multiplier = totalRub >= TICKET_MULTIPLIER_THRESHOLD ? TICKET_MULTIPLIER : 1;
  const total = (base + bonusFlat) * multiplier;

  let nextGoal: TicketBreakdown["nextGoal"] = null;
  if (totalRub < TICKET_BONUS_THRESHOLD) {
    nextGoal = { addRub: TICKET_BONUS_THRESHOLD - totalRub, kind: "bonus" };
  } else if (totalRub < TICKET_MULTIPLIER_THRESHOLD) {
    nextGoal = { addRub: TICKET_MULTIPLIER_THRESHOLD - totalRub, kind: "multiplier" };
  }

  return { base, bonusFlat, multiplier, total, nextGoal };
}
