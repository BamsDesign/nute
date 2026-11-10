import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { db } from "@/lib/db";
import { RESOURCES } from "@/lib/admin/resources";
import { SideNav } from "@/components/admin/SideNav";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const newContacts = await db.contactRequest.count({ where: { status: "NEW" } });
  const r = (key: string) => ({ href: adminHref(key), label: RESOURCES.find((x) => x.key === key)!.label });
  const isAdmin = user.role === "ADMIN";

  const groups = [
    { title: "Pilotage", items: [{ href: adminHref(), label: "Tableau de bord" }, { href: adminHref("demandes"), label: "Demandes de contact", count: newContacts }] },
    { title: "Preuves de travail", items: [r("realisations"), r("interventions"), r("activites")] },
    { title: "Contenus", items: [r("services"), r("categories-services"), r("equipe"), r("actualites"), r("temoignages"), r("partenaires")] },
    { title: "Médias", items: [{ href: adminHref("medias"), label: "Médiathèque" }] },
    {
      title: "Site",
      items: [
        ...(isAdmin ? [{ href: adminHref("parametres"), label: "Entreprise et pages" }] : []),
        r("seo"),
        { href: adminHref("traductions"), label: "Traductions" },
        ...(isAdmin ? [{ href: adminHref("utilisateurs"), label: "Utilisateurs" }, { href: adminHref("journal"), label: "Journal d'audit" }] : []),
      ],
    },
  ];

  return (
    <div className="a-shell">
      <aside className="a-side">
        <div className="a-side__brand">
          <strong>NUTE</strong>
          <span>Administration</span>
        </div>
        <SideNav groups={groups} base={adminHref()} />
        <div className="a-side__foot">
          <span>
            {user.name} · {user.role === "ADMIN" ? "Administrateur" : "Éditeur"}
          </span>
          <Link href={adminHref("compte")}>Mon compte</Link>
          <a href="/" target="_blank" rel="noopener">
            Voir le site ↗
          </a>
          <form action={logout}>
            <button type="submit">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <main className="a-main" id="contenu">
        {children}
      </main>
    </div>
  );
}
