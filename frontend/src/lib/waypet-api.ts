import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthUser = {
  id: number;
  email: string;
  role: "usuario" | "administrador";
};

const API_URL = process.env.WAYPET_API_URL?.replace(/\/$/, "");
export const AUTH_COOKIE_NAME = "waypet_token";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60,
};

// 1. Leer el token de la cookie
export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
 return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

// 2. Exigir autenticación
export async function requireToken(): Promise<string> {
  const token = await getToken();

  if (!token) {
    redirect("/login");
  }

  return token;
}

// Construir la URL de la API
function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("WAYPET_API_URL no está configurada");
  }

  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// 3. Petición autenticada con redirección si responde 401
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await requireToken();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(getApiUrl(path), {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  return response;
}

// 3b. Igual que apiFetch, pero devuelve null si el servidor no responde
// (útil en acciones de servidor, donde un redirect no debe quedar dentro de un try/catch)
export async function apiFetchSafe(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const token = await requireToken();

  let response: Response;
  try {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);
    response = await fetch(getApiUrl(path), {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (response.status === 401) {
    redirect("/login");
  }

  return response;
}

// 4. Petición opcional sin redirecciones (para el encabezado)
export async function apiFetchOptional(
  path: string,
  options: RequestInit = {}
): Promise<Response | null> {
  const token = await getToken();

  if (!token || !API_URL) {
    return null;
  }

  try {
    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(getApiUrl(path), {
      ...options,
      headers,
      cache: "no-store",
    });

    if (response.status === 401) {
      return null;
    }

    return response;
  } catch {
    return null;
  }
}

// 5. Consultar los datos del usuario autenticado
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await apiFetchOptional("/auth/me");

    if (!response || !response.ok) {
      return null;
    }

    return (await response.json()) as AuthUser;
  } catch {
    return null;
  }
}