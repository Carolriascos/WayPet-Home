import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertMessage, PetCard, SimilarityBar, StatusTag } from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import type { Match, MatchStatus } from "@/types/match";
import type { Report } from "@/types/report";

const NOTICES: Record<string, { text: string; tone: "error" | "info" }> = {
  confirmada: { text: "Coincidencia confirmada. Los reportes quedaron como resueltos.", tone: "info" },
  descartada: { text: "Coincidencia descartada.", tone: "info" },
  prohibido: { text: "Solo la persona dueña del reporte perdido puede cambiar el estado.", tone: "error" },
  yacambiada: { text: "Esta coincidencia ya no está pendiente.", tone: "error" },
  error: { text: "No se pudo cambiar el estado. Intenta de nuevo.", tone: "error" },
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

async function changeStatus(formData: FormData) {
  "use server";

  const matchId = Number(formData.get("matchId"));
  const status = formData.get("status");
  if (!Number.isSafeInteger(matchId) || matchId < 1) redirect("/coincidencias");
  if (status !== "confirmada" && status !== "descartada") {
    redirect(`/coincidencias/${matchId}?notice=error`);
  }

  const response = await apiFetch(`/matches/${matchId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (response?.status === 401) redirect("/login");
  if (response?.status === 403) redirect(`/coincidencias/${matchId}?notice=prohibido`);
  if (response?.status === 409) redirect(`/coincidencias/${matchId}?notice=yacambiada`);
  if (!response?.ok) redirect(`/coincidencias/${matchId}?notice=error`);

  redirect(`/coincidencias/${matchId}?notice=${status}`);
}

type MatchDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

export default async function MatchDetailPage({ params, searchParams }: MatchDetailPageProps) {
  const { id } = await params;
  const { notice } = await searchParams;

  const matchId = Number(id);
  if (!Number.isSafeInteger(matchId) || matchId < 1) notFound();

  const response = await apiFetch(`/matches/${matchId}`);
  if (response?.status === 401) redirect("/login");
  if (response?.status === 404) notFound();

  if (response?.status === 403) {
    return (
      <main>
        <h1>Detalles de la coincidencia</h1>
        <AlertMessage message="No tienes permiso para ver esta coincidencia." />
        <Link href="/coincidencias">Volver a coincidencias</Link>
      </main>
    );
  }

  const match: Match | null = response?.ok ? await response.json().catch(() => null) : null;

  if (!match) {
    return (
      <main>
        <h1>Detalles de la coincidencia</h1>
        <AlertMessage message="No se pudo consultar la coincidencia." />
        <Link href="/coincidencias">Volver a coincidencias</Link>
      </main>
    );
  }

  const foundResponse = await apiFetch(`/reports/${match.foundReport.id}`);
  const foundReport: Report | null = foundResponse?.ok
    ? await foundResponse.json().catch(() => null)
    : null;
  const phone = foundReport?.user?.phone?.replace(/\D/g, "");

  const features = match.matchingFeatures
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);

  const message = notice ? NOTICES[notice] : undefined;

  return (
    <main>
      <p>
        <Link href="/coincidencias">← Volver</Link>
      </p>
      <h1>Detalles de la coincidencia</h1>
      {message && <AlertMessage message={message.text} tone={message.tone} />}

      <SimilarityBar value={match.similarityPercentage} />
      <StatusTag label={STATUS_LABEL[match.status]} tone={STATUS_TONE[match.status]} />

      <section aria-label="Comparación de reportes" className="compare">
        <PetCard report={match.lostReport}>
          <p className="muted">Reporte perdido: {match.lostReport.eventDate}</p>
          <p>{match.lostReport.description}</p>
        </PetCard>
        <PetCard report={match.foundReport}>
          <p className="muted">Reporte encontrado: {match.foundReport.eventDate}</p>
          <p>{match.foundReport.description}</p>
        </PetCard>
      </section>

      <h2>Características coincidentes</h2>
      {features.length === 0 ? (
        <p className="muted">No hay características registradas.</p>
      ) : (
        <p className="chips">
          {features.map((feature) => (
            <span key={feature} className="chip">✓ {feature}</span>
          ))}
        </p>
      )}

      {match.status === "pendiente" && (
        <form action={changeStatus} className="refresh">
          <input type="hidden" name="matchId" value={match.id} />
          <button type="submit" name="status" value="confirmada">
            Marcar como resuelto
          </button>
          <button type="submit" name="status" value="descartada">
            Descartar
          </button>
        </form>
      )}

      {phone && (
        <p>
          <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">
            Contactar por WhatsApp
          </a>
        </p>
      )}
    </main>
  );
}