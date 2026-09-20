import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { deliveryLabel } from "@/lib/constants";
import { isPaymentSucceeded } from "@/lib/yookassa";
import { markOrderPaid } from "@/lib/orders";
import CdekTrack from "@/components/CdekTrack";

export const metadata = { title: "Заказ — LMH" };

// Статусы, при которых заказ считается оплаченным.
const PAID_STATUSES = ["paid", "shipped", "done"];

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const found = order
    ? await prisma.order.findUnique({ where: { number: order }, include: { items: true } })
    : null;

  // ЮKassa редиректит сюда после ЛЮБОЙ попытки оплаты (в т.ч. отменённой),
  // поэтому не доверяем самому факту перехода — проверяем статус.
  let paid = found ? PAID_STATUSES.includes(found.status) : false;

  // Вебхук мог не успеть — если заказ ещё не помечен оплаченным, спрашиваем
  // ЮKassa напрямую по id платежа и, если оплата прошла, отмечаем заказ.
  if (found && !paid && found.paymentId && !found.paymentId.startsWith("mock-")) {
    if (await isPaymentSucceeded(found.paymentId)) {
      await markOrderPaid(found.number, found.paymentId);
      paid = true;
    }
  }

  // Заказ есть, но оплата не подтверждена — не пишем «принят».
  if (found && !paid) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
        <div className="mono text-xs uppercase tracking-[0.3em] text-fg-dim">Ожидаем оплату</div>
        <h1 className="display mt-3 text-5xl">Заказ не оплачен</h1>
        <p className="mt-4 text-fg-dim">
          Заказ <span className="mono text-fg">№ {found.number}</span> создан, но оплата пока
          не поступила. Если вы прервали оплату — повторите её. Заказ мы соберём и отправим
          только после поступления оплаты.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/cart" className="btn btn-accent">
            Вернуться в корзину
          </Link>
          <a href="https://t.me/LmhFuckSleep" className="btn" target="_blank" rel="noreferrer">
            Написать в Telegram
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
      <div className="mono text-xs uppercase tracking-[0.3em] text-accent">Оплачено</div>
      <h1 className="display mt-3 text-5xl">Заказ оплачен</h1>
      {found ? (
        <>
          <p className="mt-4 text-fg-dim">
            Спасибо! Заказ <span className="mono text-fg">№ {found.number}</span> оплачен и принят
            в работу. Мы соберём его и свяжемся с вами для отправки.
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
          {found.deliveryMethod === "cdek" && (
            <CdekTrack orderNumber={found.number} initialTrack={found.trackNumber} />
          )}
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
