// Крупные разделы каталога (иконки на главной, фильтр ?g= в каталоге).
// Категории в БД исторически разные (top/футболка/hoodie/...), поэтому группируем здесь.

type P = { category: string; slug: string; title: string };

const isBag = (p: P) => p.category === "accessory" && /сумк|клатч|рюкзак|bag|wallet/i.test(p.slug + " " + p.title);

export const GROUPS = [
  {
    key: "upper",
    label: "Верхний гардероб",
    match: (p: P) => ["top", "футболка", "худи", "hoodie", "jacket", "куртка", "puffer", "suit", "костюм", "лонгслив"].includes(p.category),
  },
  {
    key: "lower",
    label: "Нижний гардероб",
    match: (p: P) => ["bottom", "pants", "штаны", "shorts", "шорты", "suit", "костюм"].includes(p.category),
  },
  {
    key: "accessories",
    label: "Аксессуары / Головные уборы",
    match: (p: P) => p.category === "accessory" && !isBag(p),
  },
  { key: "bags", label: "Сумки, рюкзаки", match: isBag },
] as const;

export type GroupKey = (typeof GROUPS)[number]["key"];
export const findGroup = (key?: string) => GROUPS.find((g) => g.key === key);
export const groupOf = (p: P) => GROUPS.find((g) => g.match(p))?.key;
