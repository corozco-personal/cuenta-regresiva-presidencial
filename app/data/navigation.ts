export const navigationGroups = [
  {
    title: "Seguimiento presidencial",
    description: "Mandato, compromisos y equipo",
    items: [
      { label: "Sobre el presidente", href: "/presidente", className: "more-priority-2" },
      { label: "Promesas", href: "/promesas" },
      { label: "Nombramientos", href: "/nombramientos" },
      { label: "Indicadores", href: "/favorabilidad", className: "more-priority-3" },
    ],
  },
  {
    title: "Noticias y contexto",
    description: "Cobertura, contraste y archivo",
    items: [
      { label: "Noticias", href: "/#monitoreo" },
      { label: "Buscar", href: "/buscar" },
      { label: "Archivo", href: "/archivo", className: "more-priority-4" },
      { label: "Expedientes", href: "/temas" },
      { label: "Comparador", href: "/comparador" },
      { label: "Resumen semanal", href: "/resumen" },
      { label: "Alertas", href: "/alertas" },
    ],
  },
  {
    title: "Datos y transparencia",
    description: "Métodos, fuentes y resultados",
    items: [
      { label: "Cobertura y estado", href: "/cobertura" },
      { label: "Datos abiertos", href: "/datos" },
      { label: "Fuentes", href: "/fuentes" },
      { label: "Metodología", href: "/metodologia" },
      { label: "Correcciones y réplica", href: "/correcciones" },
    ],
  },
  {
    title: "Comunidad y proyecto",
    description: "Participación e información legal",
    items: [
      { label: "Participa", href: "/#participa" },
      { label: "Compartir", href: "/compartir" },
      { label: "Acerca de", href: "/acerca" },
      { label: "Quién soy", href: "/autor" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
] as const;
