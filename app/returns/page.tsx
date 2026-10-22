import ReturnForm from "@/components/ReturnForm";
import { RETURNS_EMAIL, RETURN_DAYS } from "@/lib/returns";

export const metadata = { title: "Возврат и обмен — LMH" };

const STEPS = [
  ["Заполните форму", "Найдите заказ по номеру и телефону, отметьте товары и укажите причину."],
  ["Отправьте заявление на почту", `Форма соберёт готовый текст — отправьте его на ${RETURNS_EMAIL} и приложите фото товара и бирок.`],
  ["Дождитесь ответа", "Ответим на e-mail в течение 3 рабочих дней и пришлём адрес для отправки товара."],
  ["Отправьте товар", "СДЭК или Почтой России. После получения и проверки вернём деньги или отправим обмен."],
];

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent">Возврат и обмен</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Оформить возврат</h1>

      <div className="mt-8 border border-accent bg-accent/10 p-5 text-sm">
        <b>Возвраты и обмены принимаем только письменным заявлением на почту</b>{" "}
        <a href={`mailto:${RETURNS_EMAIL}`} className="mono text-accent underline">
          {RETURNS_EMAIL}
        </a>
        . В Telegram и ВКонтакте заявки на возврат не рассматриваются — так ни одно обращение не потеряется,
        а у каждого будет номер и письменный ответ. Заказы оформляются только на сайте.
      </div>

      <h2 className="display mt-12 text-2xl">Как это работает</h2>
      <ol className="mt-4 divide-y divide-line border-y border-line">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="flex gap-4 py-4">
            <span className="display text-2xl text-accent">{i + 1}</span>
            <div>
              <div className="font-semibold">{t}</div>
              <div className="text-sm text-fg-dim">{d}</div>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="display mt-12 text-2xl">Условия</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-fg-dim">
        <li>
          Товар надлежащего качества можно вернуть или обменять в течение {RETURN_DAYS} дней с момента получения, если
          сохранены товарный вид, бирки и упаковка, вещь не носилась.
        </li>
        <li>Обратную доставку товара надлежащего качества оплачивает покупатель.</li>
        <li>
          Брак или недостаток — пишите сразу, как обнаружили. Проверим по фото; если брак подтвердится, доставку
          оплатим мы.
        </li>
        <li>
          Деньги возвращаем тем же способом, которым оплачен заказ, в течение 10 дней после получения заявления и
          товара.
        </li>
        <li>Возврат возможен только по заказам, оформленным и оплаченным на сайте.</li>
      </ul>

      <h2 className="display mt-12 text-2xl">Заявление</h2>
      <div className="mt-4">
        <ReturnForm />
      </div>

      <p className="mt-6 text-sm text-fg-dim">
        Удобнее заполнить вручную? Скачайте бланк{" "}
        <a href="/docs/lmh-zayavlenie-vozvrat.pdf" download className="text-accent underline">
          PDF
        </a>{" "}
        или{" "}
        <a href="/docs/lmh-zayavlenie-vozvrat.docx" download className="text-accent underline">
          Word
        </a>
        , заполните и пришлите на{" "}
        <a href={`mailto:${RETURNS_EMAIL}`} className="mono text-accent underline">
          {RETURNS_EMAIL}
        </a>{" "}
        вместе с фото товара.
      </p>
    </div>
  );
}
