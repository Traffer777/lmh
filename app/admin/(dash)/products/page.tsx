import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { variants: true, drop: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">Товары</h1>
        <Link href="/admin/products/new" className="btn btn-accent btn-sm">
          + Новый товар
        </Link>
      </div>

      <table className="mt-6 w-full border border-line text-sm">
        <thead className="bg-bg-2 text-left">
          <tr className="mono text-xs uppercase tracking-widest text-fg-dim">
            <th className="p-3">Товар</th>
            <th className="p-3">Категория</th>
            <th className="p-3">Дроп</th>
            <th className="p-3 text-right">Цена</th>
            <th className="p-3 text-right">Остаток</th>
            <th className="p-3">Статус</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={p.id} className="border-t border-line hover:bg-bg-2">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]?.url ?? `/api/placeholder?t=${encodeURIComponent(p.title)}`}
                      alt=""
                      className="h-12 w-10 border border-line bg-white object-contain"
                    />
                    <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-accent">
                      {p.title}
                    </Link>
                  </div>
                </td>
                <td className="p-3 text-fg-dim">{categoryLabel(p.category)}</td>
                <td className="p-3 text-fg-dim">{p.drop?.title ?? "—"}</td>
                <td className="mono p-3 text-right">{formatPrice(p.price)}</td>
                <td className="mono p-3 text-right">{stock}</td>
                <td className="p-3">
                  <span className={p.published ? "text-accent-2" : "text-fg-dim"}>
                    {p.published ? "Опубликован" : "Черновик"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="mono text-xs uppercase tracking-widest hover:text-accent"
                    >
                      Изменить
                    </Link>
                    <DeleteProductButton id={p.id} title={p.title} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
