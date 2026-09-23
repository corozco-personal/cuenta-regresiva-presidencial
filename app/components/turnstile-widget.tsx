"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";

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
    const existing = document.querySelector<HTMLScriptElement>('script[data-turnstile-script="true"]');
    const script = existing ?? document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    const ready = () => {
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (window.turnstile) { window.clearInterval(timer); resolve(); }
        else if (attempts >= 50) { window.clearInterval(timer); reject(new Error("turnstile-timeout")); }
      }, 100);
    };
    script.addEventListener("load", ready, { once: true });
    script.addEventListener("error", () => reject(new Error("turnstile-load")), { once: true });
    if (!existing) document.head.appendChild(script);
    else ready();
  }).catch((error) => { scriptPromise = null; throw error; });
  return scriptPromise;
}

export default function TurnstileWidget({ action, resetSignal, onToken, onEnabled }: { action: string; resetSignal: number; onToken: (token: string) => void; onEnabled: (enabled: boolean) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/seguridad", { cache: "no-store" }).then((response) => response.json()).then(async (config) => {
      if (!active || !config.enabled || !config.siteKey) { onEnabled(false); return; }
      setEnabled(true); onEnabled(true); await loadScript();
      if (!active || !container.current || !window.turnstile) throw new Error("turnstile-unavailable");
      container.current.replaceChildren();
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: config.siteKey, action, language: "es", theme: "light", size: "flexible",
        callback: (token: string) => { setFailed(false); onToken(token); },
        "expired-callback": () => onToken(""),
        "error-callback": () => { setFailed(true); onToken(""); },
      });
    }).catch(() => { if (active) { setFailed(true); onEnabled(true); } });
    return () => { active = false; if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); };
  }, [action, onEnabled, onToken, retry]);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) { window.turnstile.reset(widgetId.current); onToken(""); }
  }, [onToken, resetSignal]);

  if (!enabled && !failed) return null;
  return <div className="turnstile-field"><span><ShieldCheck size={15} /> Verificación antiabuso</span><div ref={container} />{failed && <button type="button" className="turnstile-retry" onClick={() => { setFailed(false); setRetry((value) => value + 1); }}><RefreshCw size={15} /> Reintentar verificación</button>}</div>;
}
