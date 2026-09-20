// Тумблер публикации коллекции AW25. Использование:
//   node prisma/aw25-toggle.mjs off   → скрыть (published=false)
//   node prisma/aw25-toggle.mjs on    → открыть продажу
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const mode = process.argv[2];
if (mode !== "on" && mode !== "off") {
  console.error("Usage: node prisma/aw25-toggle.mjs on|off");
  process.exit(1);
}

const published = mode === "on";
const r = await prisma.product.updateMany({
  where: { drop: { slug: "aw25" } },
  data: { published, releaseAt: published ? null : new Date("2026-09-20T15:00:00.000Z") },
});
console.log(`AW25 → published=${published}, updated ${r.count} products`);
await prisma.$disconnect();
