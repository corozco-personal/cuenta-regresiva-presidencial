import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/cotejo-7d41e9c2", "/api/cotejo-7d41e9c2", "/revision-movil", "/api/revision-movil", "/api/resend-webhook", "/reportes"] },
    sitemap: "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/sitemap.xml",
  };
}
