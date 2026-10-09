import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { orderStatusLabel } from "@/lib/constants";
import SeedAw25Button from "@/components/admin/SeedAw25Button";

export default async function AdminDashboard() {
  const [products, drops, orders, paid, recent] = await Promise.all([
    prisma.product.count(),
    prisma.drop.count(),
    prisma.order.count(),
    prisma.order.findMany({ where: { status: { in: ["paid", "shipped", "done"] } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  const revenue = paid.reduce((s, o) => s + o.total, 0);

  // Выручка по кварталам (по московскому времени), новые сверху.
  const byQuarter = new Map<string, { year: number; q: number; sum: number; count: number }>();
  for (const o of paid) {
    const msk = new Date(o.createdAt.getTime() + 3 * 3_600_000);
    const year = msk.getUTCFullYear();
    const q = Math.floor(msk.getUTCMonth() / 3) + 1;
    const key = `${year}-${q}`;
    const row = byQuarter.get(key) ?? { year, q, sum: 0, count: 0 };
    row.sum += o.total;
    row.count += 1;
    byQuarter.set(key, row);
  }
  const quarters = [...byQuarter.values()].sort((a, b) => b.year - a.year || b.q - a.q);

  const cards = [
    { n: products, t: "товаров", href: "/admin/products" },
    { n: drops, t: "дропов", href: "/admin/products" },
    { n: orders, t: "заказов", href: "/admin/orders" },
    { n: formatPrice(revenue), t: "выручка (оплачено)", href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="display text-4xl">Сводка</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.t} href={c.href} className="border border-line bg-bg-2 p-6 hover:border-accent">
            <div className="display text-3xl text-accent">{c.n}</div>
            <div className="mono mt-1 text-xs uppercase tracking-widest text-fg-dim">{c.t}</div>
          </Link>
        ))}
      </div>

      <SeedAw25Button />

      <h2 className="display mt-10 text-2xl">Выручка по кварталам</h2>
      {quarters.length === 0 ? (
        <p className="mt-4 text-fg-dim">Оплаченных заказов пока нет.</p>
      ) : (
        <table className="mt-4 w-full border border-line text-sm">
          <thead className="bg-bg-2 text-left">
            <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
              <th className="p-3">Квартал</th>
              <th className="p-3 text-right">Заказов</th>
              <th className="p-3 text-right">Средний чек</th>
              <th className="p-3 text-right">Выручка</th>
            </tr>
          </thead>
          <tbody>
            {quarters.map((r) => (
              <tr key={`${r.year}-${r.q}`} className="border-t border-line">
                <td className="mono p-3">
                  Q{r.q} {r.year}
                </td>
                <td className="mono p-3 text-right">{r.count}</td>
                <td className="mono p-3 text-right text-fg-dim">
                  {formatPrice(Math.round(r.sum / r.count))}
                </td>
                <td className="mono p-3 text-right text-accent">{formatPrice(r.sum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="display text-2xl">Последние заказы</h2>
        <Link href="/admin/orders" className="mono text-xs uppercase tracking-widest hover:text-accent">
          Все заказы →
        </Link>
      </div>

      {recent.length === 0 ? (
        <p className="mt-4 text-fg-dim">Заказов пока нет.</p>
      ) : (
        <table className="mt-4 w-full border border-line text-sm">
          <thead className="bg-bg-2 text-left">
            <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
              <th className="p-3">Номер</th>
              <th className="p-3">Дата</th>
              <th className="p-3">Покупатель</th>
              <th className="p-3">Статус</th>
              <th className="p-3 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-line hover:bg-bg-2">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="mono hover:text-accent">
                    {o.number}
                  </Link>
                </td>
                <td className="mono p-3 text-fg-dim">{formatDate(o.createdAt)}</td>
                <td className="p-3">{o.customerName}</td>
                <td className="p-3">{orderStatusLabel(o.status)}</td>
                <td className="mono p-3 text-right">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
