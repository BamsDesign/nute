import { getCompany } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/site/ui";

export async function generateMetadata() {
  return pageMetadata({ path: "/confidentialite", title: "Politique de confidentialité", description: "Comment NUTE collecte, utilise et protège les données transmises via son site." });
}

export default async function PrivacyPage() {
  const c = await getCompany();
  return (
    <>
      <PageHero crumbs={[{ name: "Confidentialité", path: "/confidentialite" }]} title="Politique de confidentialité" />
      <section className="section">
        <div className="container">
          <div className="prose">
            <h2>Données collectées</h2>
            <p>
              Le formulaire de contact collecte les informations que vous saisissez : nom, adresse e-mail, téléphone, entreprise ou institution, objet, service concerné et message. Pour la sécurité du service (prévention des abus), l&apos;adresse IP et le navigateur utilisés lors de l&apos;envoi sont également enregistrés.
            </p>
            <h2>Utilisation</h2>
            <p>Ces informations servent uniquement à répondre à votre demande et à assurer le suivi de la relation. Elles ne sont ni vendues, ni louées, ni cédées à des tiers.</p>
            <h2>Conservation</h2>
            <p>Les demandes sont conservées le temps nécessaire à leur traitement et au suivi de la relation, puis archivées ou supprimées.</p>
            <h2>Cookies</h2>
            <p>Le site public n&apos;utilise aucun cookie publicitaire ni outil de suivi tiers. Les vidéos intégrées utilisent le mode de confidentialité renforcée de YouTube lorsque c&apos;est possible.</p>
            <h2>Vos droits</h2>
            <p>
              Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en écrivant à <a href={`mailto:${c.email}`}>{c.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
