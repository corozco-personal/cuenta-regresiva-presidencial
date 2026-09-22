import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site";
  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/autor`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];
}
