"use client";

import { useFormAction } from "@/lib/use-form-action";
import { useRef, useEffect } from "react";
import type { FormState } from "../../actions";
import { SubmitBar } from "@/components/admin/fields";

type Action = (p: FormState, f: FormData) => Promise<FormState>;
const PW_HINT = "12 caractères minimum, avec majuscules, minuscules et chiffres.";

export function CreateUserForm({ action }: { action: Action }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const ref = useRef<HTMLFormElement>(null);
  const e = state.errors ?? {};
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={formAction} onSubmit={onSubmit} className="a-form" style={{ gap: "0.75rem" }}>
      <label className="a-field"><span>Nom complet</span><input className="a-input" name="name" required />{e.name && <em className="a-error">{e.name}</em>}</label>
      <label className="a-field"><span>E-mail</span><input className="a-input" type="email" name="email" required autoComplete="off" />{e.email && <em className="a-error">{e.email}</em>}</label>
      <label className="a-field">
        <span>Rôle</span>
        <select className="a-input" name="role" defaultValue="EDITOR">
          <option value="EDITOR">Éditeur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
      </label>
      <label className="a-field"><span>Mot de passe initial</span><input className="a-input" type="password" name="password" required autoComplete="new-password" /><em className="a-hint">{PW_HINT}</em>{e.password && <em className="a-error">{e.password}</em>}</label>
      <SubmitBar pending={pending} state={state} label="Créer le compte" />
    </form>
  );
}

export function EditUserForm({ action, role, active, self }: { action: Action; role: string; active: boolean; self: boolean }) {
  const [state, formAction, pending, onSubmit] = useFormAction(action, {});
  const e = state.errors ?? {};
  return (
    <form action={formAction} onSubmit={onSubmit} className="a-form" style={{ gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <label className="a-field">
          <span>Rôle</span>
          <select className="a-input" name="role" defaultValue={role} disabled={self}>
            <option value="EDITOR">Éditeur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
          {self && <input type="hidden" name="role" value={role} />}
        </label>
        <label className="a-check">
          <input type="checkbox" name="active" defaultChecked={active} disabled={self} />
          <span>Compte actif</span>
          {self && <input type="hidden" name="active" value="on" />}
        </label>
        {!self && (
          <label className="a-field" style={{ flex: 1, minWidth: 220 }}>
            <span>Nouveau mot de passe (facultatif)</span>
            <input className="a-input" type="password" name="password" autoComplete="new-password" />
            {e.password && <em className="a-error">{e.password}</em>}
          </label>
        )}
      </div>
      {!self && <SubmitBar pending={pending} state={state} label="Mettre à jour" />}
      {self && <p className="a-hint">Modifiez votre propre mot de passe depuis « Mon compte ».</p>}
    </form>
  );
}
