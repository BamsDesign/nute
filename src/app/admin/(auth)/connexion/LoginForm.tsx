"use client";

import { useFormAction } from "@/lib/use-form-action";

import { login, type FormState } from "../../actions";

export function LoginForm() {
  const [state, action, pending, onSubmit] = useFormAction<FormState>(login, {});
  return (
    <form action={action} onSubmit={onSubmit} className="a-form" style={{ gap: "1rem" }}>
      {state.message && (
        <p className="a-alert a-alert--error" role="alert">
          {state.message}
        </p>
      )}
      <label className="a-field">
        <span>E-mail</span>
        <input className="a-input" type="email" name="email" autoComplete="username" required autoFocus />
      </label>
      <label className="a-field">
        <span>Mot de passe</span>
        <input className="a-input" type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="a-btn a-btn--primary" type="submit" disabled={pending} style={{ minHeight: 44 }}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
