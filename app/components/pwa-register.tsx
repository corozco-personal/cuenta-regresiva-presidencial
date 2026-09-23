"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
    const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);
  return null;
}
