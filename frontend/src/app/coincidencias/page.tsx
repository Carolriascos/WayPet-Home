import Link from "next/link";
import { redirect } from "next/navigation";
import RefreshButton from "@/components/refresh-button/refresh-button";
import {
  AlertMessage,
  EmptyState,
  FilterLinks,
  SimilarityBar,
  StatusTag,
} from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import type { Match, MatchStatus } from "@/types/match";
import type { Report } from "@/types/report";

const NOTICES: Record<string, { text: string; tone: "error" | "info" }> = {
  generadas: { text: "Se generaron nuevas coincidencias.", tone: "info" },
  sinnuevas: { text: "No hay coincidencias nuevas por ahora.", tone: "info" },
  prohibido: { text: "Ese reporte no es tuyo.", tone: "error" },
  inactivo: { text: "Solo se comparan reportes activos.", tone: "error" },
  error: { text: "No se pudo buscar coincidencias. Intenta de nuevo.", tone: "error" },
};

const STATUS_LABEL: Record<MatchStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  descartada: "Descartada",
};

const STATUS_TONE = {
  pendiente: "warning",
  confirmada: "success",
  descartada: "neutral",
} as const;

async function generateMatches(formData: FormData) {
  "use server";

  const reportId = Number(formData.get("reportId"));
  if (!Number.isSafeInteger(reportId) || reportId < 1) {
    redirect("/coincidencias?notice=error");
  }

  const response = await apiFetch(`/matches/report/${reportId}`, { method: "POST" });
  if (response?.status === 403) redirect("/coincidencias?notice=prohibido");
  if (response?.status === 409) redirect("/coincidencias?notice=inactivo");
  if (response?.status !== 201) redirect("/coincidencias?notice=error");

  const created = await response.json().catch(() => null);
  const found = Array.isArray(created) && created.length > 0;
  redirect(`/coincidencias?notice=${found ? "generadas" : "sinnuevas"}`);
}

type MatchesPageProps = {
  searchParams: Promise<{ estado?: string; notice?: string }>;
};

export default async function MatchesPage({ searchParams }: MatchesPageProps) {
  const { estado, notice } = await searchParams;
  const selected =
    estado === "pendiente" || estado === "confirmada" || estado === "descartada"
      ? estado
      : undefined;

  const [matchesResponse, mineResponse] = await Promise.all([
    apiFetch("/matches"),
    apiFetch("/reports/mine"),
  ]);

  const matchesData = matchesResponse?.ok
    ? await matchesResponse.json().catch(() => null)
    : null;
  const mineData = mineResponse?.ok
    ? await mineResponse.json().catch(() => null)
    : null;

  const matches: Match[] | null = Array.isArray(matchesData) ? matchesData : null;
  const myReports: Report[] = Array.isArray(mineData)
    ? mineData.filter((report: Report) => report.status === "activo")
    : [];

  const visible =
    matches && selected ? matches.filter((m) => m.status === selected) : matches;
  const message = notice ? NOTICES[notice] : undefined;

  return (
    <main>
      <h1>Coincidencias</h1>
      <p>
        Comparamos tus reportes con mascotas encontradas para acercarte a un
        posible reencuentro.
      </p>
      {message && <AlertMessage message={message.text} tone={message.tone} />}

      <section aria-label="Buscar coincidencias">
        <h2>Mis reportes activos</h2>
        {myReports.length === 0 ? (
          <EmptyState message="No tienes reportes activos. Crea uno desde Reportar." />
        ) : (
          <ul className="match-list">
            {myReports.map((report) => (
              <li key={report.id} className="match-card">
                <span>
                  {report.pet.name ?? report.pet.breed} ·{" "}
                  {report.type === "perdida" ? "Perdida" : "Encontrada"} ·{" "}
                  {report.location}
                </span>
                <form action={generateMatches}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <button type="submit">Buscar coincidencias</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2>Posibles coincidencias</h2>
      <FilterLinks
        label="Filtrar coincidencias"
        options={[
          { label: "Todas", href: "/coincidencias", active: !selected },
          {
            label: "Pendientes",
            href: "/coincidencias?estado=pendiente",
            active: selected === "pendiente",
          },
          {
            label: "Confirmadas",
            href: "/coincidencias?estado=confirmada",
            active: selected === "confirmada",
          },
          {
            label: "Descartadas",
            href: "/coincidencias?estado=descartada",
            active: selected === "descartada",
          },
        ]}
      />
      <RefreshButton />

      {visible === null && (
        <AlertMessage message="No se pudieron consultar las coincidencias." />
      )}
      {visible?.length === 0 && (
        <EmptyState message="Todavía no hay coincidencias." />
      )}
      {visible && visible.length > 0 && (
        <ul className="match-list">
          {visible.map((match) => (
            <li key={match.id} className="match-card">
              <strong>
                {match.lostReport.pet.name ?? match.lostReport.pet.breed} (perdida)
                ↔ {match.foundReport.pet.name ?? match.foundReport.pet.breed}{" "}
                (encontrada)
              </strong>
              <p className="muted">{match.foundReport.location}</p>
              <SimilarityBar value={match.similarityPercentage} />
              <StatusTag
                label={STATUS_LABEL[match.status]}
                tone={STATUS_TONE[match.status]}
              />
              <Link href={`/coincidencias/${match.id}`}>Ver detalles</Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}