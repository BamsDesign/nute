import { getTeam } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";
import { getDictionary } from "@/i18n";
import { EmptyState, PageHero } from "@/components/site/ui";
import { TeamCard } from "@/components/site/cards";
import { CtaBand } from "@/components/site/CtaBand";

export const revalidate = 300;

export async function generateMetadata() {
  return pageMetadata({ path: "/equipe", title: "Notre équipe — les personnes derrière NUTE", description: "Découvrez les membres de l'équipe NUTE : leurs fonctions, leurs parcours, leurs compétences et leur contribution à l'entreprise." });
}

export default async function TeamPage() {
  const [team, t] = await Promise.all([getTeam(), getDictionary()]);
  const departments = [...new Set(team.map((m) => m.department ?? ""))];
  return (
    <>
      <PageHero
        crumbs={[{ name: "Équipe", path: "/equipe" }]}
        eyebrow="Notre équipe"
        title="Les personnes derrière NUTE."
        intro="Des profils complémentaires, réunis par une même exigence : rendre la technologie utile, fiable et accessible."
      />
      <section className="section">
        <div className="container">
          {team.length === 0 && <EmptyState text={t("empty.team")} />}
          {departments.map((dep) => {
            const members = team.filter((m) => (m.department ?? "") === dep);
            return (
              <div key={dep || "general"} style={{ marginBottom: "clamp(3rem, 2rem + 3vw, 5rem)" }}>
                {departments.length > 1 && (
                  <h2 className="eyebrow" style={{ marginBottom: "2rem" }}>
                    {dep || "Direction et coordination"}
                  </h2>
                )}
                <div className="cards" style={{ "--cols": 4 } as React.CSSProperties}>
                  {members.map((m) => (
                    <TeamCard key={m.id} m={m} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <CtaBand title="Travailler avec nous." text="Pour un projet, un partenariat ou une collaboration, contactez l'équipe NUTE." />
    </>
  );
}
