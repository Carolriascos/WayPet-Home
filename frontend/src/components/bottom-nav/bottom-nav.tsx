"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Casos" },
  { href: "/coincidencias", label: "Coincid." },
  { href: "/reportar", label: "+", primary: true },
  { href: "/avisos", label: "Avisos" },
  { href: "/avistamientos", label: "Avist." },
];

export default function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Navegación móvil">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.primary ? "bottom-nav-primary" : undefined}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          {item.label}
          {item.href === "/avisos" && unreadCount > 0 && (
            <span className="badge" aria-label={`${unreadCount} avisos sin leer`}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}