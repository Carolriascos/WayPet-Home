import Link from "next/link";
import { formatDate } from "@/lib/report-options";
import type { Report } from "@/types/report";
import styles from "./case-card.module.css";

/** Misma información que el PetCard original, con el estilo del diseño del feed. */
export default function CaseCard({ report }: { report: Report }) {
  const { pet } = report;
  const lost = report.type === "perdida";

  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        {pet.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.photoUrl} alt={pet.name ?? pet.breed} />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            🐾
          </span>
        )}
        <span className={`${styles.tag} ${lost ? styles.lost : styles.found}`}>
          {lost ? "Perdido" : "Encontrado"}
        </span>
        {report.status === "resuelto" && (
          <span className={`${styles.tag} ${styles.resolved}`}>Resuelto</span>
        )}
      </div>

      <h3 className={styles.title}>{pet.name ?? pet.breed}</h3>
      <p className={styles.meta}>
        {report.location} - {formatDate(report.eventDate)}
      </p>

      <div className={styles.actions}>
        <span className={styles.chip} title={[pet.sex, pet.size, pet.color].filter(Boolean).join(" · ")}>
          {pet.breed}
        </span>
        <Link href={`/casos/${report.id}`} className={styles.view}>
          Ver Caso
        </Link>
      </div>
    </article>
  );
}