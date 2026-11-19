
"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="auth-form">
      <label className="auth-field">
        <span className="sr-only">Correo electrónico</span>
        <input
          className="auth-input"
          type="email"
          name="email"
          placeholder="Correo Electrónico"
          autoComplete="email"
          required
        />
      </label>

      <label className="auth-field">
        <span className="sr-only">Contraseña</span>
        <input
          className="auth-input"
          type="password"
          name="password"
          placeholder="Contraseña"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error && (
        <p className="auth-error" role="alert">
          {state.error}
        </p>
      )}

      <button
        className="auth-submit"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Ingresando..." : "Iniciar Sesión"}
      </button>
    </form>
  );
}
