
"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";

const initialState = { error: "" };

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState
  );

  return (
    <form action={formAction} className="register-form">
      <label className="register-field">
        <span>Nombre completo</span>
        <input
          type="text"
          name="name"
          placeholder="Tu nombre"
          autoComplete="name"
          maxLength={100}
          required
        />
      </label>

      <label className="register-field">
        <span>Correo electrónico</span>
        <input
          type="email"
          name="email"
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          maxLength={200}
          required
        />
      </label>

      <label className="register-field">
        <span>Teléfono</span>
        <input
          type="tel"
          name="phone"
          placeholder="Tu número de teléfono"
          autoComplete="tel"
          maxLength={20}
          required
        />
      </label>

      <label className="register-field">
        <span>Contraseña</span>
        <input
          type="password"
          name="password"
          placeholder="Entre 8 y 15 caracteres"
          autoComplete="new-password"
          minLength={8}
          maxLength={15}
          pattern="[A-Za-z0-9 _-]{8,15}"
          title="Usa entre 8 y 15 caracteres: letras, números, espacios o guiones."
          required
        />
      </label>

      <label className="register-field">
        <span>Confirmar contraseña</span>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          minLength={8}
          maxLength={15}
          required
        />
      </label>

      {state.error && (
        <p className="register-error" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className="register-submit"
        disabled={isPending}
      >
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
