import Link from "./native-link";
import CompactPresence from "./compact-presence";

export default function SubpageHeader() {
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
            <Link className="more-priority-2" href="/presidente">Sobre el presidente</Link><Link className="more-priority-3" href="/favorabilidad">Indicadores</Link><Link className="more-priority-4" href="/archivo">Archivo</Link><Link href="/reportes">Reportes</Link><Link href="/fuentes">Fuentes</Link><Link href="/metodologia">Metodología</Link><Link href="/autor">Quién soy</Link>
          </div>
        </details>
      </nav>
      <CompactPresence />
    </header>
  );
}
