import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const apparel = (n) => ["S", "M", "L", "XL"].map((size) => ({ size, stock: n }));
const oneSize = (n) => [{ size: "OS", stock: n }];

const DROPS = [
  { slug: "sakura", title: "Сакура", description: "Капсула «Сакура»: acid-wash худи и штаны с розовым принтом цветущей сакуры.", sortOrder: 1 },
  { slug: "nahuy", title: "Нах*й луи", description: "Дерзкая линия аксессуаров с фирменным принтом «нах*й луи / i need LMH».", sortOrder: 2 },
  { slug: "crystal", title: "CRYSTAL", description: "Линия CRYSTAL — стразы, чистый крой, минимум деталей.", sortOrder: 3 },
];

const PRODUCTS = [
  {
    slug: "bag-nahuy", title: "Сумка «Нах*й луи»", drop: "nahuy", category: "accessory",
    price: 5190, published: true, limited: true,
    composition: "Ширина 20 см · высота 10 см · 3 отдела. Ремешок в комплекте.",
    description: "Широкая вместительная сумка с фирменным принтом «нах*й луи / i need LMH». Ремешок в комплекте, три отдела «для больших котлет».",
    variants: oneSize(10), sortOrder: 1,
    images: ["bag-nahuy-1.jpg", "bag-nahuy-2.jpg", "bag-nahuy-3.jpg"],
  },
  {
    slug: "pants-crystal", title: "Штаны LMH CRYSTAL", drop: "crystal", category: "pants",
    price: 6790, published: true, limited: true,
    composition: "100% хлопок. Более 4 000 страз. Полупояс на шнурке, низ регулируется по ширине.",
    description: "Штаны LMH CRYSTAL: плотный хлопок, более 4 000 страз, полупояс на шнурке. Снизу регулируются по ширине.",
    variants: apparel(5), sortOrder: 2,
    images: ["crystal-pants-1.jpg", "crystal-pants-2.jpg"],
  },
  // --- ЧЕРНОВИКИ: ждут цену/размеры/описание от владельца ---
  {
    slug: "zip-hoodie-sakura", title: "Зип-худи LMH «Сакура»", drop: "sakura", category: "hoodie",
    price: 0, published: true, limited: true,
    composition: "",
    description: "Зип-худи в технике acid wash с розовым логотипом LMH и принтом сакуры спереди и на спине.",
    variants: apparel(5), sortOrder: 3,
    images: ["hoodie-sakura-1.jpg", "hoodie-sakura-2.jpg", "hoodie-sakura-3.jpg"],
  },
  {
    slug: "pants-sakura", title: "Штаны LMH «Сакура»", drop: "sakura", category: "pants",
    price: 0, published: true, limited: true,
    composition: "",
    description: "Штаны LMH «Сакура» с розовым принтом цветущей сакуры и фирменным логотипом.",
    variants: apparel(5), sortOrder: 4,
    images: ["pants-sakura-1.jpg"],
  },
  {
    slug: "wallet-nahuy", title: "Кошелёк LMH «Нах*й луи»", drop: "nahuy", category: "accessory",
    price: 0, published: true, limited: false,
    composition: "",
    description: "Кошелёк-зип LMH с фирменным принтом «нах*й луи / i need LMH».",
    variants: oneSize(8), sortOrder: 5,
    images: ["wallet-nahuy-1.png", "wallet-nahuy-2.png"],
  },
  {
    slug: "clutch-alu", title: "Клатч-кейс LMH (алюминий)", drop: null, category: "accessory",
    price: 0, published: true, limited: false,
    composition: "",
    description: "Алюминиевый клатч-кейс LMH на съёмном ремне. Серебристый корпус, фирменный логотип.",
    variants: oneSize(5), sortOrder: 6,
    images: ["clutch-alu-1.png"],
  },
  {
    slug: "glock-decor", title: "Glock LMH (декор)", drop: null, category: "accessory",
    price: 0, published: true, limited: true,
    composition: "Игрушечный / декоративный макет. Не является оружием.",
    description: "Коллекционный декоративный макет Glock с гравировкой LMH. Игрушка/предмет интерьера — не настоящее оружие.",
    variants: oneSize(3), sortOrder: 7,
    images: ["glock-lmh.jpg"],
  },
];

async function main() {
  console.log("Очистка старого каталога...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.drop.deleteMany();

  console.log("Дропы...");
  const dropIds = {};
  for (const d of DROPS) {
    const created = await prisma.drop.create({ data: d });
    dropIds[d.slug] = created.id;
  }

  console.log("Реальные товары...");
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        composition: p.composition || null,
        price: p.price,
        category: p.category,
        dropId: p.drop ? dropIds[p.drop] : null,
        published: p.published,
        limited: p.limited,
        sortOrder: p.sortOrder,
        images: {
          create: p.images.map((url, i) => ({
            url: `/products/${url}`,
            alt: `${p.title} — фото ${i + 1}`,
            sortOrder: i,
          })),
        },
        variants: { create: p.variants },
      },
    });
  }

  const published = await prisma.product.count({ where: { published: true } });
  const drafts = await prisma.product.count({ where: { published: false } });
  console.log(`Готово: ${DROPS.length} дропа, ${PRODUCTS.length} товаров (опубликовано ${published}, черновиков ${drafts}).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
