import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { DICT_KEYS, LOCALES, baseDictionary } from "@/i18n";
import { AdminHead } from "@/components/admin/Head";
import { TranslationsForm } from "./TranslationsForm";
import { saveTranslations } from "../../actions";

export const metadata = { title: "Traductions" };

export default async function TranslationsPage() {
  await requireUser();
  const rows = await db.translation.findMany();
  const values: Record<string, string> = {};
  for (const r of rows) values[`${r.locale}::${r.key}`] = r.value;
  const total = DICT_KEYS.length;
  const progress = LOCALES.filter((l) => l.code !== "fr").map((l) => ({ ...l, done: rows.filter((r) => r.locale === l.code).length }));
  return (
    <>
      <AdminHead title="Traductions" description="Textes de l'interface du site. Le français est la langue de référence ; le créole haïtien et l'anglais reprennent le français tant qu'aucune traduction n'est saisie." />
      <p className="a-alert a-alert--info" style={{ marginBottom: "1rem" }}>
        Avancement : {progress.map((p) => `${p.label} ${p.done}/${total}`).join(" · ")}. Le contenu éditorial (services, projets, articles) reste rédigé en français ; l&apos;architecture permet d&apos;ajouter des versions traduites par la suite.
      </p>
      <TranslationsForm action={saveTranslations} keys={DICT_KEYS} base={baseDictionary as Record<string, string>} values={values} locales={LOCALES.map((l) => ({ code: l.code, label: l.label }))} />
    </>
  );
}
