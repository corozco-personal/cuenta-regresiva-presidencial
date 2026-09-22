"use client";

import { useEffect } from "react";

const STORAGE_KEY = "cuenta-publica-session";

function sessionId() {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const created = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
}

function send(payload: Record<string, string>) {
  const body = JSON.stringify({ ...payload, sessionId: sessionId(), page: window.location.pathname });
  if (navigator.sendBeacon) navigator.sendBeacon("/api/analitica", new Blob([body], { type: "application/json" }));
  else void fetch("/api/analitica", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
}

export default function AnalyticsTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/cotejo-7d41e9c2")) return;
    send({ action: "event", eventType: "pageview", eventName: "Vista de página" });
    const heartbeat = () => { if (document.visibilityState === "visible") send({ action: "heartbeat" }); };
    const interval = window.setInterval(heartbeat, 60_000);
    const handleClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a, button, [data-analytics]") as HTMLElement | null;
      if (!target) return;
      const label = target.dataset.analytics || target.getAttribute("aria-label") || target.textContent || target.tagName;
      send({ action: "event", eventType: "interaction", eventName: label.replace(/\s+/g, " ").trim().slice(0, 100) });
    };
    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("visibilitychange", heartbeat);
    window.addEventListener("focus", heartbeat);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("visibilitychange", heartbeat);
      window.removeEventListener("focus", heartbeat);
    };
  }, []);
  return null;
}
