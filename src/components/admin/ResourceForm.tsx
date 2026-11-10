"use client";

import { useFormAction } from "@/lib/use-form-action";

import type { Field } from "@/lib/admin/resources";
import type { FormState } from "@/app/admin/actions";
import { GalleryField, ImageField, ListField, SubmitBar } from "./fields";

type GItem = { mediaId: string; kind: string; caption: string; url: string; thumbUrl: string | null; alt: string; mimeType: string };

export function ResourceForm({
  action,
  fields,
  values,
  relationOptions,
  gallery,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  fields: Field[];
  values: Record<string, string | boolean>;
  relationOptions: Record<string, { value: string; label: string }[]>;
  gallery: GItem[];
}) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const err = state.errors ?? {};

  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form" noValidate>
      {state.message && !state.ok && <p className="a-alert a-alert--error">{state.message}</p>}
      <div className="a-grid">
        {fields.map((f) => {
          const id = `fld-${f.name}`;
          const e = err[f.name];
          const val = values[f.name];
          const cls = `a-field ${"half" in f && f.half ? "" : "a-field--full"}`;
          const req = "required" in f && f.required;
          const lbl = (
            <span>
              {f.label}
              {req && <b aria-hidden="true"> *</b>}
            </span>
          );
          const hint = f.hint && <em className="a-hint">{f.hint}</em>;
          const errEl = e && <em className="a-error" id={`${id}-err`}>{e}</em>;
          const aria = { id, name: f.name, "aria-invalid": e ? true : undefined, "aria-describedby": e ? `${id}-err` : undefined };

          switch (f.type) {
            case "section":
              return (
                <div key={f.name} className="a-section">
                  <h3>{f.label}</h3>
                  {f.hint && <p className="a-hint">{f.hint}</p>}
                </div>
              );
            case "text":
            case "url":
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <input className="a-input" type={f.type === "url" ? "text" : "text"} inputMode={f.type === "url" ? "url" : undefined} defaultValue={String(val ?? "")} maxLength={f.max} placeholder={f.type === "text" ? f.placeholder : "https://"} required={req} {...aria} />
                  {hint}
                  {errEl}
                </label>
              );
            case "slug":
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <input className="a-input a-mono" defaultValue={String(val ?? "")} maxLength={80} placeholder="généré automatiquement" {...aria} />
                  {errEl}
                </label>
              );
            case "textarea":
            case "markdown":
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <textarea className={`a-input ${f.type === "markdown" ? "a-mono" : ""}`} rows={f.rows ?? 4} defaultValue={String(val ?? "")} maxLength={f.max} required={req} {...aria} />
                  {f.type === "markdown" && <em className="a-hint">Mise en forme Markdown : ## Titre, **gras**, *italique*, - liste, [lien](https://…).</em>}
                  {hint}
                  {errEl}
                </label>
              );
            case "number":
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <input className="a-input" type="number" defaultValue={String(val ?? "")} min={f.min} max={f.max} step={f.step ?? 1} {...aria} />
                  {hint}
                  {errEl}
                </label>
              );
            case "date":
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <input className="a-input" type={f.withTime ? "datetime-local" : "date"} defaultValue={String(val ?? "")} {...aria} />
                  {hint}
                  {errEl}
                </label>
              );
            case "boolean":
              return (
                <label key={f.name} className={`${cls} a-check`} htmlFor={id}>
                  <input type="checkbox" id={id} name={f.name} defaultChecked={Boolean(val)} />
                  <span>{f.label}</span>
                </label>
              );
            case "select":
            case "relation": {
              const opts = f.type === "select" ? f.options : (relationOptions[f.name] ?? []);
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <select className="a-input" defaultValue={String(val ?? "")} {...aria}>
                    <option value="">— Aucun —</option>
                    {opts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  {hint}
                  {errEl}
                </label>
              );
            }
            case "image":
              return <ImageField key={f.name} name={f.name} altName={f.altField} label={f.label} defaultUrl={String(val ?? "")} defaultAlt={f.altField ? String(values[f.altField] ?? "") : undefined} error={e} altError={f.altField ? err[f.altField] : undefined} />;
            case "tags":
              return (
                <label key={f.name} className={cls} htmlFor={id}>
                  {lbl}
                  <textarea className="a-input" rows={4} defaultValue={String(val ?? "")} {...aria} />
                  {hint}
                  {errEl}
                </label>
              );
            case "list":
              return <ListField key={f.name} name={f.name} label={f.label} itemFields={f.itemFields} defaultValue={String(val ?? "[]")} error={e} />;
            case "gallery":
              return <GalleryField key={f.name} label={f.label} defaultItems={gallery} kinds={f.kinds} error={err.__gallery} />;
          }
        })}
      </div>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
