const PHRASES = [
  "ФОРМА УЛИЦЫ",
  "ЗДЕСЬ НЕТ ЛИШНЕГО",
  "ЛИМИТИРОВАННЫЕ ДРОПЫ",
  "LMH × FUCK SLEEP",
  "ДОСТАВКА ПО ВСЕЙ РОССИИ",
];

export default function Ticker() {
  // Дублируем строку дважды для бесшовной прокрутки (-50%).
  const line = [...PHRASES, ...PHRASES];
  return (
    <div className="ticker">
      <div className="ticker__track">
        {[...line, ...line].map((p, i) => (
          <span key={i}>
            {p} <span aria-hidden>/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
