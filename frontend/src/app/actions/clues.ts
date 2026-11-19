"use server";

import { redirect } from "next/navigation";
import { apiFetchSafe } from "@/lib/waypet-api";

export type ClueFormState = {
  error: string;
  values: Record<string, string>;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function readApiError(response: Response | null): Promise<string> {
  if (!response) {
    return "No fue posible conectar con el servidor.";
  }

  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(data?.message)) {
    return data.message.join(", ");
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  return "No se pudo guardar el avistamiento.";
}

export async function createClueAction(
  _prevState: ClueFormState,
  formData: FormData,
): Promise<ClueFormState> {
  const values = {
    reportId: text(formData, "reportId"),
    description: text(formData, "description"),
    location: text(formData, "location"),
    sightedAt: text(formData, "sightedAt"),
  };

  const reportId = Number(values.reportId);

  if (!Number.isSafeInteger(reportId) || reportId < 1) {
    return { error: "Selecciona un reporte válido.", values };
  }

  if (values.description.length < 10 || values.description.length > 500) {
    return {
      error: "La descripción debe tener entre 10 y 500 caracteres.",
      values,
    };
  }

  if (values.location.length < 3 || values.location.length > 200) {
    return {
      error: "La ubicación debe tener entre 3 y 200 caracteres.",
      values,
    };
  }

  if (!values.sightedAt) {
    return { error: "Selecciona la fecha y hora del avistamiento.", values };
  }

  const sightedDate = new Date(`${values.sightedAt}:00-05:00`);

  if (Number.isNaN(sightedDate.getTime())) {
    return { error: "La fecha y hora no son válidas.", values };
  }

  const photoEntry = formData.get("photo");

  const photo =
    typeof File !== "undefined" &&
    photoEntry instanceof File &&
    photoEntry.size > 0
      ? photoEntry
      : null;

  if (photo) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(photo.type)) {
      return {
        error: "Solo se permiten imágenes JPG, PNG, WEBP o GIF.",
        values,
      };
    }

    if (photo.size > 5 * 1024 * 1024) {
      return {
        error: "La fotografía no puede superar los 5 MB.",
        values,
      };
    }
  }

  // Construimos un formulario multipart para enviar el archivo al backend.
  const apiFormData = new FormData();

  apiFormData.append("reportId", String(reportId));
  apiFormData.append("description", values.description);
  apiFormData.append("location", values.location);
  apiFormData.append("sightedAt", sightedDate.toISOString());

  if (photo) {
    apiFormData.append("photo", photo, photo.name);
  }

  const response = await apiFetchSafe("/clues", {
    method: "POST",
    body: apiFormData,
  });

  if (!response || !response.ok) {
    return { error: await readApiError(response), values };
  }

  const created = (await response.json().catch(() => null)) as {
    id?: number;
  } | null;

  if (created?.id) {
    redirect(`/avistamientos/${created.id}?notice=creado`);
  }

  redirect("/avistamientos");
}