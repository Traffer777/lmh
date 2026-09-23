"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

type NavItem = { href: string; label: string; accent?: boolean };
const NAV: NavItem[] = [
  { href: "/catalog", label: "Каталог" },
  { href: "/drops/glebas", label: "LMH × Глебас", accent: true },
  { href: "/drops/aw25", label: "AW25" },
  { href: "/drops/lead-the-crowd", label: "Lead The Crowd" },
  { href: "/about", label: "Бренд" },
  { href: "/stickers", label: "Стикеры" },
  { href: "/media", label: "Медиа" },
  { href: "/delivery", label: "Доставка" },
  { href: "/contacts", label: "Контакты" },
  { href: "/account", label: "Кабинет" },
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0" aria-label="LMH — на главную">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.png" alt="LMH" className="logo-img h-7 md:h-9" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                n.accent
                  ? "mono text-xs uppercase tracking-widest text-accent transition-colors hover:text-fg"
                  : "mono text-xs uppercase tracking-widest text-fg-dim transition-colors hover:text-fg"
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="mono text-xs uppercase tracking-widest hover:text-accent"
          >
            Корзина
            <span className="ml-1 inline-flex min-w-5 justify-center border border-line px-1 text-accent">
              {mounted ? count : 0}
            </span>
          </Link>
          <button
            className="md:hidden"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="mono text-xs uppercase tracking-widest">меню</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-line md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={
                n.accent
                  ? "mono border-b border-line px-4 py-3 text-xs uppercase tracking-widest text-accent hover:text-fg"
                  : "mono border-b border-line px-4 py-3 text-xs uppercase tracking-widest text-fg-dim hover:text-fg"
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
