import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAID_STATUSES = ["paid", "shipped", "done"];

type Row = {
  name: string;
  phone: string;
  email: string | null;
  hasAccount: boolean;
  createdAt: Date | null;
  orderCount: number;
  paidTotal: number;
  lastOrder: Date | null;
};

function phoneKey(p: string): string {
  return p.replace(/\D/g, "");
}

export default async function AdminCustomers() {
  const [customers, orders] = await Promise.all([
    prisma.customer.findMany({ include: { orders: true }, orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // Заказы по каждому клиенту (по нормализованному телефону).
  const ordersByPhone = new Map<string, typeof orders>();
  for (const o of orders) {
    const k = phoneKey(o.phone);
    if (!k) continue;
    (ordersByPhone.get(k) ?? ordersByPhone.set(k, []).get(k)!).push(o);
  }

  const rows = new Map<string, Row>();

  // Зарегистрированные клиенты.
  for (const c of customers) {
    const k = phoneKey(c.phone);
    const custOrders = ordersByPhone.get(k) ?? [];
    rows.set(k, {
      name: c.name,
      phone: c.phone,
      email: c.email,
      hasAccount: true,
      createdAt: c.createdAt,
      orderCount: custOrders.length,
      paidTotal: custOrders
        .filter((o) => PAID_STATUSES.includes(o.status))
        .reduce((s, o) => s + o.total, 0),
      lastOrder: custOrders[0]?.createdAt ?? null,
    });
  }

  // Гости, оформлявшие заказ без кабинета.
  for (const [k, list] of ordersByPhone) {
    if (rows.has(k)) continue;
    const latest = list[0];
    rows.set(k, {
      name: latest.customerName,
      phone: latest.phone,
      email: latest.email,
      hasAccount: false,
      createdAt: null,
      orderCount: list.length,
      paidTotal: list
        .filter((o) => PAID_STATUSES.includes(o.status))
        .reduce((s, o) => s + o.total, 0),
      lastOrder: latest.createdAt,
    });
  }

  const list = [...rows.values()].sort(
    (a, b) => (b.lastOrder?.getTime() ?? 0) - (a.lastOrder?.getTime() ?? 0),
  );

  const withAccount = list.filter((r) => r.hasAccount).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="display text-4xl">Клиенты</h1>
        <p className="mono text-xs uppercase tracking-widest text-fg-dim">
          Всего: {list.length} · с кабинетом: {withAccount}
        </p>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-fg-dim">Клиентов пока нет.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-line text-sm">
            <thead className="bg-bg-2 text-left">
              <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
                <th className="p-3">Имя</th>
                <th className="p-3">Телефон</th>
                <th className="p-3">Email</th>
                <th className="p-3">Кабинет</th>
                <th className="p-3 text-center">Заказов</th>
                <th className="p-3 text-right">Оплачено</th>
                <th className="p-3">Последний заказ</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.phone} className="border-t border-line hover:bg-bg-2">
                  <td className="p-3">{r.name}</td>
                  <td className="mono p-3 text-fg-dim">{r.phone}</td>
                  <td className="mono p-3 text-fg-dim">{r.email ?? "—"}</td>
                  <td className="p-3">
                    {r.hasAccount ? (
                      <span className="text-accent-2">есть</span>
                    ) : (
                      <span className="text-fg-dim">гость</span>
                    )}
                  </td>
                  <td className="mono p-3 text-center">{r.orderCount}</td>
                  <td className="mono p-3 text-right">{formatPrice(r.paidTotal)}</td>
                  <td className="mono p-3 text-fg-dim">
                    {r.lastOrder ? formatDate(r.lastOrder) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
