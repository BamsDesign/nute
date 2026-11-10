"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * Variante de useActionState qui conserve la saisie de l'utilisateur après envoi
 * (React 19 réinitialise sinon les formulaires non contrôlés, même en cas d'erreur).
 * `action` reste branché sur le formulaire pour fonctionner sans JavaScript.
 */
export function useFormAction<S>(action: (prev: Awaited<S>, form: FormData) => S | Promise<S>, initial: Awaited<S>) {
  const [state, dispatch, pending] = useActionState<S, FormData>(action, initial);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(fd));
  };
  return [state, dispatch, pending, onSubmit] as const;
}
