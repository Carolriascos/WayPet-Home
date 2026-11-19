import Link from "next/link";
import {
  AlertMessage,
  EmptyState,
  FilterLinks,
  PetCard,
  StatusTag,
} from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import { formatDate } from "@/lib/report-options";
import type { Report } from "@/types/report";

const NOTICES: Record<string, { text: string; tone: "error" | "info" }> = {
  noexiste: { text: "El caso que buscabas no existe.", tone: "error" },
};

type CasesPageProps = {
  searchParams: Promise<{ tipo?: string; notice?: string }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const { tipo, notice } = await searchParams;
  const selected = tipo === "perdida" || tipo === "encontrada" ? tipo : undefined;

  const response = await apiFetch("/reports");
  const data = response.ok ? await response.json().catch(() => null) : null;
  const reports: Report[] | null = Array.isArray(data) ? data : null;

  const active = reports?.filter((report) => report.status === "activo").length ?? 0;
  const resolved = reports?.filter((report) => report.status === "resuelto").length ?? 0;
  const visible = reports && selected ? reports.filter((r) => r.type === selected) : reports;
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <main>
      <h1>Casos</h1>
      <p className="muted">
        Reportes de mascotas perdidas y encontradas. Si ves a alguna, abre el caso.
      </p>
      {message && <AlertMessage message={message.text} tone={message.tone} />}

      {reports && (
        <section className="stats" aria-label="Resumen de casos">
          <div className="stat">
            <strong>{active}</strong>Casos activos
          </div>
          <div className="stat">
            <strong>{resolved}</strong>Casos resueltos
          </div>
          <div className="stat">
            <strong>{reports.length}</strong>Total de casos
          </div>
        </section>
      )}

      <FilterLinks
        label="Filtrar casos por tipo"
        options={[
          { label: "Todas", href: "/", active: !selected },
          { label: "Perdidas", href: "/?tipo=perdida", active: selected === "perdida" },
          { label: "Encontradas", href: "/?tipo=encontrada", active: selected === "encontrada" },
        ]}
      />

      {visible === null && (
        <AlertMessage message="No se pudieron consultar los casos. Intenta de nuevo más tarde." />
      )}
      {visible?.length === 0 && (
        <EmptyState
          message={
            selected
              ? "No hay casos de este tipo por ahora."
              : "Todavía no hay casos reportados."
          }
        />
      )}
      {visible && visible.length > 0 && (
        <ul className="cards-grid">
          {visible.map((report) => (
            <li key={report.id}>
              <PetCard report={report}>
                <p className="muted">{formatDate(report.eventDate)}</p>
                {report.status === "resuelto" && (
                  <StatusTag label="Resuelto" tone="neutral" />
                )}
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