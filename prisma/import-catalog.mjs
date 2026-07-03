import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SMLX = ["S", "M", "L", "XL"].map((size) => ({ size, stock: 5 }));
const OS = [{ size: "OS", stock: 8 }];
const CARE =
  "Уход за изделием: бережная стирка при максимальной температуре 30 °C, стирать и гладить советуем наизнанку.";

// Категории сведены к трём: Верх / Низ / Аксессуары.
const CAT_MAP = {
  hoodie: "top",
  longsleeve: "top",
  tshirt: "top",
  suit: "top",
  pants: "bottom",
  shorts: "bottom",
  accessory: "accessory",
};
const mapCat = (c) => CAT_MAP[c] ?? "accessory";

const DROPS = [
  { slug: "sakura", title: "Сакура", description: "Капсула «Сакура» — розовый принт цветущей сакуры.", sortOrder: 1 },
  { slug: "nahuy", title: "Нах*й луи", description: "Дерзкие аксессуары с принтом «нах*й луи / i need LMH».", sortOrder: 2 },
  { slug: "rospis", title: "Роспись", description: "Линия «Роспись» — фирменная графика и каллиграфия LMH.", sortOrder: 3 },
  { slug: "base", title: "Базовая линия", description: "То, что носится каждый день. Форма улицы.", sortOrder: 4 },
];

