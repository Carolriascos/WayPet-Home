
import Link from "next/link";
import { AlertMessage, EmptyState } from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import type { Clue } from "@/types/clue";
import styles from "./page.module.css";

function formatSightedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(date);
}

export default async function AvistamientosPage() {
  const response = await apiFetch("/clues");

  const data = response.ok
    ? await response.json().catch(() => null)
    : null;

  const clues: Clue[] | null = Array.isArray(data) ? data : null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Avistamientos recientes</h1>
          <p>
            ¿Has visto alguna mascota perdida?
            Comparte la información para ayudarla a regresar a casa.
          </p>
        </div>

        <Link href="/avistamientos/crear" className={styles.createButton}>
          + Crear avistamiento
        </Link>
      </header>

      {clues === null && (
        <AlertMessage message="No se pudieron consultar los avistamientos. Intenta nuevamente." />
      )}

      {clues?.length === 0 && (
        <EmptyState message="Todavía no hay avistamientos registrados. ¡Sé el primero en ayudar!" />
      )}

      {clues && clues.length > 0 && (
        <section className={styles.grid} aria-label="Avistamientos registrados">
          {clues.map((clue) => {
            const pet = clue.report.pet;
            const photo = clue.photoUrl || pet.photoUrl;

            return (
              <article key={clue.id} className={styles.card}>
                <div className={styles.photoContainer}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo}
                      alt={pet.name ?? pet.breed}
                      className={styles.photo}
                    />
                  ) : (
                    <div className={styles.noPhoto}>🐾</div>
                  )}

                  <span className={styles.typeTag}>
                    {clue.report.type === "perdida"
                      ? "Mascota perdida"
                      : "Mascota encontrada"}
                  </span>
                </div>

                <div className={styles.cardContent}>
                  <h2>{pet.name || pet.breed}</h2>

                  <p className={styles.location}>
                    📍 {clue.location}
                  </p>

                  <p className={styles.date}>
                    🕒 {formatSightedAt(clue.sightedAt)}
                  </p>

                  <p className={styles.description}>
                    {clue.description}
                  </p>

                  <div className={styles.chips}>
                    <span>{pet.breed}</span>
                    <span>{pet.color}</span>
                    <span>{pet.size}</span>
                  </div>

                  <Link
                    href={`/avistamientos/${clue.id}`}
                    className={styles.detailButton}
                  >
                    Ver avistamiento →
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
