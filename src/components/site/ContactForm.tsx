"use client";

import { useFormAction } from "@/lib/use-form-action";
import { useEffect, useRef } from "react";
import { submitContact, type ContactState } from "@/app/(site)/contact/actions";

type Opt = { value: string; label: string; group: string };

export function ContactForm({ services, defaultService }: { services: Opt[]; defaultService?: string }) {
  const [state, action, pending, onSubmit] = useFormAction<ContactState>(submitContact, { status: "idle" });
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const v = state.values ?? {};
  const err = state.errors ?? {};

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  const groups = [...new Set(services.map((s) => s.group))];
  const f = (name: string) => ({
    id: `f-${name}`,
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? `e-${name}` : undefined,
  });
  const E = ({ n }: { n: string }) => (err[n] ? <span id={`e-${n}`} className="field-error">{err[n]}</span> : null);

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className="form" noValidate>
      <div ref={statusRef} tabIndex={-1} aria-live="polite" style={{ outline: "none" }}>
        {state.status === "success" && <p className="alert alert--success">{state.message}</p>}
        {state.status === "error" && <p className="alert alert--error">{state.message}</p>}
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="f-website">Ne pas remplir</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form" key={`${state.status}-${state.message ?? ""}-${JSON.stringify(state.errors ?? {})}`}>
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-name">
            Nom complet <span className="req">*</span>
          </label>
          <input className="input" {...f("name")} autoComplete="name" required maxLength={120} defaultValue={v.name} />
          <E n="name" />
        </div>
        <div className="field">
          <label htmlFor="f-email">
            E-mail <span className="req">*</span>
          </label>
          <input className="input" type="email" {...f("email")} autoComplete="email" required maxLength={160} defaultValue={v.email} />
          <E n="email" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-phone">Téléphone</label>
          <input className="input" type="tel" {...f("phone")} autoComplete="tel" maxLength={30} defaultValue={v.phone} placeholder="+509" />
          <E n="phone" />
        </div>
        <div className="field">
          <label htmlFor="f-company">Entreprise ou institution</label>
          <input className="input" {...f("company")} autoComplete="organization" maxLength={160} defaultValue={v.company} />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="f-service">Service concerné</label>
          <select className="select" {...f("service")} defaultValue={v.service ?? defaultService ?? ""}>
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
          <input className="input" {...f("subject")} required maxLength={160} defaultValue={v.subject} />
          <E n="subject" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-message">
          Message <span className="req">*</span>
        </label>
        <textarea className="textarea" {...f("message")} required minLength={20} maxLength={5000} defaultValue={v.message} />
        <span className="field-hint">Décrivez votre besoin : équipement concerné, lieu, délai souhaité…</span>
        <E n="message" />
      </div>
      <div className="field">
        <label style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", fontWeight: 400 }}>
          <input type="checkbox" name="consent" {...{ "aria-invalid": err.consent ? true : undefined }} style={{ marginTop: "0.3rem", width: 18, height: 18, accentColor: "var(--ink)" }} />
          <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>
            J&apos;accepte que NUTE utilise ces informations pour répondre à ma demande. Elles ne sont ni vendues ni partagées. <span className="req">*</span>
          </span>
        </label>
        <E n="consent" />
      </div>
      </div>
      <div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Envoi en cours…" : "Envoyer le message"} <span className="arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
