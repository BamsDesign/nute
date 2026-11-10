import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { getAbout, getCompany } from "@/lib/settings";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";

export const metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const user = await requireUser();
  const [c, about, projects, interventions, events, team, articles, media, contactsNew, recentContacts, logs, demo] = await Promise.all([
    getCompany(),
    getAbout(),
    db.project.count({ where: { published: true, isDemo: false } }),
    db.intervention.count({ where: { published: true, isDemo: false } }),
    db.event.count({ where: { published: true, isDemo: false } }),
    db.teamMember.count({ where: { published: true, isDemo: false } }),
    db.article.count({ where: { published: true, isDemo: false } }),
    db.media.count(),
    db.contactRequest.count({ where: { status: "NEW" } }),
    db.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    user.role === "ADMIN" ? db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }) : Promise.resolve([]),
    Promise.all([db.project.count({ where: { isDemo: true } }), db.event.count({ where: { isDemo: true } }), db.teamMember.count({ where: { isDemo: true } }), db.intervention.count({ where: { isDemo: true } }), db.article.count({ where: { isDemo: true } })]).then((a) => a.reduce((x, y) => x + y, 0)),
  ]);

  const checklist: [string, boolean, string][] = [
    ["Logo officiel", !!c.logoUrl, "parametres"],
    ["Numéro de téléphone", !!c.phone, "parametres"],
    ["Numéro WhatsApp", !!c.whatsapp, "parametres"],
    ["Adresse du bureau", !!c.address, "parametres"],
    ["Horaires d'ouverture", !!c.hours, "parametres"],
    ["Localisation Google Maps", !!c.mapEmbedUrl, "parametres"],
    ["Signification officielle de « NUTE »", !!c.acronymMeaning, "parametres"],
    ["Année de création", !!c.foundedYear, "parametres"],
    ["Histoire de l'entreprise", !!about.history, "parametres?onglet=about"],
    ["Pourquoi NUTE a été créé", !!about.whyCreated, "parametres?onglet=about"],
    ["Réseaux sociaux", Object.values(c.socials).some(Boolean), "parametres"],
    ["Au moins une réalisation documentée", projects > 0, "realisations"],
    ["Au moins un lieu d'intervention vérifié", interventions > 0, "interventions"],
    ["Au moins une activité", events > 0, "activites"],
    ["Profils de l'équipe", team > 0, "equipe"],
  ];
  const done = checklist.filter(([, ok]) => ok).length;

  const stats = [
    ["Demandes nouvelles", contactsNew, "demandes"],
    ["Réalisations publiées", projects, "realisations"],
    ["Interventions publiées", interventions, "interventions"],
    ["Activités publiées", events, "activites"],
    ["Membres de l'équipe", team, "equipe"],
    ["Articles publiés", articles, "actualites"],
    ["Médias", media, "medias"],
  ] as const;

  return (
    <>
      <AdminHead title={`Bonjour ${user.name.split(" ")[0]}`} description="Vue d'ensemble du site et des contenus à compléter." />
      {demo > 0 && (
        <p className="a-alert a-alert--warn" style={{ marginBottom: "1rem" }}>
          {demo} contenu(s) d&apos;exemple sont présents. Ils sont signalés par un badge « Exemple » sur le site : remplacez-les ou supprimez-les avant la mise en ligne.
        </p>
      )}
      <div className="a-stats">
        {stats.map(([label, n, href]) => (
          <Link key={label} href={adminHref(href)} className="a-stat">
            <strong>{n}</strong>
            <span>{label}</span>
          </Link>
        ))}
      </div>
      <div className="a-cols">
        <div>
          <section className="a-card">
            <h2>Dernières demandes de contact</h2>
            {recentContacts.length === 0 ? (
              <p className="a-hint">Aucune demande pour le moment.</p>
            ) : (
              <table className="a-table">
                <tbody>
                  {recentContacts.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link className="a-row-link" href={adminHref(`demandes/${r.id}`)}>
                          {r.subject}
                        </Link>
                        <div className="a-hint">
                          {r.name} · {r.email}
                        </div>
                      </td>
                      <td className="a-hint">{formatDateTime(r.createdAt)}</td>
                      <td>{r.status === "NEW" && <span className="a-pill a-pill--new">Nouvelle</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
          {logs.length > 0 && (
            <section className="a-card">
              <h2>Activité récente</h2>
              <ul className="a-checklist">
                {logs.map((l) => (
                  <li key={l.id}>
                    <span className="a-hint" style={{ minWidth: 120 }}>{formatDateTime(l.createdAt)}</span>
                    <span>
                      <strong>{l.user?.name ?? "—"}</strong> · {l.action}
                      {l.entity ? ` · ${l.entity}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: "0.75rem" }}>
                <Link className="a-row-link" href={adminHref("journal")}>Voir le journal complet →</Link>
              </p>
            </section>
          )}
        </div>
        <section className="a-card">
          <h2>
            Informations à compléter · {done}/{checklist.length}
          </h2>
          <p className="a-hint" style={{ marginBottom: "0.9rem" }}>
            Ces informations n&apos;ont pas encore été confirmées. Le site masque ou signale proprement les éléments manquants.
          </p>
          <ul className="a-checklist">
            {checklist.map(([label, ok, href]) => (
              <li key={label}>
                <span className={ok ? "ok" : "todo"} aria-hidden="true">
                  {ok ? "✓" : "○"}
                </span>
                {ok ? (
                  <span>{label}</span>
                ) : user.role === "ADMIN" || !href.startsWith("parametres") ? (
                  <Link href={adminHref(href)} style={{ textDecoration: "underline" }}>
                    {label}
                  </Link>
                ) : (
                  <span>{label}</span>
                )}
                <span className="sr-only">{ok ? "complété" : "à compléter"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
