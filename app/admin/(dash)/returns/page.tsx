import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { returnKindLabel, returnStatusLabel } from "@/lib/returns";

export default async function AdminReturns() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { select: { number: true } } },
  });

  return (
    <div>
      <h1 className="display text-4xl">Возвраты</h1>
      <p className="mt-2 text-sm text-fg-dim">
        Заявки с формы /returns. Каждая должна прийти письмом на почту — сверяйте по номеру В-XXXX в теме.
      </p>

      {returns.length === 0 ? (
        <p className="mt-6 text-fg-dim">Заявок на возврат пока нет.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-line text-sm">
            <thead className="bg-bg-2 text-left">
              <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
                <th className="p-3">Номер</th>
                <th className="p-3">Дата</th>
                <th className="p-3">Заказ</th>
                <th className="p-3">Тип</th>
                <th className="p-3">Покупатель</th>
                <th className="p-3">Статус</th>
                <th className="p-3 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-t border-line hover:bg-bg-2">
                  <td className="p-3">
                    <Link href={`/admin/returns/${r.id}`} className="mono hover:text-accent">
                      {r.number}
                    </Link>
                  </td>
                  <td className="mono p-3 text-fg-dim">{formatDate(r.createdAt)}</td>
                  <td className="mono p-3">
                    <Link href={`/admin/orders/${r.orderId}`} className="hover:text-accent">
                      {r.order.number}
                    </Link>
                  </td>
                  <td className="p-3">{returnKindLabel(r.kind)}</td>
                  <td className="p-3">
                    {r.customerName}
                    <div className="mono text-xs text-fg-dim">{r.phone}</div>
                  </td>
                  <td className="p-3">{returnStatusLabel(r.status)}</td>
                  <td className="mono p-3 text-right">{formatPrice(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
