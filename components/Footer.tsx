import Link from "next/link";
import Socials from "@/components/Socials";
import { COMPANY } from "@/lib/company";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bg-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-white.png" alt="LMH" className="logo-img h-12" />
          <p className="mt-3 max-w-xs text-sm text-fg-dim">
            Форма улицы. Лимитированные дропы. Здесь нет лишнего.
          </p>
          <Socials className="mt-5" />
        </div>

        <div>
          <h4 className="mono mb-4 text-xs uppercase tracking-widest text-fg-dim">Навигация</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:text-accent">Каталог</Link></li>
            <li><Link href="/about" className="hover:text-accent">О бренде</Link></li>
            <li><Link href="/delivery" className="hover:text-accent">Доставка и оплата</Link></li>
            <li><Link href="/contacts" className="hover:text-accent">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mono mb-4 text-xs uppercase tracking-widest text-fg-dim">Документы</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/offer" className="hover:text-accent">Публичная оферта</Link></li>
            <li><Link href="/privacy" className="hover:text-accent">Политика конфиденциальности</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mono mb-4 text-xs uppercase tracking-widest text-fg-dim">Связь</h4>
          <ul className="space-y-2 text-sm">
            <li><a href={COMPANY.phoneHref} className="hover:text-accent">{COMPANY.phone}</a></li>
            <li><a href={`mailto:${COMPANY.email}`} className="hover:text-accent">{COMPANY.email}</a></li>
            <li><a href={COMPANY.socials.telegram} className="hover:text-accent" target="_blank" rel="noreferrer">Telegram @LmhFuckSleep</a></li>
            <li><a href={COMPANY.socials.instagram} className="hover:text-accent" target="_blank" rel="noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="mono flex flex-col gap-2 text-xs text-fg-dim md:flex-row md:items-center md:justify-between">
            <span>© {COMPANY.year} LMH. Все права защищены.</span>
            <span>Оплата: СБП · Карты Мир · Платёж в 4 части</span>
          </div>
          <p className="mono mt-3 text-[11px] leading-relaxed text-fg-dim">
            {COMPANY.status} {COMPANY.legalName} · ИНН {COMPANY.inn} · ОГРНИП {COMPANY.ogrnip}
          </p>
        </div>
      </div>
    </footer>
  );
}
