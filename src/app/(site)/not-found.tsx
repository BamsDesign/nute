import Link from "next/link";

export default function SiteNotFound() {
  return (
    <section className="section" style={{ minHeight: "60vh" }}>
      <div className="container stack" style={{ "--stack": "2rem" } as React.CSSProperties}>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="display-2">Cette page est introuvable.</h1>
        <p className="lead">Le contenu recherché n&apos;existe pas ou n&apos;est plus publié.</p>
        <div>
          <Link href="/" className="btn">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
