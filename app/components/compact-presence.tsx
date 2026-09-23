"use client";

import { useEffect, useState } from "react";

export default function CompactPresence() {
  const [liveUsers, setLiveUsers] = useState<number | null>(null);

  useEffect(() => {
    const load = () => fetch("/api/analitica?range=7", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setLiveUsers(typeof data?.liveUsers === "number" ? data.liveUsers : null))
      .catch(() => undefined);
    void load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="compact-presence" aria-label={`${liveUsers ?? "—"} usuarios activos ahora`}>
      <span aria-hidden="true" /><strong>{liveUsers ?? "—"}</strong><small>usuarios activos</small>
    </span>
  );
}
