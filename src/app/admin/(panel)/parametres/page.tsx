import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { getAbout, getCompany, getHome } from "@/lib/settings";
import { AdminHead } from "@/components/admin/Head";
import { AboutForm, CompanyForm, HomeForm } from "./SettingsForms";
import { saveSettings } from "../../actions";

export const metadata = { title: "Entreprise et pages" };

const TABS = [
  ["company", "Informations de l'entreprise"],
  ["home", "Page d'accueil"],
  ["about", "Page À propos"],
] as const;

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  await requireUser(["ADMIN"]);
  const { onglet } = await searchParams;
  const tab = TABS.some(([k]) => k === onglet) ? (onglet as "company" | "home" | "about") : "company";
  const [company, home, about] = await Promise.all([getCompany(), getHome(), getAbout()]);
  return (
    <>
      <AdminHead title="Entreprise et pages" description="Coordonnées, identité et textes éditoriaux du site. Laissez vide toute information non confirmée : elle ne sera pas affichée." />
      <nav className="a-tabs" aria-label="Sections">
        {TABS.map(([k, l]) => (
          <Link key={k} href={adminHref(`parametres?onglet=${k}`)} aria-current={tab === k ? "page" : undefined}>
            {l}
          </Link>
        ))}
      </nav>
      {tab === "company" && <CompanyForm action={saveSettings.bind(null, "company")} v={company} />}
      {tab === "home" && <HomeForm action={saveSettings.bind(null, "home")} v={home} />}
      {tab === "about" && <AboutForm action={saveSettings.bind(null, "about")} v={about} />}
    </>
  );
}
