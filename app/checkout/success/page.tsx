import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { deliveryLabel } from "@/lib/constants";

export const metadata = { title: "Заказ оформлен — LMH" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const found = order
    ? await prisma.order.findUnique({ where: { number: order }, include: { items: true } })
    : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
      <div className="mono text-xs uppercase tracking-[0.3em] text-accent">Готово</div>
      <h1 className="display mt-3 text-5xl">Заказ принят</h1>
      {found ? (
        <>
          <p className="mt-4 text-fg-dim">
            Спасибо! Заказ <span className="mono text-fg">№ {found.number}</span> оформлен.
            Мы свяжемся с вами для подтверждения и отправки.
          </p>
          <div className="mx-auto mt-8 max-w-sm border border-line bg-bg-2 p-6 text-left">
            <ul className="space-y-2 text-sm">
              {found.items.map((it) => (
                <li key={it.id} className="flex justify-between text-fg-dim">
                  <span>
                    {it.title} · {it.size} × {it.qty}
                  </span>
                  <span className="mono">{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mono mt-4 flex justify-between border-t border-line pt-3 text-sm text-fg-dim">
              <span>Доставка · {deliveryLabel(found.deliveryMethod)}</span>
              <span>{found.deliveryCost === 0 ? "бесплатно" : formatPrice(found.deliveryCost)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-3">
              <span className="display">Итого</span>
              <span className="display text-accent">{formatPrice(found.total)}</span>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-fg-dim">Спасибо за заказ! Мы свяжемся с вами.</p>
      )}

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/catalog" className="btn btn-accent">
          Продолжить покупки
        </Link>
        <a href="https://t.me/LmhFuckSleep" className="btn" target="_blank" rel="noreferrer">
          Наш Telegram
        </a>
      </div>
    </div>
  );
}
