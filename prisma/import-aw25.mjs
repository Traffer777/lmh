// LMH — заливка коллекции AW25 (25 позиций).
// Запуск: `node prisma/import-aw25.mjs` (использует DATABASE_URL из .env).
// Идемпотентно по slug: перезаписывает товары, фото и варианты.
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Старт продаж — 18:00 МСК 2026-09-21. МСК = UTC+3, поэтому UTC 15:00.
const RELEASE_AT = new Date("2026-09-21T15:00:00.000Z");

const OS = (n = 10) => [{ size: "OS", stock: n }];
const only = (size, stock = 5) => [
  { size: "S", stock: size === "S" ? stock : 0 },
  { size: "M", stock: size === "M" ? stock : 0 },
  { size: "L", stock: size === "L" ? stock : 0 },
  { size: "XL", stock: size === "XL" ? stock : 0 },
];
const smlNoXl = (n = 5) => [
  { size: "S", stock: n },
  { size: "M", stock: n },
  { size: "L", stock: n },
  { size: "XL", stock: 0 },
];
const smlx = (n = 5) => [
  { size: "S", stock: n },
  { size: "M", stock: n },
  { size: "L", stock: n },
  { size: "XL", stock: n },
];

const DROP = {
  slug: "aw25",
  title: "AW25",
  description:
    "Осень/зима 25 — камо, велюр, водонепроницаемые ткани, стразы. Вся вышивка LMH.",
  sortOrder: 0,
};

const P = [
  { slug: "aw25-cap-camo-green", title: "Шапка «Камо зелёный»", cat: "accessory", price: 990, v: OS(20),
    desc: "Зелёная камуфляжная шапка с красной вышивкой LMH. One size." },
  { slug: "aw25-cap-grey", title: "Шапка серая", cat: "accessory", price: 990, v: OS(20),
    desc: "Серая шапка с вышивкой LMH. One size." },
  { slug: "aw25-pants-camo", title: "Штаны «Камо»", cat: "pants", price: 5990, v: only("M", 5),
    desc: "Камуфляжные штаны, 100% хлопок, утяжки снизу, вышивка LMH. В наличии только M — S, L, XL распроданы." },
  { slug: "aw25-ziphoodie-camo", title: "Зип-худи «Камо»", cat: "hoodie", price: 5990, v: only("M", 5),
    desc: "Камуфляжное зип-худи с двойным капюшоном, 100% хлопок, вышивка LMH. В наличии только M — S, L, XL распроданы." },
  { slug: "aw25-suit-camo", title: "Костюм «Камо» (худи + штаны)", cat: "suit", price: 9990, v: only("M", 5),
    desc: "Камуфляжный комплект: зип-худи с двойным капюшоном + штаны с утяжками. 100% хлопок, вышивка LMH. В наличии только M." },
  { slug: "aw25-bomber-velour", title: "Бомбер с велюровыми вставками", cat: "jacket", price: 4990, v: smlNoXl(5),
    desc: "Бомбер на осень/весну с велюровыми вставками, вышивка LMH. S, M, L — в наличии, XL распродан." },
  { slug: "aw25-cap-white", title: "Шапка белая", cat: "accessory", price: 990, v: OS(20),
    desc: "Белая шапка с вышивкой LMH. One size." },
  { slug: "aw25-cap-blue", title: "Шапка голубая", cat: "accessory", price: 990, v: OS(20),
    desc: "Голубая шапка с вышивкой LMH. One size." },
  { slug: "aw25-cap-red", title: "Шапка красная", cat: "accessory", price: 990, v: OS(20),
    desc: "Красная шапка с вышивкой LMH. One size." },
  { slug: "aw25-snood-black", title: "Снуд чёрный", cat: "accessory", price: 1790, v: OS(15),
    desc: "Чёрный снуд с вышивкой LMH. One size." },
  { slug: "aw25-cap-black", title: "Шапка чёрная", cat: "accessory", price: 990, v: OS(20),
    desc: "Чёрная шапка с вышивкой LMH. One size." },
  { slug: "aw25-cap-krystall", title: "Шапка «Krystall»", cat: "accessory", price: 2790, v: OS(10),
    desc: "Шапка с ручной инкрустацией ~1000 страз и вышивкой LMH. One size, лимитка.", limited: true },
  { slug: "aw25-cap-camo-grey", title: "Шапка «Камо серый»", cat: "accessory", price: 990, v: OS(20),
    desc: "Серо-камуфляжная шапка с вышивкой LMH. One size." },
  { slug: "aw25-cap-swamp", title: "Шапка болотная", cat: "accessory", price: 990, v: OS(20),
    desc: "Болотная шапка с вышивкой LMH. One size." },
  { slug: "aw25-cap-tattered-white", title: "Шапка «Tattered» белая", cat: "accessory", price: 1790, v: OS(12),
    desc: "Белая шапка в потрёпанной фактуре (tattered), вышивка LMH. One size." },
  { slug: "aw25-leather-jacket", title: "Кожаная куртка", cat: "jacket", price: 7990, v: smlx(4),
    desc: "Кожаная куртка на молнии, карманы на молнии, вышивка LMH. Все размеры в наличии." },
  { slug: "aw25-ziphoodie-nylon", title: "Зип-худи с нейлоновыми вставками", cat: "hoodie", price: 4190, v: smlx(5),
    desc: "Зип-худи с нейлоновыми вставками на капюшоне и рукавах, вышивка LMH. Все размеры в наличии." },
  { slug: "aw25-windbreaker-reversible", title: "Ветровка двухсторонняя водонеп.", cat: "jacket", price: 4990, v: smlx(5),
    desc: "Двухсторонняя водонепроницаемая ветровка, вышивка LMH. Носится с двух сторон. Все размеры в наличии." },
  { slug: "aw25-windbreaker", title: "Ветровка водонепроницаемая", cat: "jacket", price: 4990, v: smlx(5),
    desc: "Водонепроницаемая ветровка с вышивкой LMH. Все размеры в наличии." },
  { slug: "aw25-puffer", title: "Пуховик", cat: "puffer", price: 8990, v: smlx(4),
    desc: "Пуховик с утяжками и диагональной молнией, вышивка LMH. Все размеры в наличии." },
  { slug: "aw25-pants-velour-wide", title: "Широкие велюровые штаны", cat: "pants", price: 5990, v: smlNoXl(5),
    desc: "Широкие велюровые штаны с вышивкой LMH. S, M, L — в наличии, XL распродан." },
  { slug: "aw25-jacket-reflective", title: "Куртка водонеп. с рефлективом", cat: "jacket", price: 5990, v: smlx(4),
    desc: "Водонепроницаемая куртка со светоотражающими вставками, вышивка LMH. Все размеры в наличии." },
  { slug: "aw25-pants-waterproof", title: "Штаны водонепроницаемые", cat: "pants", price: 4990, v: smlx(5),
    desc: "Водонепроницаемые штаны, 3 кармана на молнии, вышивка LMH. Все размеры в наличии." },
  { slug: "aw25-suit-waterproof", title: "Костюм водонепроницаемый (куртка + штаны)", cat: "suit", price: 8990, v: smlx(4),
    desc: "Водонепроницаемый костюм: куртка + штаны, вышивка LMH. Все размеры в наличии." },
  { slug: "aw25-bag-lmh", title: "Сумка LMH", cat: "accessory", price: 2990, v: OS(15),
    desc: "Вместительная сумка LMH с множеством карманов на молнии. One size." },
];

