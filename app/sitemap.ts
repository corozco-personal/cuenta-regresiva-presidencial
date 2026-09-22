import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/archivo`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/promesas`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/resumen`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/alertas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/fuentes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/metodologia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/favorabilidad`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/autor`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/acerca`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacidad`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/correcciones`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
