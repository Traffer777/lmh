import Link from "next/link";
import { getContestCounter } from "@/lib/contest-counter";

// Верхняя полоса с прогрессом конкурса LMH × ГЛЕБАС.
// Ведёт на страницу /contest с правилами, счётчик — реальные оплаченные заказы из базы.
export default async function ContestBanner() {
  const c = await getContestCounter();
  return (
    <Link
      href="/contest"
      className="block border-b border-line bg-black text-white transition hover:bg-neutral-900"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs uppercase tracking-widest sm:text-sm">
        <span className="font-semibold">🏁 LMH × ГЛЕБАС</span>
        <span className="hidden sm:inline">
          <span className="font-mono">{c.paidOrders}</span>
          {" / "}
          <span className="font-mono">{c.goal}</span> заказов до стразовой Приоры
        </span>
        <span className="sm:hidden font-mono">
          {c.paidOrders}/{c.goal} → 🚗
        </span>
        <span className="underline underline-offset-2">Подробнее →</span>
      </div>
    </Link>
  );
}
