import Image from "next/image";
import Link from "next/link";
import { AlertMessage, EmptyState } from "@/components/ui/ui";
import CaseCard from "@/components/case-card/case-card";
import { apiFetch } from "@/lib/waypet-api";
import type { Report } from "@/types/report";
import styles from "./page.module.css";

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

  const filters = [
    { label: "Todas", href: "/", active: !selected },
    { label: "Perdidas", href: "/?tipo=perdida", active: selected === "perdida" },
    { label: "Encontradas", href: "/?tipo=encontrada", active: selected === "encontrada" },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h1>
            Conectamos pistas,
            <br />
            acercamos hogares.
          </h1>
          <p>
            Reporta, encuentra coincidencias y sigue cada avistamiento de tu mascota en un
            solo lugar
          </p>
          <span className={styles.pill}>Más de 1.200 familias reunidas</span>
        </div>

        <Image
          src="/images/feed/hero.png"
          alt="Un perro y un gato juntos, mirando a la cámara"
          width={647}
          height={403}
          className={styles.heroImage}
          priority
        />
      </section>

      {reports && (
        <section className={styles.stats} aria-label="Resumen de casos">
          <div className={styles.stat}>
            <strong>{active}</strong>
            <span>Casos activos</span>
          </div>
          <div className={styles.stat}>
            <strong>{resolved}</strong>
            <span>Casos resueltos</span>
          </div>
          <div className={styles.stat}>
            <strong>{reports.length}</strong>
            <span>Total de casos</span>
          </div>
        </section>
      )}

      <section className={styles.recent} aria-labelledby="recent-title">
        <div className={styles.recentHead}>
          <div>
            <h2 id="recent-title">Casos recientes</h2>
            <p>Mascotas perdidas y encontradas cerca de ti.</p>
          </div>

          <nav className={styles.filters} aria-label="Filtrar casos por tipo">
            {filters.map((filter) => (
              <Link
                key={filter.href}
                href={filter.href}
                aria-current={filter.active ? "page" : undefined}
                className={filter.active ? `${styles.filter} ${styles.filterActive}` : styles.filter}
              >
                {filter.label}
              </Link>
            ))}
          </nav>
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
          <ul className={styles.grid}>
            {visible.map((report) => (
              <li key={report.id}>
                <CaseCard report={report} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.banner} aria-labelledby="banner-title">
        <div className={styles.bannerText}>
          <h2 id="banner-title">
            Coincidencias que te
            <br />
            acercan a casa
          </h2>
          <p>
            Comparamos especie, color, zona y fecha entre reportes activos y te avisamos cuando
            algo encaja.{" "}
            <Link href="/reportar" className={styles.bannerButton}>
              Crear reportes
            </Link>
          </p>
        </div>

        <Image
          src="/images/feed/banner-dogs.png"
          alt="Grupo de cachorros de distintas razas"
          width={879}
          height={286}
          className={styles.bannerImage}
        />
      </section>
    </main>
  );
}