"use client";

import { useFormAction } from "@/lib/use-form-action";

import type { FormState } from "../../actions";
import { SubmitBar } from "@/components/admin/fields";

export function PasswordForm({ action }: { action: (p: FormState, f: FormData) => Promise<FormState> }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const e = state.errors ?? {};
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form" style={{ gap: "0.75rem" }}>
      <label className="a-field"><span>Mot de passe actuel</span><input className="a-input" type="password" name="current" autoComplete="current-password" required />{e.current && <em className="a-error">{e.current}</em>}</label>
      <label className="a-field"><span>Nouveau mot de passe</span><input className="a-input" type="password" name="next" autoComplete="new-password" required /><em className="a-hint">12 caractères minimum, avec majuscules, minuscules et chiffres.</em>{e.next && <em className="a-error">{e.next}</em>}</label>
      <label className="a-field"><span>Confirmation</span><input className="a-input" type="password" name="confirm" autoComplete="new-password" required />{e.confirm && <em className="a-error">{e.confirm}</em>}</label>
      <SubmitBar pending={pending} state={state} label="Modifier le mot de passe" />
    </form>
  );
}
