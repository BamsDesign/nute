import { getCompany, whatsappLink } from "@/lib/settings";
import { getServiceCatalogue } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/ui";
import { ContactForm } from "@/components/site/ContactForm";
import { WhatsAppIcon } from "@/components/site/icons";

export async function generateMetadata() {
  return pageMetadata({ path: "/contact", title: "Contact — demande d'information ou de devis", description: "Contactez NUTE pour un dépannage, une installation, un projet numérique, une prestation multimédia ou une formation. Réponse par e-mail ou WhatsApp." });
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service }, c, catalogue] = await Promise.all([searchParams, getCompany(), getServiceCatalogue()]);
  const services = catalogue.flatMap((cat) => cat.services.map((s) => ({ value: s.slug, label: s.title, group: cat.title })));
  const defaultService = services.some((s) => s.value === service) ? service : undefined;
  const wa = whatsappLink(c.whatsapp, "Bonjour NUTE, je souhaite obtenir des informations.");
  const socials = Object.entries(c.socials).filter(([, v]) => v) as [string, string][];

  return (
    <>
      <PageHero crumbs={[{ name: "Contact", path: "/contact" }]} eyebrow="Contact" title="Parlons de votre besoin." intro="Une réparation, une installation, un projet numérique, une prestation multimédia ou une formation : écrivez-nous, nous revenons vers vous rapidement." />
      <section className="section">
        <div className="container split">
          <div className="split__side stack" style={{ "--stack": "2rem" } as React.CSSProperties}>
            <dl className="facts">
              <div>
                <dt>E-mail</dt>
                <dd>
                  <a className="text-link" href={`mailto:${c.email}`}>{c.email}</a>
                </dd>
              </div>
              {c.phone && (
                <div>
                  <dt>Téléphone</dt>
                  <dd>
                    <a className="text-link" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>
                  </dd>
                </div>
              )}
              {c.address && (
                <div>
                  <dt>Adresse</dt>
                  <dd>
                    {c.address}
                    {c.city ? `, ${c.city}` : ""}
                    {c.department ? ` (${c.department})` : ""}
                  </dd>
                </div>
              )}
              {c.hours && (
                <div>
                  <dt>Horaires</dt>
                  <dd style={{ whiteSpace: "pre-line" }}>{c.hours}</dd>
                </div>
              )}
              {socials.length > 0 && (
                <div>
                  <dt>Réseaux</dt>
                  <dd style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 1rem" }}>
                    {socials.map(([k, url]) => (
                      <a key={k} className="text-link" href={url} target="_blank" rel="noopener noreferrer" style={{ textTransform: "capitalize" }}>
                        {k}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
            {wa && (
              <a href={wa} className="btn btn--outline" target="_blank" rel="noopener noreferrer">
                <span style={{ width: 18, height: 18, display: "inline-flex" }}>
                  <WhatsAppIcon />
                </span>
                Écrire sur WhatsApp
              </a>
            )}
            {(!c.phone || !c.address) && (
              <p className="field-hint">Les coordonnées téléphoniques et l&apos;adresse du bureau seront publiées prochainement. En attendant, l&apos;e-mail et le formulaire sont les meilleurs moyens de nous joindre.</p>
            )}
          </div>
          <div className="split__main">
            <ContactForm services={services} defaultService={defaultService} />
          </div>
        </div>
      </section>
      {c.mapEmbedUrl && /^https:\/\/www\.google\.com\/maps\/embed\?/.test(c.mapEmbedUrl) && (
        <section aria-label="Localisation">
          <iframe src={c.mapEmbedUrl} title={`Localisation de ${c.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: 0, width: "100%", height: 420, display: "block", filter: "grayscale(1)" }} />
        </section>
      )}
    </>
  );
}
