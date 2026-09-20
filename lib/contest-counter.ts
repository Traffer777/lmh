// Читает счётчик конкурса LMH × Глебас с бот-сервера.
// Магазин ничего не считает сам — вся правда о заказах у бота.

export type ContestCounter = {
  paidOrders: number;
  goal: number;
  totalTickets: number;
};

const DEFAULT: ContestCounter = { paidOrders: 0, goal: 1000, totalTickets: 0 };

export async function getContestCounter(): Promise<ContestCounter> {
  const api = process.env.LMH_BOT_API;
  if (!api) return DEFAULT;
  try {
    const res = await fetch(`${api.replace(/\/$/, "")}/counter`, {
      next: { revalidate: 10 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return DEFAULT;
    const data = (await res.json()) as Partial<ContestCounter>;
    return {
      paidOrders: Number(data.paidOrders) || 0,
      goal: Number(data.goal) || 1000,
      totalTickets: Number(data.totalTickets) || 0,
    };
  } catch {
    return DEFAULT;
  }
}
