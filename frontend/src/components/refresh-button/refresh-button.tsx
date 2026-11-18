"use client";

import { useState } from "react";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

export default function RefreshButton() {
  const [auto, setAuto] = useState(false);
  const refresh = useAutoRefresh(auto);

  return (
    <div className="refresh">
      <button type="button" onClick={refresh}>
        Actualizar
      </button>
      <label>
        <input
          type="checkbox"
          checked={auto}
          onChange={(event) => setAuto(event.target.checked)}
        />{" "}
        Actualizar automáticamente
      </label>
    </div>
  );
}