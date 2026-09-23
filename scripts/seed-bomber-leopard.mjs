import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const product = await p.product.create({
  data: {
    slug: "bomber-leopard",
    title: "Леопардовый бомбер LMH",
    description: "Весенний/осенний сезон. Куртка утепленная. Логотип — принт.",
    category: "куртка",
    price: 6990,
    published: true,
    sortOrder: -1,
    images: {
      create: [{ url: "/products/bomber-leopard.jpg", alt: "Леопардовый бомбер LMH", sortOrder: 0 }],
    },
    variants: {
      create: [
        { size: "S", stock: 10 },
        { size: "M", stock: 10 },
        { size: "L", stock: 10 },
      ],
    },
  },
});

console.log(`Created product: id=${product.id}, slug=${product.slug}`);
await p.$disconnect();
