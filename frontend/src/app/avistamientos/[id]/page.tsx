
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertMessage, StatusTag } from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import type { Clue } from "@/types/clue";
import styles from "./page.module.css";

type DetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(date);
}

function getPhotoUrl(value: string | null): string | null {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = (
    process.env.WAYPET_API_URL ?? "http://localhost:3000/api"
  ).replace(/\/api\/?$/, "");

  return new URL(
    value.startsWith("/") ? value : `/${value}`,
    baseUrl
  ).toString();
}

export default async function AvistamientoDetallePage({
  params,
  searchParams,
}: DetailPageProps) {
  const { id } = await params;
  const { notice } = await searchParams;

  const clueId = Number(id);

  if (!Number.isSafeInteger(clueId) || clueId < 1) {
    notFound();
  }

  const response = await apiFetch(`/clues/${clueId}`);

  if (response.status === 404) {
    notFound();
  }

  const clue: Clue | null = response.ok
    ? await response.json().catch(() => null)
    : null;

  if (!clue) {
    return (
      <main className={styles.page}>
        <h1>Detalle del avistamiento</h1>
        <AlertMessage message="No se pudo consultar el avistamiento. Intenta nuevamente." />
        <Link href="/avistamientos">Volver a avistamientos</Link>
      </main>
    );
  }

  const pet = clue.report.pet;
  const photo = getPhotoUrl(clue.photoUrl || pet.photoUrl);

  return (
    <main className={styles.page}>
      <Link href="/avistamientos" className={styles.backLink}>
        ← Volver a avistamientos
      </Link>

      {notice === "creado" && (
        <AlertMessage
          tone="info"
          message="¡El avistamiento se registró correctamente!"
        />
      )}

      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>DETALLE DEL AVISTAMIENTO</span>
          <h1>{pet.name || pet.breed}</h1>
          <p>Información compartida por la comunidad WayPet Home.</p>
        </div>

        <StatusTag
          label={
            clue.report.status === "activo"
              ? "Caso activo"
              : "Caso resuelto"
          }
          tone={clue.report.status === "activo" ? "warning" : "neutral"}
        />
      </header>

      <section className={styles.content}>
        <article className={styles.photoCard}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={pet.name || pet.breed}
              className={styles.photo}
            />
          ) : (
            <div className={styles.noPhoto}>🐾</div>
          )}
        </article>

        <div className={styles.details}>
          <section className={styles.card}>
            <h2>Información del avistamiento</h2>

            <div className={styles.infoItem}>
              <span>📍 Ubicación</span>
              <strong>{clue.location}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>🕒 Fecha y hora</span>
              <strong>{formatDate(clue.sightedAt)}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>📝 Descripción</span>
              <p>{clue.description}</p>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Información de la mascota</h2>

            <div className={styles.infoItem}>
              <span>Nombre</span>
              <strong>{pet.name || "No especificado"}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Raza</span>
              <strong>{pet.breed}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Color</span>
              <strong>{pet.color}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Tamaño</span>
              <strong>{pet.size}</strong>
            </div>

            <div className={styles.infoItem}>
              <span>Sexo</span>
              <strong>{pet.sex}</strong>
            </div>
          </section>

          <section className={styles.reportCard}>
            <h2>Reporte relacionado</h2>

            <p>
              {clue.report.type === "perdida"
                ? "Mascota reportada como perdida"
                : "Mascota reportada como encontrada"}
            </p>

            <p>Ubicación original: {clue.report.location}</p>

            <p>Fecha del reporte: {clue.report.eventDate}</p>

            <p>{clue.report.description}</p>

            <Link href={`/casos/${clue.report.id}`}>
              Consultar reporte original →
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
