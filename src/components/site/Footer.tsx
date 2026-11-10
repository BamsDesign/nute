import Link from "next/link";
import { getCompany, whatsappLink } from "@/lib/settings";
import { getDictionary } from "@/i18n";
import { NAV_ITEMS } from "./nav";

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
};

export async function Footer() {
  const [c, t] = await Promise.all([getCompany(), getDictionary()]);
  const socials = Object.entries(c.socials).filter(([, v]) => v) as [string, string][];
  const wa = whatsappLink(c.whatsapp);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label={`${c.name} — accueil`}>
              {c.logoUrl ? <img src={c.logoUrl} alt={c.name} style={{ height: 48 }} /> : c.name}
            </Link>
            <p className="footer-slogan">{c.slogan}</p>
            <p>{c.description}</p>
          </div>
          <div className="footer-col">
            <h2>{t("footer.explore")}</h2>
            <ul>
              {NAV_ITEMS.slice(1, 5).map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{t(n.key)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h2>{t("footer.company")}</h2>
            <ul>
              {[NAV_ITEMS[0], ...NAV_ITEMS.slice(5)].map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{t(n.key)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col footer-col--wide">
            <h2>{t("footer.contact")}</h2>
            <ul>
              <li>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
              {c.phone && (
                <li>
                  <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>
                </li>
              )}
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              )}
              {c.address && (
                <li className="pending" style={{ color: "var(--night-text)" }}>
                  {c.address}
                  {c.city ? `, ${c.city}` : ""}
                </li>
              )}
              {c.hours && <li className="pending">{c.hours}</li>}
              <li>
                <Link href="/contact">{t("nav.contact")} →</Link>
              </li>
            </ul>
            {socials.length > 0 && (
              <>
                <h2 style={{ marginTop: "1rem" }}>{t("footer.follow")}</h2>
                <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem" }}>
                  {socials.map(([k, url]) => (
                    <li key={k}>
                      <a href={url} target="_blank" rel="noopener noreferrer me">
                        {SOCIAL_LABELS[k] ?? k}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {year} {c.legalName}. {t("footer.rights")}
          </p>
          <nav aria-label="Informations légales">
            <Link href="/mentions-legales">{t("footer.legal")}</Link>
            <Link href="/confidentialite">{t("footer.privacy")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
