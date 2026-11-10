"use client";

import { useFormAction } from "@/lib/use-form-action";

import type { FormState } from "../../../actions";
import { SubmitBar } from "@/components/admin/fields";
import { MEDIA_CATEGORIES } from "@/lib/taxonomy";

export function MediaEditForm({ action, alt, caption, category }: { action: (p: FormState, f: FormData) => Promise<FormState>; alt: string; caption: string; category: string }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form" style={{ gap: "0.75rem" }}>
      <label className="a-field">
        <span>Description (texte alternatif)</span>
        <textarea className="a-input" name="alt" rows={3} defaultValue={alt} maxLength={300} placeholder="Décrivez précisément ce que montre l'image." />
        <em className="a-hint">Lue par les lecteurs d&apos;écran et utilisée par les moteurs de recherche.</em>
      </label>
      <label className="a-field">
        <span>Légende (facultatif)</span>
        <input className="a-input" name="caption" defaultValue={caption} maxLength={500} />
      </label>
      <label className="a-field">
        <span>Catégorie</span>
        <select className="a-input" name="category" defaultValue={category}>
          {MEDIA_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
