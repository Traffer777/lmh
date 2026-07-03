import { COMPANY } from "@/lib/company";

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M21.95 4.32 18.7 19.6c-.24 1.08-.88 1.35-1.79.84l-4.94-3.64-2.38 2.3c-.26.26-.49.49-1 .49l.36-5.06 9.2-8.31c.4-.36-.09-.56-.62-.2L6.16 13.1l-4.9-1.53c-1.06-.33-1.08-1.06.22-1.57l19.16-7.39c.89-.32 1.66.2 1.31 1.71z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function VkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
      <path d="M13.16 17.3c-5.1 0-8.01-3.5-8.13-9.3h2.56c.08 4.27 1.96 6.07 3.45 6.44V8h2.41v3.69c1.47-.16 3.02-1.83 3.54-3.69h2.41c-.4 2.29-2.07 3.96-3.26 4.65 1.19.56 3.09 2.02 3.81 4.65h-2.65c-.56-1.75-1.98-3.1-3.85-3.29v3.29h-.8z" />
    </svg>
  );
}

export default function Socials({ className = "" }: { className?: string }) {
  const links = [
    { href: COMPANY.socials.telegram, label: "Telegram", icon: <TelegramIcon /> },
    { href: COMPANY.socials.instagram, label: "Instagram", icon: <InstagramIcon /> },
    { href: COMPANY.socials.vk, label: "ВКонтакте", icon: <VkIcon /> },
  ];
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className="btn btn-sm gap-2"
          aria-label={l.label}
        >
          {l.icon}
          {l.label}
        </a>
      ))}
    </div>
  );
}
