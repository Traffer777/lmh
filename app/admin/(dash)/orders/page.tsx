import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { orderStatusLabel } from "@/lib/constants";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="display text-4xl">Заказы</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-fg-dim">Заказов пока нет. Оформите тестовый заказ на витрине.</p>
      ) : (
        <table className="mt-6 w-full border border-line text-sm">
          <thead className="bg-bg-2 text-left">
            <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
              <th className="p-3">Номер</th>
              <th className="p-3">Дата</th>
              <th className="p-3">Покупатель</th>
              <th className="p-3">Позиций</th>
              <th className="p-3">Статус</th>
              <th className="p-3 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line hover:bg-bg-2">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="mono hover:text-accent">
                    {o.number}
                  </Link>
                </td>
                <td className="mono p-3 text-fg-dim">{formatDate(o.createdAt)}</td>
                <td className="p-3">
                  {o.customerName}
                  <div className="mono text-xs text-fg-dim">{o.phone}</div>
                </td>
                <td className="mono p-3">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
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
