"use server";

import { redirect } from "next/navigation";
import { apiFetchSafe } from "@/lib/waypet-api";
import {
  SEX_OPTIONS,
  SIZE_OPTIONS,
  buildCharacteristics,
} from "@/lib/report-options";

export type ReportFormState = {
  error: string;
  values: Record<string, string>;
};

async function readApiError(response: Response | null): Promise<string> {
  if (!response) {
    return "No fue posible conectar con el servidor. Inténtalo nuevamente.";
  }

  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(data?.message)) return data.message.join(", ");
  if (typeof data?.message === "string") return data.message;
  return "No se pudo guardar el reporte. Inténtalo nuevamente.";
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// REPORTAR: crea el reporte y lleva al detalle del caso
export async function createReportAction(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const values = {
    type: text(formData, "type"),
    species: text(formData, "species"),
    petName: text(formData, "petName"),
    breed: text(formData, "breed"),
    sex: text(formData, "sex"),
    size: text(formData, "size"),
    color: text(formData, "color"),
    signs: text(formData, "signs"),
    description: text(formData, "description"),
    location: text(formData, "location"),
    eventDate: text(formData, "eventDate"),
    photoUrl: text(formData, "photoUrl"),
  };

  if (
    !values.type ||
    !values.species ||
    !values.breed ||
    !values.sex ||
    !values.size ||
    !values.color ||
    !values.description ||
    !values.location ||
    !values.eventDate
  ) {
    return { error: "Completa todos los campos obligatorios.", values };
  }

  if (!(SEX_OPTIONS as readonly string[]).includes(values.sex)) {
    return { error: "Elige un sexo de la lista.", values };
  }
  if (!(SIZE_OPTIONS as readonly string[]).includes(values.size)) {
    return { error: "Elige un tamaño de la lista.", values };
  }

  const payload = {
    type: values.type,
    petName: values.petName || undefined,
    breed: values.breed,
    color: values.color,
    size: values.size,
    sex: values.sex,
    characteristics: buildCharacteristics(values.species, values.signs),
    eventDate: values.eventDate,
    location: values.location,
    description: values.description,
    photoUrl: values.photoUrl || undefined,
  };

  const response = await apiFetchSafe("/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response || !response.ok) {
    return { error: await readApiError(response), values };
  }

  const created = (await response.json().catch(() => null)) as {
    id?: number;
  } | null;

  if (!created?.id) {
    redirect("/mis-reportes?notice=creado");
  }

  redirect(`/casos/${created.id}?notice=creado`);
}

function parseId(formData: FormData): number {
  const id = Number(formData.get("reportId"));
  if (!Number.isSafeInteger(id) || id < 1) redirect("/");
  return id;
}

// DETALLE: editar ubicación y descripción (dueño o administrador)
export async function updateReportAction(formData: FormData) {
  const id = parseId(formData);
  const location = text(formData, "location");
  const description = text(formData, "description");

  if (!location || !description) {
    redirect(`/casos/${id}?notice=invalido`);
  }

  const response = await apiFetchSafe(`/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, description }),
  });

  if (response?.status === 403) redirect(`/casos/${id}?notice=prohibido`);
  if (response?.status === 404) redirect("/");
  if (response?.status === 400) redirect(`/casos/${id}?notice=invalido`);
  if (!response?.ok) redirect(`/casos/${id}?notice=error`);

  redirect(`/casos/${id}?notice=actualizado`);
}

// DETALLE: marcar el caso como resuelto (dueño o administrador)
export async function resolveReportAction(formData: FormData) {
  const id = parseId(formData);

  const response = await apiFetchSafe(`/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "resuelto" }),
  });

  if (response?.status === 403) redirect(`/casos/${id}?notice=prohibido`);
  if (response?.status === 404) redirect("/");
  if (!response?.ok) redirect(`/casos/${id}?notice=error`);

  redirect(`/casos/${id}?notice=resuelto`);
}