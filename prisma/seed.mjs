import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (t, i) => `/api/placeholder?t=${encodeURIComponent(t)}&i=${i}`;

// Наборы размеров
const apparel = (s, m, l, xl) => [
  { size: "S", stock: s },
  { size: "M", stock: m },
  { size: "L", stock: l },
  { size: "XL", stock: xl },
];
const oneSize = (n) => [{ size: "OS", stock: n }];

const DROPS = [
  { slug: "sakura", title: "Сакура", description: "Капсула «Сакура» — мягкие фактуры, графика цветущей ветки, лимит.", sortOrder: 1 },
  { slug: "crystal", title: "CRYSTAL", description: "Линия CRYSTAL — плотный хлопок, чёткий крой, минимум деталей.", sortOrder: 2 },
  { slug: "ctrl-v", title: "LMH × Ctrl+V", description: "Коллаб с командой Ctrl+V. Лимитированные футболки.", sortOrder: 3 },
  { slug: "base", title: "Базовая линия", description: "То, что носится каждый день. Форма улицы.", sortOrder: 4 },
];

const PRODUCTS = [
  {
    slug: "zip-hoodie-sakura", title: "Зип-худи «Сакура»", drop: "sakura", category: "hoodie",
    price: 7900, limited: true, composition: "Футер трёхнитка, 320 г/м², 100% хлопок.",
    description: "Зип-худи из плотного футера с графикой «Сакура». Свободный oversize-крой, тяжёлая молния, двойной капюшон. Лимитированный тираж.",
    variants: apparel(3, 5, 4, 2), sortOrder: 1,
  },
  {
    slug: "longsleeve-sakura", title: "Лонгслив «Сакура»", drop: "sakura", category: "longsleeve",
    price: 3900, limited: true, composition: "Кулирка, 190 г/м², 100% хлопок.",
    description: "Лонгслив с принтом «Сакура» на спине. Прямой крой, плотный манжет.",
    variants: apparel(6, 8, 7, 3), sortOrder: 2,
  },
  {
    slug: "pants-sakura", title: "Штаны «Сакура»", drop: "sakura", category: "pants",
    price: 5900, limited: true, composition: "Футер петля, 280 г/м², хлопок 95% / эластан 5%.",
    description: "Объёмные штаны на манжете с боковой вышивкой. Карманы-карго, регулируемый пояс.",
    variants: apparel(4, 6, 5, 2), sortOrder: 3,
  },
  {
    slug: "shorts-sakura", title: "Шорты «Сакура»", drop: "sakura", category: "shorts",
    price: 3500, composition: "Футер, 250 г/м², 100% хлопок.",
    description: "Шорты свободного кроя длиной до колена. Удобная резинка, графика капсулы.",
    variants: apparel(5, 7, 6, 4), sortOrder: 4,
  },
  {
    slug: "pants-crystal", title: "Штаны LMH CRYSTAL", drop: "crystal", category: "pants",
    price: 6200, limited: true, composition: "Плотный твил, хлопок 98% / эластан 2%.",
    description: "Штаны линии CRYSTAL: чистый силуэт, минимум деталей, светоотражающий лейбл.",
    variants: apparel(2, 4, 4, 1), sortOrder: 5,
  },
  {
    slug: "zip-hoodie-nasadnik", title: "Зип-худи «Насадник»", drop: "base", category: "hoodie",
    price: 7500, composition: "Футер трёхнитка, 330 г/м², 100% хлопок.",
    description: "Тяжёлое зип-худи с фирменной нашивкой. База гардероба, носится круглый год.",
    variants: apparel(4, 6, 6, 3), sortOrder: 6,
  },
  {
    slug: "suit-lmh", title: "Костюм LMH", drop: "base", category: "suit",
    price: 11900, limited: true, composition: "Футер, 300 г/м², 100% хлопок. Худи + штаны.",
    description: "Комплект: худи + штаны в едином тоне. Полный лук «из коробки».",
    variants: apparel(2, 3, 3, 1), sortOrder: 7,
  },
  {
    slug: "tee-ctrl-v", title: "Футболка LMH × Ctrl+V", drop: "ctrl-v", category: "tshirt",
    price: 2900, limited: true, composition: "Кулирка пенье, 210 г/м², 100% хлопок.",
    description: "Лимитированная футболка в честь коллаба с ФК Ctrl+V. Принт спереди и на спине.",
    variants: apparel(8, 10, 9, 5), sortOrder: 8,
  },
  {
    slug: "bag-lmh", title: "Сумка «НАХ. ЛУИ»", drop: "base", category: "accessory",
    price: 2900, composition: "Плотный канвас, ремень регулируется.",
    description: "Узнаваемая сумка-шоппер с дерзким принтом. Вмещает всё нужное на улицу.",
    variants: oneSize(15), sortOrder: 9,
  },
];

async function main() {
  console.log("Очистка...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.drop.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Дропы...");
  const dropIds = {};
  for (const d of DROPS) {
    const created = await prisma.drop.create({ data: d });
    dropIds[d.slug] = created.id;
  }

  console.log("Товары...");
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        composition: p.composition,
        price: p.price,
        category: p.category,
        dropId: dropIds[p.drop] ?? null,
        published: true,
        limited: !!p.limited,
        sortOrder: p.sortOrder ?? 0,
        images: {
          create: [0, 1, 2, 3].map((i) => ({
            url: img(p.title, i + (p.sortOrder ?? 0)),
            alt: `${p.title} — фото ${i + 1}`,
            sortOrder: i,
          })),
        },
        variants: { create: p.variants },
      },
    });
  }

  console.log("Настройки...");
  await prisma.setting.createMany({
    data: [
      { key: "free_shipping_threshold", value: "15000" },
      { key: "contact_phone", value: "8 999 823-68-92" },
      { key: "contact_email", value: "Lamansh@internet.ru" },
    ],
  });

  const count = await prisma.product.count();
  console.log(`Готово: ${DROPS.length} дропов, ${count} товаров.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
