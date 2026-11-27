import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveReportAction, updateReportAction } from "@/app/actions/reports";
import { AlertMessage, PetCard, StatusTag } from "@/components/ui/ui";
import { apiFetch, getCurrentUser } from "@/lib/waypet-api";
import { formatDate, parseCharacteristics } from "@/lib/report-options";
import type { Report } from "@/types/report";

const NOTICES: Record<string, { text: string; tone: "error" | "info" }> = {
  creado: { text: "Reporte creado correctamente.", tone: "info" },
  actualizado: { text: "Los cambios se guardaron.", tone: "info" },
  resuelto: { text: "El caso quedó marcado como resuelto.", tone: "info" },
  prohibido: { text: "No tienes permiso para modificar este reporte.", tone: "error" },
  invalido: { text: "La ubicación y la descripción no pueden estar vacías.", tone: "error" },
  error: { text: "No se pudo completar la acción. Intenta de nuevo.", tone: "error" },
};

type CaseDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

export default async function CaseDetailPage({ params, searchParams }: CaseDetailPageProps) {
  const { id } = await params;
  const { notice } = await searchParams;

  const reportId = Number(id);
  if (!Number.isSafeInteger(reportId) || reportId < 1) notFound();

  const [response, user] = await Promise.all([
    apiFetch(`/reports/${reportId}`),
    getCurrentUser(),
  ]);

  if (response.status === 404) notFound();

  const report: Report | null = response.ok
    ? await response.json().catch(() => null)
    : null;

  if (!report) {
    return (
      <main>
        <h1>Detalle del caso</h1>
        <AlertMessage message="No se pudo consultar el caso. Intenta de nuevo más tarde." />
        <Link href="/">Volver a casos</Link>
      </main>
    );
  }

  const isOwner = !!user && report.user?.id === user.id;
  const canEdit = isOwner || user?.role === "administrador";
  const { species, signs } = parseCharacteristics(report.pet.characteristics);
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <main>
      <p>
        <Link href="/">← Volver a casos</Link>
      </p>
      <h1>{report.pet.name ?? report.pet.breed}</h1>
      {message && <AlertMessage message={message.text} tone={message.tone} />}

      <StatusTag
        label={report.status === "activo" ? "Caso activo" : "Caso resuelto"}
        tone={report.status === "activo" ? "warning" : "neutral"}
      />

      <section aria-label="Datos del caso" className="compare">
        <PetCard report={report} />
        <article className="pet-card">
          <h2>Datos del reporte</h2>
          <dl>
            <dt>Tipo</dt>
            <dd>{report.type === "perdida" ? "Mascota perdida" : "Mascota encontrada"}</dd>
            {species && (
              <>
                <dt>Especie</dt>
                <dd>{species}</dd>
              </>
            )}
            <dt>Raza</dt>
            <dd>{report.pet.breed}</dd>
            <dt>Sexo</dt>
            <dd>{report.pet.sex}</dd>
            <dt>Tamaño</dt>
            <dd>{report.pet.size}</dd>
            <dt>Color</dt>
            <dd>{report.pet.color}</dd>
            {signs && (
              <>
                <dt>Señas particulares</dt>
                <dd>{signs}</dd>
              </>
            )}
            <dt>Fecha</dt>
            <dd>{formatDate(report.eventDate)}</dd>
            <dt>Ubicación</dt>
            <dd>{report.location}</dd>
            <dt>Descripción</dt>
            <dd>{report.description}</dd>
            {report.user && (
              <>
                <dt>Publicado por</dt>
                <dd>{report.user.name}</dd>
              </>
            )}
          </dl>
        </article>
      </section>

      {canEdit ? (
        <section aria-label="Gestionar caso">
          <h2>Editar caso</h2>
          <form action={updateReportAction} className="form">
            <input type="hidden" name="reportId" value={report.id} />
            <label className="field">
              <span>Ubicación</span>
              <input name="location" defaultValue={report.location} maxLength={200} required />
            </label>
            <label className="field">
              <span>Descripción</span>
              <textarea name="description" defaultValue={report.description} rows={4} required />
            </label>
            <div>
              <button type="submit">Guardar cambios</button>
            </div>
          </form>

          {report.status === "activo" && (
            <form action={resolveReportAction} className="refresh">
              <input type="hidden" name="reportId" value={report.id} />
              <button type="submit">Marcar como resuelto</button>
            </form>
          )}
        </section>
      ) : (
        <AlertMessage
          tone="info"
          message="Solo la persona que publicó este reporte o un administrador pueden editarlo."
        />
      )}
    </main>
  );
}