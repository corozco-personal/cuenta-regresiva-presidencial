"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import Link from "./native-link";
import CompactPresence from "./compact-presence";
import NavigationCatalog from "./navigation-catalog";

export default function SubpageHeader() {
  const [ecoMode, setEcoMode] = useState(false);

  useEffect(() => {
    const storedEcoMode = window.localStorage.getItem("cuenta-publica-eco") === "true";
    window.requestAnimationFrame(() => setEcoMode(storedEcoMode));
    document.querySelector("main")?.classList.toggle("eco-mode", storedEcoMode);
  }, []);

  const toggleEcoMode = () => {
    setEcoMode((current) => {
      const next = !current;
      window.localStorage.setItem("cuenta-publica-eco", String(next));
      document.querySelector("main")?.classList.toggle("eco-mode", next);
      return next;
    });
  };

  return (
    <header className="subpage-header">
      <Link className="brand" href="/"><span className="brand-mark">07</span><span>Cuenta pública</span></Link>
      <nav aria-label="Navegación principal">
        <Link href="/">Inicio</Link><Link href="/#monitoreo">Noticias</Link>
        <Link className="nav-priority nav-priority-2" href="/presidente">Presidente</Link>
        <Link className="nav-priority nav-priority-3" href="/indicadores">Indicadores</Link>
        <Link className="nav-priority nav-priority-4" href="/archivo">Archivo</Link>
        <details className="nav-more">
          <summary><span className="hamburger-lines" aria-hidden="true" /> Más</summary>
          <NavigationCatalog />
        </details>
      </nav>
      <div className="header-actions">
        <button className={ecoMode ? "eco-button active" : "eco-button"} onClick={toggleEcoMode} aria-pressed={ecoMode}>
          <Leaf size={16} /> {ecoMode ? "Ahorro activo" : "Bajo consumo"}
        </button>
        <CompactPresence />
      </div>
    </header>
  );
}