async function main() {
  const drop = await prisma.drop.upsert({
    where: { slug: DROP.slug },
    create: { ...DROP, active: true },
    update: { title: DROP.title, description: DROP.description, sortOrder: DROP.sortOrder, active: true },
  });

  let idx = 0;
  for (const p of P) {
    idx++;
    // Ищем фото по типовым именам в /public/products/: slug.jpg, slug-1.jpg, ..., slug-6.jpg (jpg/png/webp).
    const images = [];
    // Возможные варианты имён; заливаем только те URL-и, которые пропишем — Next.js отдаст 404 если файла нет,
    // но карточка возьмёт первый доступный. Стратегия: перечисляем и slug.jpg, и slug-1..6.jpg — что положишь, то и подхватится
    // (пустые файлы просто дадут «битую» превью, поэтому лучше положить хоть один под именем slug.jpg).
    const bases = [p.slug, `${p.slug}-1`, `${p.slug}-2`, `${p.slug}-3`, `${p.slug}-4`, `${p.slug}-5`, `${p.slug}-6`];
    for (const b of bases) images.push({ url: `/products/${b}.jpg`, alt: p.title });

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.desc,
        composition: null,
        price: p.price,
        category: p.cat,
        dropId: drop.id,
        published: true,
        limited: !!p.limited,
        releaseAt: RELEASE_AT,
        sortOrder: idx,
      },
      update: {
        title: p.title,
        description: p.desc,
        price: p.price,
        category: p.cat,
        dropId: drop.id,
        published: true,
        limited: !!p.limited,
        releaseAt: RELEASE_AT,
        sortOrder: idx,
      },
    });

    // Пересобираем варианты
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.createMany({
      data: p.v.map((v) => ({ productId: product.id, size: v.size, stock: v.stock })),
    });

    // Пересобираем фото (только slug.jpg — остальные слоты создадим только если ты добавишь -2, -3 и т.п.)
    // Чтобы не показывать битые превью, добавляем в БД только запись для главного фото: /products/{slug}.jpg
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: { productId: product.id, url: `/products/${p.slug}.jpg`, alt: p.title, sortOrder: 0 },
    });

    console.log(`✓ ${idx.toString().padStart(2, "0")}  ${p.slug}`);
  }

  console.log(`\nDrop ${DROP.slug} · ${P.length} товаров · старт продаж ${RELEASE_AT.toISOString()} (18:00 МСК)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
