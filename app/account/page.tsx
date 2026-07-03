import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { formatPrice, formatDate } from "@/lib/format";
import { orderStatusLabel, deliveryLabel } from "@/lib/constants";
import AccountLogoutButton from "@/components/AccountLogoutButton";

export const metadata = { title: "Личный кабинет — LMH" };

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login");

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { customerId: customer.id },
        { phone: customer.phone },
        { email: customer.email },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono text-xs uppercase tracking-[0.3em] text-accent">Личный кабинет</p>
          <h1 className="display mt-2 text-5xl">Привет, {customer.name}</h1>
        </div>
        <AccountLogoutButton />
      </div>

      {/* Профиль */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-line bg-bg-2 p-5">
          <div className="mono text-xs uppercase tracking-widest text-fg-dim">Телефон</div>
          <div className="mt-1">{customer.phone}</div>
        </div>
        <div className="border border-line bg-bg-2 p-5">
          <div className="mono text-xs uppercase tracking-widest text-fg-dim">E-mail</div>
          <div className="mt-1 break-all">{customer.email}</div>
        </div>
        <div className="border border-line bg-bg-2 p-5">
          <div className="mono text-xs uppercase tracking-widest text-fg-dim">Заказов</div>
          <div className="mt-1 display text-2xl text-accent">{orders.length}</div>
        </div>
      </div>

      {/* Заказы */}
      <h2 className="display mt-12 text-3xl">История заказов</h2>
      {orders.length === 0 ? (
        <div className="mt-4 border border-line bg-bg-2 p-8 text-center">
          <p className="text-fg-dim">Заказов пока нет.</p>
          <Link href="/catalog" className="btn btn-accent mt-6">
            В каталог
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border border-line bg-bg-2 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <span className="mono text-sm">№ {o.number}</span>
                <span className="mono text-xs text-fg-dim">{formatDate(o.createdAt)}</span>
                <span className="mono text-xs uppercase tracking-widest text-accent">
                  {orderStatusLabel(o.status)}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-fg-dim">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span>
                      {it.title} · {it.size} × {it.qty}
                    </span>
                    <span className="mono">{formatPrice(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
                <span className="text-fg-dim">{deliveryLabel(o.deliveryMethod)}</span>
                <span className="display text-lg text-accent">{formatPrice(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
