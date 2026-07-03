import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { deliveryLabel } from "@/lib/constants";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Заказ оформлен — LMH" };

export default async function SupportOrderPage({
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
      <div className="mono text-xs uppercase tracking-[0.3em] text-accent">Заказ принят</div>
      <h1 className="display mt-3 text-4xl md:text-5xl">Оформляем через поддержку</h1>

      {found ? (
        <p className="mt-4 text-fg-dim">
          Спасибо! Заказ <span className="mono text-fg">№ {found.number}</span> создан. Напишите нам
          в Telegram — подберём удобный способ доставки в ваш регион
          {found.deliveryMethod === "intl" ? " / страну" : ""} и согласуем оплату.
        </p>
      ) : (
        <p className="mt-4 text-fg-dim">Спасибо! Напишите нам в Telegram — согласуем доставку и оплату.</p>
      )}

      {found && (
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
            <span>уточняется</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3">
            <span className="display">Сумма товаров</span>
            <span className="display text-accent">{formatPrice(found.itemsTotal)}</span>
          </div>
        </div>
      )}

      <p className="mono mt-8 text-xs uppercase tracking-widest text-fg-dim">
        Напишите в поддержку и укажите номер заказа{found ? ` № ${found.number}` : ""}
      </p>
      <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
        <a href={COMPANY.socials.telegram2} target="_blank" rel="noreferrer" className="btn btn-accent">
          Написать в поддержку
        </a>
        <a href={COMPANY.socials.telegram} target="_blank" rel="noreferrer" className="btn">
          Основной Telegram
        </a>
      </div>
      <Link href="/catalog" className="mono mt-8 block text-xs uppercase tracking-widest text-fg-dim hover:text-fg">
        ← Вернуться в каталог
      </Link>
    </div>
  );
}
