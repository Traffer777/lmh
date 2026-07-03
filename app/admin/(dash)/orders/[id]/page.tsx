import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { deliveryLabel, paymentLabel } from "@/lib/constants";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent">
        ← Все заказы
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">Заказ {order.number}</h1>
        <span className="mono text-sm text-fg-dim">{formatDate(order.createdAt)}</span>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="border border-line bg-bg-2 p-5">
          <h2 className="mono mb-3 text-xs uppercase tracking-widest text-fg-dim">Покупатель</h2>
          <p>{order.customerName}</p>
          <p className="mono text-sm">{order.phone}</p>
          {order.email && <p className="mono text-sm text-fg-dim">{order.email}</p>}
        </div>
        <div className="border border-line bg-bg-2 p-5">
          <h2 className="mono mb-3 text-xs uppercase tracking-widest text-fg-dim">Доставка и оплата</h2>
          <p>{deliveryLabel(order.deliveryMethod)}</p>
          {order.deliveryAddress && <p className="text-sm text-fg-dim">{order.deliveryAddress}</p>}
          <p className="mono mt-2 text-sm">{paymentLabel(order.paymentMethod)}</p>
          {order.paymentId && <p className="mono text-xs text-fg-dim">ID платежа: {order.paymentId}</p>}
        </div>
      </div>

      {order.comment && (
        <div className="mt-6 border border-line bg-bg-2 p-5">
          <h2 className="mono mb-2 text-xs uppercase tracking-widest text-fg-dim">Комментарий</h2>
          <p className="text-sm">{order.comment}</p>
        </div>
      )}

      <div className="mt-6 border border-line">
        <table className="w-full text-sm">
          <thead className="bg-bg-2 text-left">
            <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
              <th className="p-3">Товар</th>
              <th className="p-3">Размер</th>
              <th className="p-3 text-right">Цена</th>
              <th className="p-3 text-right">Кол-во</th>
              <th className="p-3 text-right">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t border-line">
                <td className="p-3">{it.title}</td>
                <td className="mono p-3">{it.size}</td>
                <td className="mono p-3 text-right">{formatPrice(it.price)}</td>
                <td className="mono p-3 text-right">{it.qty}</td>
                <td className="mono p-3 text-right">{formatPrice(it.price * it.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-end gap-1 text-sm">
        <div className="mono flex w-64 justify-between text-fg-dim">
          <span>Товары</span>
          <span>{formatPrice(order.itemsTotal)}</span>
        </div>
        <div className="mono flex w-64 justify-between text-fg-dim">
          <span>Доставка</span>
          <span>{order.deliveryCost === 0 ? "бесплатно" : formatPrice(order.deliveryCost)}</span>
        </div>
        <div className="flex w-64 justify-between border-t border-line pt-2">
          <span className="display text-lg">Итого</span>
          <span className="display text-lg text-accent">{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mono mb-2 text-xs uppercase tracking-widest text-fg-dim">Статус заказа</h2>
        <OrderStatusSelect id={order.id} status={order.status} />
      </div>
    </div>
  );
}
