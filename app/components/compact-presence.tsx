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
    <a className="compact-presence" href="/reportes" aria-label={`${liveUsers ?? "—"} usuarios activos ahora. Ver reportes`}>
      <span aria-hidden="true" /><strong>{liveUsers ?? "—"}</strong><small>en vivo</small>
    </a>
  );
}
