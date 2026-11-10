"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section" style={{ minHeight: "60vh" }}>
      <div className="container stack" style={{ "--stack": "2rem" } as React.CSSProperties}>
        <p className="eyebrow">Erreur</p>
        <h1 className="display-2">Un problème est survenu.</h1>
        <p className="lead">La page n&apos;a pas pu être chargée. Réessayez dans un instant.</p>
        <div>
          <button className="btn" onClick={reset}>
            Réessayer
          </button>
        </div>
      </div>
    </section>
  );
}
