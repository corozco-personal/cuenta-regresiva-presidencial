"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global { interface Window { turnstile?: TurnstileApi } }

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile-load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function TurnstileWidget({ action, resetSignal, onToken, onEnabled }: { action: string; resetSignal: number; onToken: (token: string) => void; onEnabled: (enabled: boolean) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/seguridad", { cache: "no-store" }).then((response) => response.json()).then(async (config) => {
      if (!active || !config.enabled || !config.siteKey) { onEnabled(false); return; }
      setEnabled(true); onEnabled(true); await loadScript();
      if (!active || !container.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: config.siteKey, action, language: "es", theme: "light", size: "flexible",
        callback: (token: string) => { setFailed(false); onToken(token); },
        "expired-callback": () => onToken(""),
        "error-callback": () => { setFailed(true); onToken(""); },
      });
    }).catch(() => { setFailed(true); onEnabled(true); });
    return () => { active = false; if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); };
  }, [action, onEnabled, onToken]);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) { window.turnstile.reset(widgetId.current); onToken(""); }
  }, [onToken, resetSignal]);

  if (!enabled && !failed) return null;
  return <div className="turnstile-field"><span><ShieldCheck size={15} /> Verificación antiabuso</span><div ref={container} />{failed && <small>No fue posible cargar la verificación. Recarga la página para continuar.</small>}</div>;
}
