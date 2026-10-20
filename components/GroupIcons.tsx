import Link from "next/link";
import { GROUPS, type GroupKey } from "@/lib/groups";

// Иконки разделов каталога на главной.
const ICONS: Record<GroupKey, React.ReactNode> = {
  upper: (
    <path d="M9 4 4 7l2 5 2-1v9h8v-9l2 1 2-5-5-3c0 1.7-1.3 3-3 3S9 5.7 9 4Z" />
  ),
  lower: <path d="M7 3h10l1 18h-4.5L12 10l-1.5 11H6L7 3Zm0 3h10" />,
  accessories: (
    <>
      <path d="M5.5 15v-3a6.5 6.5 0 0 1 13 0v3" />
      <rect x="4" y="15" width="16" height="4.5" rx="1" />
      <path d="M8 15v4.5M12 15v4.5M16 15v4.5" />
      <circle cx="12" cy="4" r="1.5" />
    </>
  ),
  bags: (
    <>
      <path d="M6 8h12l-1 13H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <path d="M9 13h6" />
    </>
  ),
};

export default function GroupIcons() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {GROUPS.map((g) => (
        <Link
          key={g.key}
          href={`/catalog?g=${g.key}`}
          className="group flex flex-col items-center gap-2 border border-line bg-bg-2 px-1 py-4 text-center transition-colors hover:border-accent sm:py-6"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 text-fg transition-colors group-hover:text-accent sm:h-12 sm:w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden
          >
            {ICONS[g.key]}
          </svg>
          <span className="mono text-[9px] uppercase leading-tight tracking-wider sm:text-xs">{g.label}</span>
        </Link>
      ))}
    </div>
  );
}
