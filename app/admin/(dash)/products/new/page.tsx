import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export default async function NewProductPage() {
  const drops = await prisma.drop.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <Link href="/admin/products" className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-accent">
        ← К товарам
      </Link>
      <h1 className="display mt-2 text-4xl">Новый товар</h1>
      <div className="mt-6">
        <ProductForm drops={drops.map((d) => ({ id: d.id, title: d.title }))} />
      </div>
    </div>
  );
}
