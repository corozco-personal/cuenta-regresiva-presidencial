"use client";

import { useEffect, useState } from "react";
import { MousePointerClick, Users } from "lucide-react";

type Snapshot = { liveUsers: number; today: { users: number; interactions: number; pageviews: number } };

export default function AudienceStrip() {
  const [data, setData] = useState<Snapshot | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/analitica?range=7", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then(setData).catch(() => undefined);
    void load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!data) return null;
  return (
    <section className="audience-strip" aria-label="Actividad del sitio en tiempo real">
      <div><span className="live-presence-dot" /><strong>{data.liveUsers}</strong><p>usuarios activos ahora</p></div>
      <div><Users size={20} /><strong>{data.today.users}</strong><p>visitantes hoy</p></div>
      <div><MousePointerClick size={20} /><strong>{data.today.interactions}</strong><p>interacciones hoy</p></div>
    </section>
  );
}
