import { getCompany } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/ui";

export async function generateMetadata() {
  return pageMetadata({ path: "/mentions-legales", title: "Mentions légales", description: "Mentions légales du site de NUTE (NUTESERVICES)." });
}

export default async function LegalPage() {
  const c = await getCompany();
  return (
    <>
      <PageHero crumbs={[{ name: "Mentions légales", path: "/mentions-legales" }]} title="Mentions légales" />
      <section className="section">
        <div className="container">
          <div className="prose">
            <h2>Éditeur du site</h2>
            <p>
              {c.legalName} ({c.name})
              {c.address ? <>, {c.address}{c.city ? `, ${c.city}` : ""}, Haïti</> : null}.<br />
              Contact : <a href={`mailto:${c.email}`}>{c.email}</a>
              {c.phone ? <> — {c.phone}</> : null}
            </p>
            <h2>Propriété intellectuelle</h2>
            <p>
              Les textes, photographies, vidéos, logos et éléments graphiques de ce site sont la propriété de {c.legalName} ou de leurs auteurs respectifs. Toute reproduction sans autorisation écrite préalable est interdite.
            </p>
            <h2>Photographies et contenus</h2>
            <p>
              Les réalisations, interventions et activités présentées sont documentées par {c.name}. La mention de clients, d&apos;institutions ou de partenaires n&apos;intervient qu&apos;avec leur autorisation. Les contenus marqués « Exemple » sont des démonstrations de mise en page et ne décrivent pas de travaux réels.
            </p>
            <h2>Responsabilité</h2>
            <p>Les informations publiées sur ce site sont fournies à titre indicatif et peuvent être modifiées à tout moment. Pour toute demande précise, contactez-nous.</p>
          </div>
        </div>
      </section>
    </>
  );
}
