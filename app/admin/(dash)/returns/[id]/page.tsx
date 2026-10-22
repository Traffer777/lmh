import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/format";
import { paymentLabel } from "@/lib/constants";
import { RETURNS_EMAIL, returnKindLabel } from "@/lib/returns";
import ReturnControls from "@/components/admin/ReturnControls";

export default async function AdminReturn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.returnRequest.findUnique({ where: { id: Number(id) }, include: { order: true } });
  if (!r) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/returns" className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-fg">
        ← Все возвраты
      </Link>
      <h1 className="display mt-3 text-4xl">
        {r.number} · {returnKindLabel(r.kind)}
      </h1>
      <p className="mono mt-1 text-sm text-fg-dim">
        {formatDate(r.createdAt)} · заказ{" "}
        <Link href={`/admin/orders/${r.orderId}`} className="text-fg hover:text-accent">
          {r.order.number}
        </Link>{" "}
        · оплата: {paymentLabel(r.order.paymentMethod)}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="border border-line p-5">
          <h2 className="mono text-xs uppercase tracking-widest text-fg-dim">Покупатель</h2>
          <p className="mt-2">{r.customerName}</p>
          <p className="mono text-sm text-fg-dim">{r.phone}</p>
          <p className="mono text-sm text-fg-dim">{r.email}</p>
        </section>
        <section className="border border-line p-5">
          <h2 className="mono text-xs uppercase tracking-widest text-fg-dim">Товары</h2>
          <p className="mt-2 whitespace-pre-line text-sm">{r.items}</p>
          <p className="display mt-3 text-accent">{formatPrice(r.amount)}</p>
        </section>
      </div>

      <section className="mt-6 border border-line p-5">
        <h2 className="mono text-xs uppercase tracking-widest text-fg-dim">Причина</h2>
        <p className="mt-2 whitespace-pre-line text-sm">{r.reason}</p>
      </section>

      <section className="mt-6 border border-line p-5">
        <h2 className="mono text-xs uppercase tracking-widest text-fg-dim">Решение</h2>
        <p className="mb-4 mt-1 text-xs text-fg-dim">
          Письмо с фото ищите на {RETURNS_EMAIL} по теме «Заявление {r.number}». Деньги возвращаются тем же
          способом через личный кабинет ЮKassa.
        </p>
        <ReturnControls id={r.id} status={r.status} note={r.adminNote ?? ""} />
      </section>
    </div>
  );
}
