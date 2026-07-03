import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Сводка" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/orders", label: "Заказы" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="display text-2xl">
            LMH · Админка
          </Link>
          <nav className="flex gap-5">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-fg"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            target="_blank"
            className="mono text-xs uppercase tracking-widest text-fg-dim hover:text-fg"
          >
            Открыть сайт ↗
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="py-8">{children}</div>
    </div>
  );
}
