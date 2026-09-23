import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cuenta pública",
    short_name: "Cuenta pública",
    description: "Seguimiento documental del periodo presidencial de Colombia.",
    start_url: "/",
    display: "standalone",
    background_color: "#edf0e8",
    theme_color: "#143f37",
    lang: "es-CO",
    categories: ["news", "government", "education"],
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
  };
}