// care: добавить строку ухода (одежда). v: размеры. img: пути фото.
const P = [
  // --- Сакура ---
  { slug: "zip-hoodie-sakura", title: "Зип-худи «Сакура»", drop: "sakura", cat: "hoodie", price: 4190, v: OS, limited: true, care: true,
    desc: "Зип-худи «Сакура» в технике acid wash с розовым логотипом и принтом сакуры. 100% хлопок, два кармана спереди.",
    img: ["/products/hoodie-sakura-1.jpg", "/products/hoodie-sakura-2.jpg", "/products/hoodie-sakura-3.jpg"] },
  { slug: "pants-sakura", title: "Штаны широкие «Сакура»", drop: "sakura", cat: "pants", price: 4190, v: SMLX, limited: true, care: true,
    desc: "Широкие штаны «Сакура». 100% хлопок, полупояс на шнурке, снизу утяжки регулируют ширину.",
    img: ["/products/pants-sakura-1.jpg"] },
  { slug: "shorts-sakura", title: "Шорты широкие «Сакура»", drop: "sakura", cat: "shorts", price: 3190, v: SMLX, limited: true, care: true,
    desc: "Широкие шорты по колено «Сакура». Футер 2-х нитка, 100% хлопок. Сверху шнурок, карманы на молнии.",
    img: ["/products/shorts-sakura-1.jpg", "/products/look-sakura-2.jpg", "/products/sakura-look-1.jpg"] },
  { slug: "longsleeve-sakura", title: "Лонгслив «Сакура»", drop: "sakura", cat: "longsleeve", price: 3190, v: SMLX, limited: true, care: true,
    desc: "Лонгслив «Сакура». 100% хлопок, слимфит крой / размер в размер.",
    img: ["/products/longsleeve-sakura-1.jpg", "/products/look-sakura-1.jpg", "/products/look-sakura-2.jpg"] },
  { slug: "set-sakura", title: "Комплект лонгслив + шорты «Сакура»", drop: "sakura", cat: "suit", price: 5690, v: SMLX, limited: true, care: true,
    desc: "Комплект: лонгслив + широкие шорты «Сакура». 100% хлопок, слимфит. Стоимость комплекта 5690 ₽ вместо 6380 ₽.",
    img: ["/products/look-sakura-1.jpg", "/products/sakura-look-1.jpg", "/products/longsleeve-sakura-1.jpg", "/products/shorts-sakura-1.jpg"] },

  { slug: "tshirt-sakura", title: "Футболка «Сакура»", drop: "sakura", cat: "tshirt", price: 0, v: SMLX, limited: true, care: true,
    desc: "Футболка «Сакура» с принтом цветущей сакуры и розовым логотипом LMH. Доступна в белом и чёрном цвете. 100% хлопок.",
    img: ["/products/tshirt-sakura-1.jpg", "/products/tshirt-sakura-2.jpg"] },

  // --- Нах*й луи ---
  { slug: "bag-nahuy", title: "Сумка «Нах*й луи»", drop: "nahuy", cat: "accessory", price: 4190, v: OS, limited: true, care: false,
    desc: "Широкая вместительная сумка с принтом «нах*й луи / i need LMH». Ремешок в комплекте.",
    img: ["/products/bag-nahuy-1.jpg", "/products/bag-nahuy-2.jpg", "/products/bag-nahuy-3.jpg"] },
  { slug: "wallet-nahuy", title: "Клатч «Нах*й луи»", drop: "nahuy", cat: "accessory", price: 1790, v: OS, limited: false, care: false,
    desc: "Клатч-кошелёк «нах*й луи». 20×10 см, 3 отдела «для больших котлет».",
    img: ["/products/wallet-nahuy-1.jpg", "/products/wallet-nahuy-2.jpg"] },
  { slug: "set-nahuy", title: "Сумка + клатч «Нах*й луи»", drop: "nahuy", cat: "accessory", price: 5190, v: OS, limited: true, care: false,
    desc: "Комплект: широкая сумка + клатч «нах*й луи». Ремешок в комплекте.",
    img: ["/products/bag-nahuy-1.jpg", "/products/wallet-nahuy-1.jpg", "/products/bag-nahuy-2.jpg"] },

  // --- Роспись ---
  { slug: "shorts-cargo-rospis", title: "Шорты карго «Роспись»", drop: "rospis", cat: "shorts", price: 3190, v: SMLX, limited: true, care: true,
    desc: "Широкие карго-шорты по колено «Роспись». Сверху шнурок, 4 кармана.",
    img: ["/products/shorts-cargo-rospis-1.jpg", "/products/look-leading-cargo.jpg"] },
  { slug: "shorts-rospis", title: "Шорты широкие «Роспись лмх»", drop: "rospis", cat: "shorts", price: 3190, v: SMLX, limited: true, care: true,
    desc: "Широкие шорты по колено «Роспись лмх». Футер 2-х нитка, 100% хлопок. Карманы на молнии.",
    img: ["/products/shorts-rospis-1.jpg", "/products/look-leading-rospis.jpg"] },
  { slug: "longsleeve-rospis", title: "Лонгслив «Роспись»", drop: "rospis", cat: "longsleeve", price: 3190, v: SMLX, limited: true, care: true,
    desc: "Лонгслив «Роспись» (арт «лонгслив белая роспись»). 100% хлопок, слимфит крой / размер в размер.",
    img: ["/products/longsleeve-rospis-1.jpg", "/products/longsleeve-rospis-2.jpg"] },
  { slug: "set-rospis", title: "Комплект шорты + поло «Расписной насадник»", drop: "rospis", cat: "suit", price: 4790, v: SMLX, limited: true, care: true,
    desc: "Комплект: поло «Насадник» + широкие шорты «Роспись лмх». 100% хлопок.",
    img: ["/products/polo-nasadnik-1.jpg", "/products/polo-nasadnik-2.jpg", "/products/shorts-rospis-1.jpg"] },

  // --- Базовая ---
  { slug: "zip-hoodie-leading", title: "Зип-худи «Лидерство творит историю»", drop: "base", cat: "hoodie", price: 4790, v: SMLX, limited: true, care: true,
    desc: "Зип-худи «Лидерство творит историю» (Leading Makes History). 100% хлопок, футер 3-х нитка. Металлическая молния, два кармана спереди.",
    img: ["/products/hoodie-leading-1.jpg", "/products/look-leading-rospis.jpg", "/products/look-leading-cargo.jpg"] },
  { slug: "pants-crystal", title: "Штаны LMH CRYSTAL", drop: "base", cat: "pants", price: 6790, v: SMLX, limited: true, care: true,
    desc: "Штаны LMH CRYSTAL. 100% хлопок, более 4 000 страз. Полупояс на шнурке, снизу регулируются по ширине.",
    img: ["/products/crystal-pants-1.jpg", "/products/crystal-pants-2.jpg"] },
  { slug: "polo-nasadnik", title: "Поло слим-фит «Насадник»", drop: "base", cat: "tshirt", price: 2390, v: SMLX, limited: false, care: true,
    desc: "Поло слим-фит «Насадник». 100% хлопок, слимфит крой / размер в размер.",
    img: ["/products/polo-nasadnik-0.jpg", "/products/polo-nasadnik-1.jpg", "/products/polo-nasadnik-2.jpg", "/products/look-polo.jpg"] },
  { slug: "glasses-rich", title: "Очки «Рич»", drop: "base", cat: "accessory", price: 2190, v: OS, limited: false, care: false,
    desc: "Солнцезащитные очки «Рич». Один размер. Идеально подойдут на весну, лето, осень.",
    img: ["/products/glasses-rich-1.jpg", "/products/look-glasses.jpg"] },
  { slug: "glock-decor", title: "Glock 18 LMH (декор)", drop: "base", cat: "accessory", price: 1500, v: OS, limited: true, care: false,
    desc: "Коллекционный декоративный макет Glock 18 с гравировкой LMH. Игрушка / предмет интерьера, стреляет пульками. Не является настоящим оружием.",
    img: ["/products/glock-lmh.jpg"] },
  { slug: "lmh-case", title: "LMH case", drop: "base", cat: "accessory", price: 2990, v: OS, limited: false, care: false,
    desc: "Кейс-клатч LMH на ремне. 11×20 см. Вместимость: паспорт, кошелёк, ключи.",
    img: ["/products/clutch-alu-1.jpg"] },
];

async function main() {
  console.log("Очистка...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.drop.deleteMany();

  const dropIds = {};
  for (const d of DROPS) dropIds[d.slug] = (await prisma.drop.create({ data: d })).id;

  let i = 0;
  for (const p of P) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.care ? `${p.desc} ${CARE}` : p.desc,
        composition: null,
        price: p.price,
        category: mapCat(p.cat),
        dropId: dropIds[p.drop] ?? null,
        published: true,
        limited: !!p.limited,
        sortOrder: ++i,
        images: { create: p.img.map((url, k) => ({ url, alt: `${p.title} — фото ${k + 1}`, sortOrder: k })) },
        variants: { create: p.v },
      },
    });
  }

  console.log(`Готово: ${DROPS.length} дропа, ${P.length} товаров (все опубликованы).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
