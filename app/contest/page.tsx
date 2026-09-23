import type { Metadata } from "next";
import Link from "next/link";
import ContestProgress from "@/components/ContestProgress";

export const metadata: Metadata = {
  title: "LMH × ГЛЕБАС — розыгрыш стразовой Приоры",
  description:
    "Купи одежду из коллекции LMH × ГЛЕБАС — получи билеты на розыгрыш стразовой Приоры. При 1000 оплаченных заказов запускаем финальный розыгрыш.",
};

const TICKETS = [
  { cat: "Футболка / лонгслив", n: 1 },
  { cat: "Шорты / штаны", n: 1 },
  { cat: "Аксессуар / стикер", n: 1 },
  { cat: "Худи / зип / костюм", n: 2 },
  { cat: "Куртка / пуховик", n: 4 },
];

export default function ContestRulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <p className="mono text-xs uppercase tracking-widest text-fg-dim">Розыгрыш</p>
      <h1 className="display mt-2 text-5xl leading-none md:text-7xl">
        LMH × <span className="text-accent">ГЛЕБАС</span>
      </h1>
      <p className="display mt-2 text-3xl md:text-5xl">Стразовая Приора</p>

      <ContestProgress />

      <p className="mono mt-6 border border-accent/40 bg-accent/10 p-4 text-sm">
        ⚠️ В розыгрыше участвуют <span className="text-accent">только покупки одежды из коллекции LMH × ГЛЕБАС</span>.
        Остальной ассортимент LMH в счёт заказов и билетов не идёт.
      </p>

      <Link href="/drops/glebas" className="btn btn-accent mt-6">
        Смотреть коллекцию LMH × ГЛЕБАС →
      </Link>

      <section className="mt-14">
        <h2 className="display text-3xl">Как участвовать</h2>
        <ol className="mono mt-4 space-y-2 text-sm">
          <li>
            1. Купи одежду из коллекции LMH × ГЛЕБАС — при оформлении можешь указать Telegram в
            отдельном поле, билеты начислятся автоматически после оплаты.
          </li>
          <li>2. Следи за счётчиком на этой странице — он считает оплаченные заказы LMH × ГЛЕБАС в реальном времени.</li>
          <li>3. При 1000 оплаченных заказов — тянем главный приз.</li>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="display text-3xl">Билеты за товары LMH × ГЛЕБАС</h2>
        <div className="mt-4 border border-line">
          {TICKETS.map((t) => (
            <div key={t.cat} className="flex justify-between border-b border-line px-4 py-3 last:border-b-0 text-sm">
              <span>{t.cat}</span>
              <span className="mono text-accent">+{t.n} билет{t.n > 1 ? "а" : ""}</span>
            </div>
          ))}
        </div>
        <p className="mono mt-3 text-xs text-fg-dim">
          Билеты начисляются только за товары коллекции LMH × ГЛЕБАС в заказе, за все такие позиции суммируются.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="display text-3xl">Бонусы за корзину</h2>
        <ul className="mono mt-4 space-y-2 text-sm">
          <li>
            <span className="text-accent">≥ 30 000 ₽</span> товарами LMH × ГЛЕБАС в заказе — +3 бонусных билета.
          </li>
          <li>
            <span className="text-accent">≥ 50 000 ₽</span> товарами LMH × ГЛЕБАС в заказе —{" "}
            <span className="text-accent">×2</span> ко всей сумме билетов заказа.
          </li>
        </ul>
      </section>

      <section className="mt-12 border-t border-line pt-8 text-sm text-fg-dim">
        <h2 className="display text-2xl text-fg">Правила и юридическое</h2>
        <p className="mt-3">
          Розыгрыш проводится LMH совместно с Глебасом. Участвуют только заказы, содержащие товары
          коллекции LMH × ГЛЕБАС — покупки остального ассортимента LMH билетов не дают и в счётчик
          заказов не входят. Победитель определяется случайным образом среди всех выданных билетов
          после достижения отметки в 1000 оплаченных заказов LMH × ГЛЕБАС. Стоимость приза, порядок
          передачи и налоги — по договорённости с победителем.
        </p>
        <p className="mt-3">
          Возврат/отмена заказа списывает начисленные по нему билеты. Использование фейковых
          Telegram-аккаунтов и накрутка билетов — дисквалификация.
        </p>
        <p className="mt-6">
          <Link href="/catalog" className="underline">
            Смотреть каталог
          </Link>
        </p>
      </section>
    </div>
  );
}
