import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();
const CDN = "https://cdn.jsdelivr.net/gh/Traffer777/lmh@main/public";

const rows = await p.productImage.findMany({
  where: { url: { startsWith: "/products/aw25-" } },
  select: { id: true, url: true },
});
console.log(`found ${rows.length} rows`);

let ok = 0;
for (const r of rows) {
  const newUrl = `${CDN}${r.url}`;
  await p.productImage.update({ where: { id: r.id }, data: { url: newUrl } });
  ok++;
}
console.log(`updated ${ok} rows`);

const after = await p.productImage.count({ where: { url: { contains: "cdn.jsdelivr.net" } } });
const stillLocal = await p.productImage.count({ where: { url: { startsWith: "/products/aw25-" } } });
console.log(`after: cdn=${after}, local aw25 left=${stillLocal}`);

await p.$disconnect();
