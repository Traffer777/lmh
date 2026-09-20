import type { Metadata } from "next";
import Link from "next/link";
import { getContestCounter } from "@/lib/contest-counter";

export const metadata: Metadata = {
  title: "LMH × ГЛЕБАС — розыгрыш стразовой Приоры",
  description:
    "Купи мерч LMH — получи билеты на розыгрыш стразовой Приоры. При 1000 оплаченных заказов запускаем финальный розыгрыш.",
};

export const revalidate = 30;

const PRIZES = [
  { at: 100, title: "Мерч-пак LMH", note: "Стартовый приз — набор из свежего дропа" },
  { at: 250, title: "Лимитка", note: "Эксклюзивная вещь из будущего дропа" },
  { at: 500, title: "Встреча с Глебасом", note: "Личная встреча + подписанная вещь" },
  { at: 750, title: "Совместная съёмка", note: "Камео в клипе / съёмке с Глебасом" },
  { at: 1000, title: "🚗 СТРАЗОВАЯ ПРИОРА", note: "Главный приз — та самая" },
];

const TICKETS = [
  { cat: "Футболка / лонгслив", n: 1 },
  { cat: "Шорты / штаны", n: 1 },
  { cat: "Аксессуар / стикер", n: 1 },
  { cat: "Худи / зип / костюм", n: 2 },
  { cat: "Куртка / пуховик", n: 4 },
];

export default async function ContestRulesPage() {
  const c = await getContestCounter();
  const progress = Math.min(100, (c.paidOrders / c.goal) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <p className="mono text-xs uppercase tracking-widest text-fg-dim">Розыгрыш</p>
      <h1 className="display mt-2 text-5xl leading-none md:text-7xl">
        LMH × <span className="text-accent">ГЛЕБАС</span>
      </h1>
      <p className="display mt-2 text-3xl md:text-5xl">Стразовая Приора</p>

      <div className="mt-8 border border-line bg-bg-2 p-6">
        <div className="mono flex items-baseline justify-between text-sm">
          <span className="text-fg-dim">Прогресс</span>
          <span>
            <span className="text-accent">{c.paidOrders}</span> / {c.goal} заказов
          </span>
        </div>
        <div className="mt-3 h-2 w-full bg-bg-3">
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <p className="mono mt-3 text-xs text-fg-dim">
          Финальный розыгрыш стартует, когда мы вместе оплатим 1000 заказов LMH.
        </p>
      </div>

      <a
        href="https://t.me/lmhworldwide_bot?start=contest"
        target="_blank"
        rel="noopener"
        className="btn btn-accent mt-6"
      >
        Участвовать через Telegram-бота →
      </a>

      <section className="mt-14">
        <h2 className="display text-3xl">Как участвовать</h2>
        <ol className="mono mt-4 space-y-2 text-sm">
          <li>1. Открой @lmhworldwide_bot — получи свой номер участника (например #01842).</li>
          <li>
            2. Подпишись на LIVE-канал розыгрыша — +1 билет за бесплатный вход.
          </li>
          <li>
            3. Купи мерч LMH — при оформлении укажи Telegram-ID в отдельном поле, билеты
            начислятся автоматически после оплаты.
          </li>
          <li>4. При 1000 оплаченных заказов — тянем главный приз.</li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="display text-3xl">Билеты за товары</h2>
        <div className="mt-4 border border-line">
          {TICKETS.map((t) => (
            <div key={t.cat} className="flex justify-between border-b border-line px-4 py-3 last:border-b-0 text-sm">
              <span>{t.cat}</span>
              <span className="mono text-accent">+{t.n} билет{t.n > 1 ? "а" : ""}</span>
            </div>
          ))}
        </div>
        <p className="mono mt-3 text-xs text-fg-dim">Билеты за все позиции суммируются.</p>
      </section>

      <section className="mt-12">
        <h2 className="display text-3xl">Бонусы за корзину</h2>
        <ul className="mono mt-4 space-y-2 text-sm">
          <li>
            <span className="text-accent">≥ 30 000 ₽</span> — +3 бонусных билета к заказу.
          </li>
          <li>
            <span className="text-accent">≥ 50 000 ₽</span> — <span className="text-accent">×2</span> ко всей
            сумме билетов заказа.
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="display text-3xl">Призы по вехам</h2>
        <div className="mt-4 border border-line">
          {PRIZES.map((p) => {
            const done = c.paidOrders >= p.at;
            return (
              <div
                key={p.at}
                className={`flex items-start justify-between gap-4 border-b border-line px-4 py-4 last:border-b-0 ${
                  done ? "bg-accent/10" : ""
                }`}
              >
                <div>
                  <p className="display text-xl">
                    {done ? "✓ " : ""}
                    {p.at} заказов — {p.title}
                  </p>
                  <p className="mono mt-1 text-xs text-fg-dim">{p.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-8 text-sm text-fg-dim">
        <h2 className="display text-2xl text-fg">Правила и юридическое</h2>
        <p className="mt-3">
          Розыгрыш проводится LMH совместно с Глебасом. Победитель определяется случайным образом
          среди всех выданных билетов после достижения отметки в 1000 оплаченных заказов.
          Стоимость приза, порядок передачи и налоги — по договорённости с победителем.
        </p>
        <p className="mt-3">
          Возврат/отмена заказа списывает начисленные по нему билеты. Использование фейковых
          Telegram-аккаунтов и накрутка билетов — дисквалификация.
        </p>
        <p className="mt-6">
          <Link href="/catalog" className="underline">
            Смотреть каталог
          </Link>{" "}
          ·{" "}
          <a
            href="https://t.me/lmhworldwide_bot?start=contest"
            target="_blank"
            rel="noopener"
            className="underline"
          >
            Открыть бота
          </a>
        </p>
      </section>
    </div>
  );
}
