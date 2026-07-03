import { COMPANY } from "@/lib/company";

export const metadata = { title: "Публичная оферта — LMH" };

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="display text-4xl md:text-5xl">Публичная оферта</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg-dim">
        <section>
          <h2 className="display text-xl text-fg">1. Общие положения</h2>
          <p className="mt-2">
            Настоящий документ является публичной офертой {COMPANY.status}{" "}
            {COMPANY.legalName} (ИНН {COMPANY.inn}, ОГРНИП {COMPANY.ogrnip})
            (далее — «Продавец») и определяет условия покупки товаров на сайте
            лмх.com. Оформление заказа означает согласие покупателя с условиями
            оферты.
          </p>
        </section>
        <section>
          <h2 className="display text-xl text-fg">2. Товар и цена</h2>
          <p className="mt-2">
            Товаром являются предметы одежды и аксессуары бренда LMH. Цены указаны
            в рублях и включают все налоги. Продавец вправе изменять цены до момента
            оформления заказа.
          </p>
        </section>
        <section>
          <h2 className="display text-xl text-fg">3. Оплата</h2>
          <p className="mt-2">
            Оплата производится онлайн через платёжный сервис ЮKassa (СБП, карты
            «Мир» и иные банковские карты) либо через сервис «Долями» от Т-Банка
            (оплата в 4 части). Заказ считается оплаченным после подтверждения платежа.
          </p>
        </section>
        <section>
          <h2 className="display text-xl text-fg">4. Доставка</h2>
          <p className="mt-2">
            Доставка осуществляется службами СДЭК, Почта России, Boxberry, курьером
            или самовывозом. Сроки и стоимость указаны на странице «Доставка и
            оплата».
          </p>
        </section>
        <section>
          <h2 className="display text-xl text-fg">5. Возврат</h2>
          <p className="mt-2">
            Возврат товара надлежащего качества возможен в течение 14 дней при
            сохранении товарного вида согласно Закону РФ «О защите прав
            потребителей».
          </p>
        </section>
        <section>
          <h2 className="display text-xl text-fg">6. Реквизиты продавца</h2>
          <p className="mt-2">
            {COMPANY.status} {COMPANY.legalName}
            <br />
            ИНН {COMPANY.inn}, ОГРНИП {COMPANY.ogrnip}
            <br />
            Телефон: {COMPANY.phone}, e-mail: {COMPANY.email}
          </p>
        </section>
      </div>
    </div>
  );
}
