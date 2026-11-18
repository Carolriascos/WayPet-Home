"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAutoRefresh(enabled: boolean, intervalMs = 25000) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, intervalMs, router]);

  return () => router.refresh();
}