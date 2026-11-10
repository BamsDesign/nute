"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { href: string; label: string };

export function Brand({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  return (
    <Link href="/" className="brand" aria-label={`${name} — accueil`}>
      {logoUrl ? (
        <img src={logoUrl} alt={name} width={120} height={34} />
      ) : (
        <>
          <span>{name}</span>
          <span className="brand__tag">Services</span>
        </>
      )}
    </Link>
  );
}

export function Header({
  items,
  logoUrl,
  name,
  labels,
  email,
}: {
  items: Item[];
  logoUrl: string | null;
  name: string;
  labels: { contact: string; menu: string; close: string; slogan: string };
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled}>
        <div className="container site-header__inner">
          <Brand logoUrl={logoUrl} name={name} />
          <nav className="nav-main" aria-label="Navigation principale">
            {items.map((it) => (
              <Link key={it.href} href={it.href} aria-current={isActive(it.href) ? "page" : undefined}>
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/contact" className="btn btn--sm">
              {labels.contact}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(true)}
            >
              <span className="menu-toggle__bars" aria-hidden="true">
                <span />
                <span />
              </span>
              {labels.menu}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className="mobile-menu" data-open={open} role="dialog" aria-modal="true" aria-label={labels.menu} hidden={!open}>
        <div className="mobile-menu__top">
          <span className="brand" style={{ color: "var(--night-text)" }}>
            {name}
          </span>
          <button
            ref={closeRef}
            type="button"
            className="menu-toggle"
            onClick={() => {
              setOpen(false);
              toggleRef.current?.focus();
            }}
          >
            {labels.close}
          </button>
        </div>
        <nav aria-label="Navigation mobile">
          {[{ href: "/", label: "Accueil" }, ...items, { href: "/contact", label: labels.contact }].map((it, i) => (
            <Link key={it.href} href={it.href} aria-current={it.href === pathname ? "page" : undefined}>
              {it.label}
              <span className="mono">{String(i + 1).padStart(2, "0")}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__foot">
          <p style={{ color: "var(--night-text)" }}>{labels.slogan}</p>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </div>
    </>
  );
}
