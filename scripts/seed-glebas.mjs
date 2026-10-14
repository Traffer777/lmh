import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const CDN = "https://cdn.jsdelivr.net/gh/Traffer777/lmh@main/public";

// 1. Create the drop
const drop = await p.drop.create({
  data: {
    slug: "glebas",
    title: "LMH × Глебас",
    description: "Коллаборация LMH × Глебас. Стразы ручной работы, оверсайз, 100% хлопок.",
    active: true,
    sortOrder: 0, // top priority
  },
});
console.log(`Drop created: id=${drop.id}, slug=${drop.slug}`);

// Shift other drops down so glebas is first
await p.drop.updateMany({
  where: { id: { not: drop.id }, sortOrder: { lte: 0 } },
  data: { sortOrder: 1 },
});

// 2. Products
const products = [
  {
    slug: "glebas-puffer",
    title: "Пуховик LMH × Глебас",
    description: "Весна/осень. Оверсайз.",
    category: "puffer",
    price: 8990,
    sizes: ["S", "M", "L", "XL"],
    images: ["glebas-puffer.jpg"],
  },
  {
    slug: "glebas-pants",
    title: "Штаны LMH × Глебас",
    description: "Оверсайз. Снизу и сверху на утяжках.",
    category: "pants",
    price: 5190,
    sizes: ["S", "M", "L", "XL"],
    images: ["glebas-pants.jpg", "glebas-pants-2.jpg"],
  },
  {
    slug: "glebas-pants-rhinestone",
    title: "Штаны LMH × Глебас со стразами",
    description: "Стразы ручной работы. 100% хлопок. Снизу и сверху ширина и длина регулируется. Оверсайз.",
    category: "pants",
    price: 7990,
    sizes: ["S", "M", "L"],
    sizeXlStock: 0, // XL распроданы
    images: ["glebas-pants-rhinestone.jpg", "glebas-pants-rhinestone-2.jpg", "glebas-pants-rhinestone-3.jpg"],
  },
  {
    slug: "glebas-ziphoodie-rhinestone",
    title: "Зип-худи LMH × Глебас со стразами",
    description: "Стразы ручной работы. 100% хлопок. Металлическая молния. Оверсайз.",
    category: "hoodie",
    price: 8990,
    sizes: ["S", "M", "L", "XL"],
    images: ["glebas-ziphoodie-rhinestone.jpg", "glebas-ziphoodie-rhinestone-2.jpg", "glebas-ziphoodie-rhinestone-3.jpg"],
  },
  {
    slug: "glebas-ziphoodie",
    title: "Зип-худи LMH × Глебас",
    description: "Оверсайз.",
    category: "hoodie",
    price: 5190,
    sizes: ["S", "M", "L", "XL"],
    images: ["glebas-ziphoodie.jpg", "glebas-ziphoodie-2.jpg"],
  },
  {
    slug: "glebas-hoodie",
    title: "Худи LMH × Глебас",
    description: "Оверсайз, кроп посадкой.",
    category: "hoodie",
    price: 5190,
    sizes: ["S", "M", "L", "XL"],
    images: ["glebas-hoodie.jpg", "glebas-hoodie-2.jpg"],
  },
  {
    slug: "glebas-tee",
    title: "Футболка LMH × Глебас",
    description: "Оверсайз / слимфит.",
    category: "футболка",
    price: 3190,
    sizes: ["S", "M", "L", "XL"],
    images: ["glebas-tee.jpg"],
  },
];

let sortOrder = 0;
for (const prod of products) {
  const created = await p.product.create({
    data: {
      slug: prod.slug,
      title: prod.title,
      description: prod.description,
      category: prod.category,
      price: prod.price,
      published: true,
      dropId: drop.id,
      sortOrder: sortOrder++,
      variants: {
        create: [
          ...prod.sizes.map((s) => ({ size: s, stock: 10 })),
          ...(prod.sizeXlStock !== undefined
            ? [{ size: "XL", stock: prod.sizeXlStock }]
            : []),
        ],
      },
      images: {
        create: prod.images.map((filename, i) => ({
          url: `${CDN}/products/${filename}`,
          alt: prod.title,
          sortOrder: i,
        })),
      },
    },
  });
  console.log(`  Product: ${created.slug} (id=${created.id})`);
}

// Verify
const count = await p.product.count({ where: { drop: { slug: "glebas" } } });
console.log(`\nTotal products in glebas drop: ${count}`);

await p.$disconnect();
