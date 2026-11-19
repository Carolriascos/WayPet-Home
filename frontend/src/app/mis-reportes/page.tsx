import Link from "next/link";
import {
  AlertMessage,
  EmptyState,
  PetCard,
  StatusTag,
} from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import { formatDate } from "@/lib/report-options";
import type { Report } from "@/types/report";

const NOTICES: Record<string, { text: string; tone: "error" | "info" }> = {
  creado: { text: "Tu reporte se publicó correctamente.", tone: "info" },
};

type MyReportsPageProps = {
  searchParams: Promise<{ notice?: string }>;
};

export default async function MyReportsPage({ searchParams }: MyReportsPageProps) {
  const { notice } = await searchParams;

  const response = await apiFetch("/reports/mine");
  const data = response.ok ? await response.json().catch(() => null) : null;
  const reports: Report[] | null = Array.isArray(data) ? data : null;
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <main>
      <h1>Mis reportes</h1>
      <p className="muted">Los reportes que has publicado.</p>
      {message && <AlertMessage message={message.text} tone={message.tone} />}

      {reports === null && (
        <AlertMessage message="No se pudieron consultar tus reportes. Intenta de nuevo más tarde." />
      )}
      {reports?.length === 0 && (
        <EmptyState message="Aún no has publicado reportes. Crea uno desde Reportar." />
      )}
      {reports && reports.length > 0 && (
        <ul className="cards-grid">
          {reports.map((report) => (
            <li key={report.id}>
              <PetCard report={report}>
                <p className="muted">{formatDate(report.eventDate)}</p>
                <StatusTag
                  label={report.status === "activo" ? "Activo" : "Resuelto"}
                  tone={report.status === "activo" ? "warning" : "neutral"}
                />
                <p>
                  <Link href={`/casos/${report.id}`}>Ver caso</Link>
                </p>
              </PetCard>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}