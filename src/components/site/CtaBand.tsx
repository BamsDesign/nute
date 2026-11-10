import Link from "next/link";
import { getHome, getCompany, whatsappLink } from "@/lib/settings";
import { getDictionary } from "@/i18n";
import { Arrow } from "./ui";

export async function CtaBand({ title, text }: { title?: string; text?: string }) {
  const [home, c, t] = await Promise.all([getHome(), getCompany(), getDictionary()]);
  const wa = whatsappLink(c.whatsapp, "Bonjour NUTE, je souhaite discuter d'un projet.");
  return (
    <section className="section section--night" aria-labelledby="cta-title">
      <div className="container cta-band">
        <div className="cta-band__title">
          <p className="eyebrow" data-reveal>
            {t("nav.contact")}
          </p>
          <h2 id="cta-title" className="display-2" style={{ marginTop: "1.5rem" }} data-reveal>
            {title ?? home.ctaTitle}
          </h2>
        </div>
        <div className="cta-band__aside" data-reveal>
          <p className="lead">{text ?? home.ctaText}</p>
          <div className="cta-band__actions">
            <Link href="/contact" className="btn btn--accent">
              {t("cta.contactUs")} <Arrow />
            </Link>
            {wa ? (
              <a href={wa} className="btn btn--outline" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            ) : (
              <a href={`mailto:${c.email}`} className="btn btn--outline">
                {c.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
