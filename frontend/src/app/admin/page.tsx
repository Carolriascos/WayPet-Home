import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertMessage, EmptyState, FilterLinks, ReportTypeTag, StatusTag } from "@/components/ui/ui";
import { apiFetch, getCurrentUser } from "@/lib/waypet-api";
import type { Report } from "@/types/report";

const NOTICES: Record<string, string> = {
  guardado: "Reporte actualizado correctamente.",
};

async function getList(path: string): Promise<unknown[] | null> {
  const response = await apiFetch(path);
  const data = response?.ok ? await response.json().catch(() => null) : null;
  return Array.isArray(data) ? data : null;
}

type AdminPageProps = {
  searchParams: Promise<{ estado?: string; notice?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "administrador") redirect("/");

  const { estado, notice } = await searchParams;
  const selected = estado === "activo" || estado === "resuelto" ? estado : undefined;

  const [reportsData, cluesData, matchesData] = await Promise.all([
    getList("/reports"),
    getList("/clues"),
    getList("/matches"),
  ]);
  const reports = reportsData as Report[] | null;

  const visible = reports?.filter((report) => !selected || report.status === selected);

  return (
    <main>
      <h1>Panel de Administración</h1>
      <p className="muted">Gestiona reportes y el estado general de la plataforma.</p>
      {notice && NOTICES[notice] && <AlertMessage message={NOTICES[notice]} tone="info" />}

      <section className="stats" aria-label="Estadísticas">
        <div className="stat">
          <strong>{reports?.length ?? "-"}</strong>
          Total de reportes
        </div>
        <div className="stat">
          <strong>{cluesData?.length ?? "-"}</strong>
          Total de avistamientos
        </div>
        <div className="stat">
          <strong>{matchesData?.length ?? "-"}</strong>
          Coincidencias encontradas
        </div>
      </section>

      <h2>Gestión de reportes</h2>
      <p className="muted">Revisa, edita y actualiza la información de los reportes registrados.</p>

      <FilterLinks
        label="Filtrar reportes"
        options={[
          { label: "Todos", href: "/admin", active: !selected },
          { label: "Activos", href: "/admin?estado=activo", active: selected === "activo" },
          { label: "Resueltos", href: "/admin?estado=resuelto", active: selected === "resuelto" },
        ]}
      />

      {reports === null && <AlertMessage message="No se pudieron consultar los reportes." />}
      {visible?.length === 0 && <EmptyState message="No hay reportes para mostrar." />}

      {visible && visible.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Ubicación</th>
                <th>Editar</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((report) => (
                <tr key={report.id}>
                  <td>
                    {report.pet.photoUrl ? (
                      <img
                        src={report.pet.photoUrl}
                        alt={report.pet.name ?? report.pet.breed}
                        width={48}
                        height={48}
                      />
                    ) : (
                      <span aria-hidden="true">🐾</span>
                    )}{" "}
                    {report.pet.name ?? report.pet.breed}
                  </td>
                  <td>
                    <ReportTypeTag type={report.type} />
                  </td>
                  <td>
                    <StatusTag
                      label={report.status === "activo" ? "Activo" : "Resuelto"}
                      tone={report.status === "activo" ? "warning" : "success"}
                    />
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString("es-CO")}</td>
                  <td>{report.location}</td>
                  <td>
                    <Link href={`/admin/reportes/${report.id}`} aria-label={`Editar reporte ${report.id}`}>
                      ✏️
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}