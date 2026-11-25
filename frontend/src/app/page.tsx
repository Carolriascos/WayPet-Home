import Image from "next/image";
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

const EXAMPLE_PHOTOS = [
  "/images/feed/examples/perrito-rubio.png",
  "/images/feed/examples/gato-pequeno.png",
  "/images/feed/examples/border-collie.png",
  "/images/feed/examples/gato-atigrado.png",
  "/images/feed/examples/gato-siames.png",
  "/images/feed/examples/husky.png",
];

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

  const examplePhotoById = new Map<number, string>(
    [...(reports ?? [])]
      .sort((a, b) => a.id - b.id)
      .slice(0, EXAMPLE_PHOTOS.length)
      .map((report, index) => [report.id, EXAMPLE_PHOTOS[index]] as [number, string]),
  );

  return (
    <main className="feed-page">
      <section className="feed-hero">
        <div className="feed-container feed-hero-inner">
          <div className="feed-hero-text">
            <h1>Conectamos pistas, acercamos hogares.</h1>
            <p>
              Reporta, encuentra coincidencias y sigue cada avistamiento de tu mascota en un
              solo lugar
            </p>
            <span className="feed-hero-badge">Más de 1.200 familias reunidas</span>
          </div>
          <Image
            src="/images/feed/hero.png"
            alt="Un perro y un gato juntos"
            width={647}
            height={403}
            priority
            className="feed-hero-image"
          />
        </div>
      </section>

      <div className="feed-container">
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

        <div className="feed-section-head">
          <div>
            <h2>Casos recientes</h2>
            <p>Mascotas perdidas y encontradas cerca de ti.</p>
          </div>
          <FilterLinks
            label="Filtrar casos por tipo"
            options={[
              { label: "Todas", href: "/", active: !selected },
              { label: "Perdidas", href: "/?tipo=perdida", active: selected === "perdida" },
              { label: "Encontradas", href: "/?tipo=encontrada", active: selected === "encontrada" },
            ]}
          />
        </div>

        {message && <AlertMessage message={message.text} tone={message.tone} />}

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
            {visible.map((report) => {
              const examplePhoto = examplePhotoById.get(report.id);
              const cardReport: Report = examplePhoto
                ? { ...report, pet: { ...report.pet, photoUrl: examplePhoto } }
                : report;

              return (
                <li key={report.id}>
                  <PetCard report={cardReport}>
                    <div className="pet-card-footer">
                      <p className="muted">{formatDate(report.eventDate)}</p>
                      {report.status === "resuelto" && (
                        <StatusTag label="Resuelto" tone="neutral" />
                      )}
                      <Link href={`/casos/${report.id}`} className="pet-card-link">
                        Ver caso
                      </Link>
                    </div>
                  </PetCard>
                </li>
              );
            })}
          </ul>
        )}

        <section className="feed-banner" aria-label="Coincidencias">
          <div className="feed-banner-text">
            <h2>Coincidencias que te acercan a casa</h2>
            <p>
              Comparamos especie, color, zona y fecha entre reportes activos y te avisamos
              cuando algo encaja.
            </p>
            <Link href="/reportar" className="feed-banner-button">
              Crear reportes
            </Link>
          </div>
          <Image
            src="/images/feed/banner-dogs.png"
            alt="Grupo de perros"
            width={879}
            height={286}
            className="feed-banner-image"
          />
        </section>
      </div>
    </main>
  );
}