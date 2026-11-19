
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from "@/lib/waypet-api";

type AuthActionState = {
  error: string;
};

async function getApiError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (response.status === 401) {
    return "El correo o la contraseña son incorrectos.";
  }

  if (response.status === 409) {
    return "Este correo ya está registrado.";
  }

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (data?.message) {
    return data.message;
  }

  return "Ocurrió un error. Inténtalo nuevamente.";
}

// LOGIN
export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa todos los campos." };
  }

  const apiUrl = process.env.WAYPET_API_URL;

  if (!apiUrl) {
    return { error: "No se encuentra configurada la API." };
  }

  let accessToken: string;

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { error: await getApiError(response) };
    }

    const data = (await response.json()) as {
      access_token?: string;
    };

    if (!data.access_token) {
      return { error: "El servidor no devolvió un token válido." };
    }

    accessToken = data.access_token;
  } catch {
    return {
      error: "No fue posible conectar con el servidor. Inténtalo nuevamente.",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, accessToken, AUTH_COOKIE_OPTIONS);

  redirect("/");
}

// REGISTRO
export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(
    formData.get("confirmPassword") ?? ""
  );

  if (!name || !email || !phone || !password || !confirmPassword) {
    return { error: "Completa todos los campos." };
  }

  if (password.length < 8 || password.length > 15) {
    return { error: "La contraseña debe tener entre 8 y 15 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const apiUrl = process.env.WAYPET_API_URL;

  if (!apiUrl) {
    return { error: "No se encuentra configurada la API." };
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { error: await getApiError(response) };
    }
  } catch {
    return {
      error: "No fue posible conectar con el servidor. Inténtalo nuevamente.",
    };
  }

  redirect("/login?registered=1");
}
