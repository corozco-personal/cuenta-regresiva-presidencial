import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/archivo`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/fuentes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/metodologia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/autor`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
