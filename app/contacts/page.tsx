import Socials from "@/components/Socials";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Контакты — LMH" };

const CONTACTS = [
  { label: "Телефон", value: COMPANY.phone, href: COMPANY.phoneHref },
  { label: "E-mail", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
  { label: "Telegram", value: "@LmhFuckSleep", href: COMPANY.socials.telegram },
  { label: "Telegram (связь)", value: "@LMH_worldwide", href: COMPANY.socials.telegram2 },
  { label: "Instagram", value: "@lmh_clothing", href: COMPANY.socials.instagram },
  { label: "ВКонтакте", value: "vk.ru/lmh_clothing", href: COMPANY.socials.vk },
];

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent">Контакты</p>
      <h1 className="display mt-3 text-5xl md:text-6xl">Связаться с LMH</h1>
      <p className="mt-4 text-fg-dim">
        Пишите по любым вопросам — заказ, размеры, доставка, сотрудничество.
        Быстрее всего отвечаем в Telegram.
      </p>

      <Socials className="mt-8" />

      <div className="mt-10 divide-y divide-line border-y border-line">
        {CONTACTS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="flex items-center justify-between gap-4 py-4 transition-colors hover:text-accent"
          >
            <span className="mono text-xs uppercase tracking-widest text-fg-dim">{c.label}</span>
            <span className="display text-xl">{c.value}</span>
          </a>
        ))}
      </div>

      <div className="mt-10 border border-line bg-bg-2 p-6">
        <h2 className="mono mb-3 text-xs uppercase tracking-widest text-fg-dim">Реквизиты</h2>
        <p className="text-sm leading-relaxed text-fg-dim">
          {COMPANY.status} {COMPANY.legalName}
          <br />
          ИНН {COMPANY.inn}
          <br />
          ОГРНИП {COMPANY.ogrnip}
          <br />
          Тел.: {COMPANY.phone} · E-mail: {COMPANY.email}
        </p>
      </div>
    </div>
  );
}
