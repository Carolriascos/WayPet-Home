import { apiFetchOptional } from "@/lib/waypet-api";
import type { Notification } from "@/types/notification";

export async function getUnreadCount(): Promise<number> {
  const response = await apiFetchOptional("/notifications");
  if (!response?.ok) return 0;

  const data = await response.json().catch(() => null);
  if (!Array.isArray(data)) return 0;

  return (data as Notification[]).filter((notification) => !notification.isRead).length;
}