"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Group = { title: string; items: { href: string; label: string; count?: number }[] };

export function SideNav({ groups, base }: { groups: Group[]; base: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === base ? pathname === base : pathname === href || pathname.startsWith(`${href}/`));
  return (
    <nav aria-label="Administration">
      {groups.map((g) => (
        <div key={g.title}>
          <h2>{g.title}</h2>
          <ul>
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} aria-current={isActive(it.href) ? "page" : undefined}>
                  {it.label}
                  {it.count ? <span className="a-count">{it.count}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
