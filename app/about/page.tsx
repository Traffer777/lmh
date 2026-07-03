export const metadata = { title: "О бренде — LMH" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent">О бренде</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">LMH — форма улицы</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-fg-dim">
        <p>
          LMH (лмх) — российский бренд уличной одежды. Мы делаем вещи, в которых
          удобно жить городом: плотные ткани, честный крой, ничего лишнего.
        </p>
        <p>
          Каждый дроп выходит ограниченным тиражом. Мы не гонимся за объёмами —
          важнее, чтобы вещь сидела как надо и служила долго. Сегодня это «Сакура»
          и CRYSTAL, завтра — новый дроп, о котором первыми узнают подписчики
          нашего Telegram.
        </p>
        <p>
          «Здесь нет лишнего» — это не просто слоган. Это то, как мы относимся к
          крою, графике и к самим вещам.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { n: "13,6K", t: "подписчиков в Telegram" },
          { n: "Лимит", t: "тиражи каждого дропа" },
          { n: "РФ", t: "доставка по всей стране" },
        ].map((s) => (
          <div key={s.t} className="border border-line bg-bg-2 p-6">
            <div className="display text-3xl text-accent">{s.n}</div>
            <div className="mono mt-1 text-xs uppercase tracking-widest text-fg-dim">{s.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
