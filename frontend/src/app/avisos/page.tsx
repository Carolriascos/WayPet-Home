import { redirect } from "next/navigation";
import { AlertMessage, EmptyState, FilterLinks } from "@/components/ui/ui";
import { apiFetch } from "@/lib/waypet-api";
import type { Notification } from "@/types/notification";

async function openNotification(formData: FormData) {
  "use server";

  const notificationId = Number(formData.get("notificationId"));
  const matchId = Number(formData.get("matchId"));
  if (!Number.isSafeInteger(notificationId) || notificationId < 1) redirect("/avisos");

  const response = await apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
  if (response?.status === 401) redirect("/login");

  if (Number.isSafeInteger(matchId) && matchId > 0) redirect(`/coincidencias/${matchId}`);
  redirect("/avisos");
}

function timeAgo(isoDate: string) {
  const minutes = Math.round((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (minutes < 1) return "Hace un momento";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
  return `Hace ${Math.floor(minutes / 1440)} d`;
}

type NoticesPageProps = {
  searchParams: Promise<{ filtro?: string }>;
};

export default async function NoticesPage({ searchParams }: NoticesPageProps) {
  const { filtro } = await searchParams;
  const selected = filtro === "sinleer" || filtro === "leidas" ? filtro : undefined;

  const response = await apiFetch("/notifications");
  if (response?.status === 401) redirect("/login");

  const data = response?.ok ? await response.json().catch(() => null) : null;
  const notifications: Notification[] | null = Array.isArray(data) ? data : null;

  const visible = notifications?.filter((notification) => {
    if (selected === "sinleer") return !notification.isRead;
    if (selected === "leidas") return notification.isRead;
    return true;
  });

  return (
    <main>
      <h1>Avisos</h1>
      <p className="muted">Mantente al tanto de las novedades sobre tus reportes.</p>

      <FilterLinks
        label="Filtrar avisos"
        options={[
          { label: "Todas", href: "/avisos", active: !selected },
          { label: "Sin leer", href: "/avisos?filtro=sinleer", active: selected === "sinleer" },
          { label: "Leídas", href: "/avisos?filtro=leidas", active: selected === "leidas" },
        ]}
      />

      {notifications === null && <AlertMessage message="No se pudieron consultar los avisos." />}
      {visible?.length === 0 && <EmptyState message="No hay avisos para mostrar." />}

      {visible && visible.length > 0 && (
        <ul className="match-list">
          {visible.map((notification) => (
            <li key={notification.id} className="match-card">
              <form action={openNotification}>
                <input type="hidden" name="notificationId" value={notification.id} />
                <input type="hidden" name="matchId" value={notification.match?.id ?? ""} />
                <button type="submit" className="btn-link">
                  {notification.isRead ? "" : "● "}
                  Nueva coincidencia encontrada
                </button>
              </form>
              <p>{notification.message}</p>
              <p className="muted">{timeAgo(notification.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}