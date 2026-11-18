import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertMessage } from "@/components/ui/ui";
import { apiFetch, getCurrentUser } from "@/lib/waypet-api";
import type { Report } from "@/types/report";

const NOTICES: Record<string, string> = {
  prohibido: "No tienes permiso para editar este reporte.",
  invalido: "Los datos no son válidos. Revisa los campos.",
  error: "No se pudo guardar el cambio. Intenta de nuevo.",
};

async function updateReport(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) redirect("/admin");

  const response = await apiFetch(`/reports/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventDate: formData.get("eventDate"),
      location: formData.get("location"),
      description: formData.get("description"),
      status: formData.get("status"),
    }),
  });

  if (response?.status === 401) redirect("/login");
  if (response?.status === 403) redirect(`/admin/reportes/${id}?notice=prohibido`);
  if (response?.status === 400) redirect(`/admin/reportes/${id}?notice=invalido`);
  if (!response?.ok) redirect(`/admin/reportes/${id}?notice=error`);

  redirect("/admin?notice=guardado");
}

type EditReportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

export default async function EditReportPage({ params, searchParams }: EditReportPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "administrador") redirect("/");

  const { id } = await params;
  const { notice } = await searchParams;

  const reportId = Number(id);
  if (!Number.isSafeInteger(reportId) || reportId < 1) notFound();

  const response = await apiFetch(`/reports/${reportId}`);
  if (response?.status === 404) notFound();

  const report: Report | null = response?.ok ? await response.json().catch(() => null) : null;

  if (!report) {
    return (
      <main>
        <h1>Editar reporte</h1>
        <AlertMessage message="No se pudo consultar el reporte." />
        <Link href="/admin">Volver al panel</Link>
      </main>
    );
  }

  return (
    <main>
      <p>
        <Link href="/admin">← Volver al panel</Link>
      </p>
      <h1>Editar reporte #{report.id}</h1>
      <p className="muted">
        {report.type === "perdida" ? "Perdido" : "Encontrado"}: {report.pet.name ?? report.pet.breed}
      </p>
      {notice && NOTICES[notice] && <AlertMessage message={NOTICES[notice]} />}

      <form action={updateReport} className="form">
        <input type="hidden" name="id" value={report.id} />
        <label className="field">
          Fecha
          <input name="eventDate" type="date" defaultValue={report.eventDate.slice(0, 10)} required />
        </label>
        <label className="field">
          Ubicación
          <input name="location" maxLength={200} defaultValue={report.location} required />
        </label>
        <label className="field">
          Descripción
          <textarea name="description" rows={4} defaultValue={report.description} required />
        </label>
        <label className="field">
          Estado
          <select name="status" defaultValue={report.status}>
            <option value="activo">Activo</option>
            <option value="resuelto">Resuelto</option>
          </select>
        </label>
        <button type="submit">Guardar cambios</button>
      </form>
    </main>
  );
}