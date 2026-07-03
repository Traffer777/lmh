import { notFound } from "next/navigation";
import MockPay from "@/components/MockPay";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { paymentLabel, deliveryLabel } from "@/lib/constants";

export const metadata = { title: "Оплата (демо) — LMH" };

export default async function MockPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  if (!order) notFound();
  const found = await prisma.order.findUnique({ where: { number: order } });
  if (!found) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-16 md:px-6">
      <div className="mono mb-2 text-xs uppercase tracking-widest text-fg-dim">
        Демо-оплата · режим mock
      </div>
      <div className="border border-line bg-bg-2 p-6">
        <h1 className="display text-3xl">Оплата заказа</h1>
        <p className="mono mt-1 text-sm text-fg-dim">№ {found.number}</p>

        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-fg-dim">
            <span>Способ оплаты</span>
            <span className="text-fg">{paymentLabel(found.paymentMethod)}</span>
          </div>
          <div className="flex justify-between text-fg-dim">
            <span>Доставка</span>
            <span className="text-fg">{deliveryLabel(found.deliveryMethod)}</span>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
          <span className="display text-xl">К оплате</span>
          <span className="display text-2xl text-accent">{formatPrice(found.total)}</span>
        </div>

        <MockPay number={found.number} />

        <p className="mono mt-6 text-[10px] uppercase leading-relaxed tracking-widest text-fg-dim">
          Это демонстрационная страница. В боевом режиме здесь будет окно ЮKassa
          с оплатой по СБП и картам Мир.
        </p>
      </div>
    </div>
  );
}
