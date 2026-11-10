"use client";

import { useFormAction } from "@/lib/use-form-action";

import type { FormState } from "../../actions";
import type { AboutSettings, CompanySettings, HomeSettings } from "@/lib/settings";
import { HAITI_DEPARTMENTS } from "@/lib/taxonomy";
import { ImageField, ListField, SubmitBar } from "@/components/admin/fields";

type Action = (p: FormState, f: FormData) => Promise<FormState>;

function T({ name, label, v, err, full = true, hint, max, rows, type = "text", placeholder }: { name: string; label: string; v: string | number | null | undefined; err: Record<string, string>; full?: boolean; hint?: string; max?: number; rows?: number; type?: string; placeholder?: string }) {
  return (
    <label className={`a-field ${full ? "a-field--full" : ""}`}>
      <span>{label}</span>
      {rows ? (
        <textarea className="a-input" name={name} defaultValue={v ?? ""} rows={rows} maxLength={max} aria-invalid={err[name] ? true : undefined} />
      ) : (
        <input className="a-input" type={type} name={name} defaultValue={v ?? ""} maxLength={max} placeholder={placeholder} aria-invalid={err[name] ? true : undefined} />
      )}
      {hint && <em className="a-hint">{hint}</em>}
      {err[name] && <em className="a-error">{err[name]}</em>}
    </label>
  );
}

const Section = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="a-section">
    <h3>{title}</h3>
    {hint && <p className="a-hint">{hint}</p>}
  </div>
);

export function CompanyForm({ action, v }: { action: Action; v: CompanySettings }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const e = state.errors ?? {};
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form">
      <div className="a-grid">
        <Section title="Identité" />
        <T name="name" label="Nom d'usage" v={v.name} err={e} full={false} max={60} />
        <T name="legalName" label="Raison sociale" v={v.legalName} err={e} full={false} max={120} />
        <T name="slogan" label="Slogan officiel" v={v.slogan} err={e} max={160} />
        <T name="description" label="Description courte (pied de page, référencement)" v={v.description} err={e} rows={3} max={400} />
        <T name="acronymMeaning" label="Signification officielle de « NUTE »" v={v.acronymMeaning} err={e} rows={2} max={400} hint="Ne remplir qu'une fois la signification confirmée par la direction." />
        <T name="foundedYear" label="Année de création" v={v.foundedYear} err={e} full={false} type="number" />
        <ImageField name="logoUrl" label="Logo officiel (PNG ou WebP, fond transparent)" defaultUrl={v.logoUrl ?? ""} error={e.logoUrl} />
        <Section title="Coordonnées" hint="Les champs vides ne sont pas affichés sur le site." />
        <T name="email" label="E-mail" v={v.email} err={e} full={false} type="email" />
        <T name="phone" label="Téléphone" v={v.phone} err={e} full={false} placeholder="+509 …" />
        <T name="whatsapp" label="WhatsApp (format international)" v={v.whatsapp} err={e} full={false} placeholder="+509 3XXX XXXX" hint="Active le bouton WhatsApp sur tout le site." />
        <T name="hours" label="Horaires d'ouverture" v={v.hours} err={e} full={false} rows={2} max={300} placeholder="Lundi – vendredi : 8 h – 17 h" />
        <T name="address" label="Adresse du bureau" v={v.address} err={e} max={200} />
        <T name="city" label="Ville" v={v.city} err={e} full={false} max={120} />
        <label className="a-field">
          <span>Département</span>
          <select className="a-input" name="department" defaultValue={v.department ?? ""}>
            <option value="">—</option>
            {HAITI_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <T name="mapEmbedUrl" label="Carte Google Maps (URL d'intégration)" v={v.mapEmbedUrl} err={e} max={1500} hint="Google Maps → Partager → Intégrer une carte → copiez uniquement l'adresse src=&quot;https://www.google.com/maps/embed?…&quot;." />
        <Section title="Réseaux sociaux" />
        {(["facebook", "instagram", "linkedin", "youtube", "tiktok", "x"] as const).map((k) => (
          <T key={k} name={`socials.${k}`} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} v={v.socials[k]} err={e} full={false} placeholder="https://" />
        ))}
      </div>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}

export function HomeForm({ action, v }: { action: Action; v: HomeSettings }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const e = state.errors ?? {};
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form">
      <div className="a-grid">
        <Section title="En-tête de la page d'accueil" />
        <T name="heroEyebrow" label="Surtitre" v={v.heroEyebrow} err={e} max={120} />
        <T name="heroTitle" label="Titre principal" v={v.heroTitle} err={e} max={160} />
        <T name="heroText" label="Texte d'accompagnement" v={v.heroText} err={e} rows={3} max={400} />
        <ImageField name="heroImageUrl" altName="heroImageAlt" label="Photographie d'en-tête (facultatif, format panoramique)" defaultUrl={v.heroImageUrl ?? ""} defaultAlt={v.heroImageAlt ?? ""} error={e.heroImageUrl} />
        <T name="expertiseIntro" label="Présentation de l'expertise" v={v.expertiseIntro} err={e} rows={3} max={600} />
        <Section title="Chiffres clés" hint="Seuls les chiffres cochés « vérifié » sont affichés. N'indiquez que des chiffres documentés." />
        <ListField name="figures" label="Chiffres" itemFields={[{ name: "value", label: "Valeur (ex. 120+)" }, { name: "label", label: "Libellé" }]} booleanFields={[{ name: "verified", label: "Chiffre vérifié" }]} defaultValue={JSON.stringify(v.figures)} />
        <Section title="Pourquoi choisir NUTE" />
        <T name="whyTitle" label="Titre" v={v.whyTitle} err={e} max={120} />
        <ListField name="whyItems" label="Arguments" itemFields={[{ name: "title", label: "Titre" }, { name: "text", label: "Texte", wide: true }]} defaultValue={JSON.stringify(v.whyItems)} />
        <Section title="Appel à l'action (bas de page)" />
        <T name="ctaTitle" label="Titre" v={v.ctaTitle} err={e} max={120} />
        <T name="ctaText" label="Texte" v={v.ctaText} err={e} rows={2} max={400} />
      </div>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}

export function AboutForm({ action, v }: { action: Action; v: AboutSettings }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const e = state.errors ?? {};
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form">
      <div className="a-grid">
        <T name="intro" label="Introduction" v={v.intro} err={e} rows={2} max={400} />
        <T name="presentation" label="Présentation de NUTE" v={v.presentation} err={e} rows={6} max={3000} />
        <T name="history" label="Origine et histoire de l'entreprise" v={v.history} err={e} rows={8} max={10000} hint="Laisser vide tant que le récit n'est pas validé : une mention « publication prochaine » s'affiche." />
        <T name="whyCreated" label="Pourquoi NUTE a été créé" v={v.whyCreated} err={e} rows={5} max={5000} />
        <T name="mission" label="Notre mission" v={v.mission} err={e} rows={3} max={800} />
        <T name="vision" label="Notre vision" v={v.vision} err={e} rows={3} max={800} />
        <ListField name="values" label="Nos valeurs" itemFields={[{ name: "title", label: "Valeur" }, { name: "text", label: "Description", wide: true }]} defaultValue={JSON.stringify(v.values)} />
        <T name="approach" label="Notre approche du travail" v={v.approach} err={e} rows={4} max={3000} />
        <T name="commitment" label="Notre engagement envers nos clients" v={v.commitment} err={e} rows={4} max={3000} />
      </div>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
