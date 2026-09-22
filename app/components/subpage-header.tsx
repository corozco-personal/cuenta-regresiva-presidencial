"use client";

import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";
import Link from "./native-link";
import CompactPresence from "./compact-presence";

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
        <Link href="/">Inicio</Link><Link href="/#monitoreo">Noticias</Link><Link href="/#participa">Participa</Link>
        <Link className="nav-priority nav-priority-2" href="/presidente">Presidente</Link>
        <Link className="nav-priority nav-priority-3" href="/favorabilidad">Indicadores</Link>
        <Link className="nav-priority nav-priority-4" href="/archivo">Archivo</Link>
        <details className="nav-more">
          <summary><span className="hamburger-lines" aria-hidden="true" /> Más</summary>
          <div className="nav-more-panel">
            <Link href="/">Inicio</Link><Link className="more-priority-2" href="/presidente">Sobre el presidente</Link><Link className="more-priority-3" href="/favorabilidad">Indicadores</Link><Link className="more-priority-4" href="/archivo">Archivo</Link><Link href="/promesas">Promesas</Link><Link href="/resumen">Resumen semanal</Link><Link href="/alertas">Alertas</Link><Link href="/reportes">Reportes</Link><Link href="/fuentes">Fuentes</Link><Link href="/metodologia">Metodología</Link><Link href="/correcciones">Correcciones</Link><Link href="/acerca">Acerca de</Link><Link href="/autor">Quién soy</Link><Link href="/privacidad">Privacidad</Link>
          </div>
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
