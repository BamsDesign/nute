"use client";

import { useFormAction } from "@/lib/use-form-action";

import type { FormState } from "../../../actions";
import { SubmitBar } from "@/components/admin/fields";

const STATUSES = [
  ["NEW", "Nouvelle"],
  ["IN_PROGRESS", "En cours"],
  ["DONE", "Traitée"],
  ["ARCHIVED", "Archivée"],
];

export function ContactStatusForm({ action, status, notes }: { action: (p: FormState, f: FormData) => Promise<FormState>; status: string; notes: string }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form" style={{ gap: "0.75rem" }}>
      <label className="a-field">
        <span>Statut</span>
        <select className="a-input" name="status" defaultValue={status}>
          {STATUSES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>
      <label className="a-field">
        <span>Notes internes</span>
        <textarea className="a-input" name="notes" rows={5} defaultValue={notes} maxLength={5000} />
      </label>
      <SubmitBar pending={pending} state={state} />
    </form>
  );
}
