import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Motion } from "@/components/site/Motion";
import { WhatsAppIcon } from "@/components/site/icons";
import { NAV_ITEMS } from "@/components/site/nav";
import { JsonLd } from "@/components/site/ui";
import { getDictionary } from "@/i18n";
import { getCompany, whatsappLink } from "@/lib/settings";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [t, c, org] = await Promise.all([getDictionary(), getCompany(), organizationJsonLd()]);
  const wa = whatsappLink(c.whatsapp, "Bonjour NUTE, je souhaite obtenir des informations.");
  return (
    <>
      <a href="#contenu" className="skip-link">
        {t("nav.skip")}
      </a>
      <Header
        items={NAV_ITEMS.map((n) => ({ href: n.href, label: t(n.key) }))}
        logoUrl={c.logoUrl}
        name={c.name}
        email={c.email}
        labels={{ contact: t("nav.contact"), menu: t("nav.menu"), close: t("nav.close"), slogan: c.slogan }}
      />
      <main id="contenu">{children}</main>
      <Footer />
      {wa && (
        <a className="wa-float" href={wa} target="_blank" rel="noopener noreferrer" aria-label={t("cta.whatsapp")}>
          <WhatsAppIcon />
          <span>WhatsApp</span>
        </a>
      )}
      <JsonLd data={[org, websiteJsonLd(c.name)]} />
      <Motion />
    </>
  );
}
