
import Link from "next/link";
import { AlertMessage, EmptyState } from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import type { Report } from "@/types/report";
import CreateClueForm from "./create-clue-form";
import styles from "./page.module.css";

export default async function CrearAvistamientoPage() {
  const response = await apiFetch("/reports");

  const data = response.ok
    ? await response.json().catch(() => null)
    : null;

  const reports: Report[] | null = Array.isArray(data) ? data : null;

  if (reports === null) {
    return (
      <main className={styles.page}>
        <Link href="/avistamientos" className={styles.backLink}>
          ← Volver a avistamientos
        </Link>
        <h1>Crear avistamiento</h1>
        <AlertMessage message="No se pudieron consultar los reportes. Intenta nuevamente." />
      </main>
    );
  }

  const activeReports = reports.filter(
    (report) => report.status === "activo"
  );

  return (
    <main className={styles.page}>
      <Link href="/avistamientos" className={styles.backLink}>
        ← Volver a avistamientos
      </Link>

      <header className={styles.header}>
        <h1>Crear avistamiento</h1>
        <p>
          ¿Viste una mascota que está siendo buscada?
          Comparte la información para ayudarla a regresar a casa.
        </p>
      </header>

      {activeReports.length === 0 ? (
        <EmptyState message="No hay reportes activos disponibles para asociar un avistamiento." />
      ) : (
        <CreateClueForm reports={activeReports} />
      )}
    </main>
  );
}
