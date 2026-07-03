import { DELIVERY_METHODS, PAYMENT_METHODS, isSupportDelivery } from "@/lib/constants";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Доставка и оплата — LMH" };

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent">Доставка и оплата</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Как получить заказ</h1>

      <h2 className="display mt-12 text-2xl">Способы доставки</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {DELIVERY_METHODS.map((d) => (
          <div key={d.value} className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="font-semibold">{d.label}</div>
              <div className="mono text-xs text-fg-dim">Срок: {d.eta}</div>
            </div>
            <div className="mono whitespace-nowrap text-sm">
              {isSupportDelivery(d.value)
                ? "уточняется"
                : d.cost === 0
                  ? "бесплатно"
                  : `от ${d.cost} ₽`}
            </div>
          </div>
        ))}
      </div>
      <p className="mono mt-4 text-sm text-accent">
        Бесплатная доставка по России при заказе от 15 000 ₽.
      </p>

      {/* Международная доставка + поддержка */}
      <h2 className="display mt-12 text-2xl">Беларусь и другие страны</h2>
      <p className="mt-4 text-sm text-fg-dim">
        Доставляем в Беларусь, Казахстан и другие страны. При оформлении выберите способ
        «Беларусь / другие страны» — стоимость доставки рассчитаем индивидуально и согласуем
        с вами в Telegram.
      </p>

      <h2 className="display mt-12 text-2xl">Нет СДЭК или Почты рядом?</h2>
      <p className="mt-4 text-sm text-fg-dim">
        Если в вашем городе нет пунктов СДЭК и Почты России — это не проблема. Выберите при
        оформлении способ «Оформить через поддержку», и мы подберём удобный для вас вариант
        доставки и согласуем оплату прямо в Telegram. Заказ оформляется на сайте, а детали
        доставки и оплаты обсудим лично.
      </p>
      <a
        href={COMPANY.socials.telegram2}
        target="_blank"
        rel="noreferrer"
        className="btn btn-accent mt-6"
      >
        Написать в поддержку
      </a>

      <h2 className="display mt-12 text-2xl">Оплата</h2>
      <ul className="mt-4 space-y-2 text-fg-dim">
        {PAYMENT_METHODS.map((p) => (
          <li key={p.value} className="flex gap-2">
            <span className="text-accent">/</span> {p.label}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-fg-dim">
        Оплата проходит через защищённые платёжные сервисы ЮKassa (СБП, карты) и
        «Долями» от Т-Банка (оплата в 4 части). Мы не храним данные ваших карт.
        При доставке через поддержку оплату согласуем в Telegram.
      </p>

      <h2 className="display mt-12 text-2xl">Возврат</h2>
      <p className="mt-4 text-sm text-fg-dim">
        Вернуть товар надлежащего качества можно в течение 14 дней с момента
        получения, если сохранены товарный вид, бирки и упаковка. По вопросам
        возврата пишите в Telegram или на почту — поможем.
      </p>
    </div>
  );
}
