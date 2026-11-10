import Link from "next/link";

export default function NotFound() {
  return (
    <main id="contenu" className="section" style={{ minHeight: "80vh", display: "grid", alignItems: "center" }}>
      <div className="container stack" style={{ "--stack": "2rem" } as React.CSSProperties}>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="display-2">Cette page est introuvable.</h1>
        <p className="lead">Le lien est peut-être erroné, ou la page a été déplacée.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/" className="btn">
            Retour à l&apos;accueil
          </Link>
          <Link href="/contact" className="btn btn--outline">
            Nous contacter
          </Link>
        </div>
      </div>
    </main>
  );
}
