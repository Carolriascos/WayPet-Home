import { requireToken } from "@/lib/waypet-api";
import ReportForm from "./report-form";

export default async function ReportPage() {
  await requireToken();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main>
      <h1>Reportar</h1>
      <p className="muted">
        Cuéntanos de la mascota perdida o encontrada. Con estos datos buscamos coincidencias.
      </p>
      <ReportForm today={today} />
    </main>
  );
}