"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Opt = { value: string; label: string; group: string };
type Values = Record<"name" | "email" | "phone" | "company" | "subject" | "service" | "message", string>;
const EMPTY: Values = { name: "", email: "", phone: "", company: "", subject: "", service: "", message: "" };

function validate(v: Values) {
  const e: Partial<Record<keyof Values, string>> = {};
  if (v.name.trim().length < 2) e.name = "Indiquez votre nom complet.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Adresse e-mail invalide.";
  if (v.phone.trim() && !/^[+\d][\d\s().-]{6,}$/.test(v.phone.trim())) e.phone = "Numéro de téléphone invalide.";
  if (v.subject.trim().length < 3) e.subject = "Précisez l'objet de votre message.";
  if (v.message.trim().length < 20) e.message = "Votre message doit contenir au moins 20 caractères.";
  return e;
}

/**
 * Formulaire de contact d'un site statique : après vérification, il ouvre la
 * messagerie (ou WhatsApp) de la personne avec le message déjà rédigé.
 */
export function ContactForm({ services, email, whatsapp }: { services: Opt[]; email: string; whatsapp: string | null }) {
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "error" | "ready">("idle");
  const statusRef = useRef<HTMLDivElement>(null);

  // Service présélectionné depuis une page service (?service=…).
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("service");
    if (s && services.some((x) => x.value === s)) setV((old) => ({ ...old, service: s }));
  }, [services]);

  const serviceLabel = services.find((s) => s.value === v.service)?.label ?? (v.service === "autre" ? "Autre demande" : "");
  const body = [
    v.message.trim(),
    "",
    "—",
    `Nom : ${v.name.trim()}`,
    `E-mail : ${v.email.trim()}`,
    v.phone.trim() && `Téléphone : ${v.phone.trim()}`,
    v.company.trim() && `Entreprise / institution : ${v.company.trim()}`,
    serviceLabel && `Service concerné : ${serviceLabel}`,
  ]
    .filter(Boolean)
    .join("\n");
  const mailto = `mailto:${email}?subject=${encodeURIComponent(`[Site NUTE] ${v.subject.trim()}`)}&body=${encodeURIComponent(body)}`;
  const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`${v.subject.trim()}\n\n${body}`)}` : null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("error");
      statusRef.current?.focus();
      return;
    }
    setStatus("ready");
    window.location.href = mailto;
    statusRef.current?.focus();
  };

  const groups = [...new Set(services.map((s) => s.group))];
  const f = (name: keyof Values) => ({
    id: `f-${name}`,
    name,
    value: v[name],
    onChange: (e: { target: { value: string } }) => setV((o) => ({ ...o, [name]: e.target.value })),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `e-${name}` : undefined,
  });
  const E = ({ n }: { n: keyof Values }) => (errors[n] ? <span id={`e-${n}`} className="field-error">{errors[n]}</span> : null);

  return (
    <form onSubmit={onSubmit} className="form" noValidate>
      <div ref={statusRef} tabIndex={-1} aria-live="polite" style={{ outline: "none" }}>
        {status === "error" && <p className="alert alert--error">Vérifiez les champs signalés.</p>}
        {status === "ready" && (
          <div className="alert alert--success">
            <p>Votre messagerie s&apos;ouvre avec le message déjà rédigé : il ne reste qu&apos;à l&apos;envoyer.</p>
            <p style={{ marginTop: "0.5rem" }}>
              Rien ne s&apos;est ouvert ? Écrivez-nous à <a className="text-link" href={mailto}>{email}</a>
              {wa && (
                <>
                  {" "}ou <a className="text-link" href={wa} target="_blank" rel="noopener noreferrer">envoyez-le sur WhatsApp</a>
                </>
              )}
              .
            </p>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="f-name">
            Nom complet <span className="req">*</span>
          </label>
          <input className="input" {...f("name")} autoComplete="name" required maxLength={120} />
          <E n="name" />
        </div>
        <div className="field">
          <label htmlFor="f-email">
            E-mail <span className="req">*</span>
          </label>
          <input className="input" type="email" {...f("email")} autoComplete="email" required maxLength={160} />
          <E n="email" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-phone">Téléphone</label>
          <input className="input" type="tel" {...f("phone")} autoComplete="tel" maxLength={30} placeholder="+509" />
          <E n="phone" />
        </div>
        <div className="field">
          <label htmlFor="f-company">Entreprise ou institution</label>
          <input className="input" {...f("company")} autoComplete="organization" maxLength={160} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-service">Service concerné</label>
          <select className="select" {...f("service")}>
            <option value="">— Sélectionner —</option>
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {services
                  .filter((s) => s.group === g)
                  .map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
              </optgroup>
            ))}
            <option value="autre">Autre demande</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-subject">
            Objet <span className="req">*</span>
          </label>
          <input className="input" {...f("subject")} required maxLength={160} />
          <E n="subject" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-message">
          Message <span className="req">*</span>
        </label>
        <textarea className="textarea" {...f("message")} required minLength={20} maxLength={5000} />
        <span className="field-hint">Décrivez votre besoin : équipement concerné, lieu, délai souhaité…</span>
        <E n="message" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <button className="btn" type="submit">
          Envoyer par e-mail <span className="arrow" aria-hidden="true">→</span>
        </button>
        {wa && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              const errs = validate(v);
              setErrors(errs);
              if (Object.keys(errs).length) {
                setStatus("error");
                statusRef.current?.focus();
                return;
              }
              window.open(wa, "_blank", "noopener");
            }}
          >
            Envoyer sur WhatsApp
          </button>
        )}
      </div>
      <p className="field-hint">Aucune donnée n&apos;est enregistrée par ce site : votre message part directement depuis votre messagerie.</p>
    </form>
  );
}
