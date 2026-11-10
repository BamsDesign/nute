"use client";

import { useFormAction } from "@/lib/use-form-action";
import { useState } from "react";
import type { FormState } from "../../actions";
import { SubmitBar } from "@/components/admin/fields";

export function TranslationsForm({ action, keys, base, values, locales }: { action: (p: FormState, f: FormData) => Promise<FormState>; keys: string[]; base: Record<string, string>; values: Record<string, string>; locales: { code: string; label: string }[] }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const [filter, setFilter] = useState("");
  const shown = keys.filter((k) => !filter || k.includes(filter) || base[k].toLowerCase().includes(filter.toLowerCase()));
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form">
      <input className="a-input" type="search" placeholder="Filtrer…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth: 320 }} aria-label="Filtrer les textes" />
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Clé</th>
              {locales.map((l) => (
                <th key={l.code}>{l.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k} hidden={!shown.includes(k)}>
                <td className="a-mono" style={{ whiteSpace: "nowrap" }}>{k}</td>
                {locales.map((l) => (
                  <td key={l.code} style={{ minWidth: 220 }}>
                    <textarea className="a-input" rows={k.startsWith("contact.") || k.startsWith("empty.") ? 3 : 1} name={`${l.code}::${k}`} defaultValue={values[`${l.code}::${k}`] ?? ""} placeholder={l.code === "fr" ? base[k] : `(${base[k]})`} aria-label={`${k} — ${l.label}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
