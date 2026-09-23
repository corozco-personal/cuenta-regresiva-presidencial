import { NextResponse } from "next/server";

type WpPost = { id: number; date: string; link: string; title?: { rendered?: string }; excerpt?: { rendered?: string } };

function plain(value = "") {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&#8211;|&ndash;/g, "–").replace(/&#8217;|&rsquo;/g, "’").replace(/&quot;|&#8220;|&#8221;/g, '"').replace(/\s+/g, " ").trim();
}

async function chamberPosts(endpoint: string, source: string) {
  const response = await fetch(endpoint, { headers: { "user-agent": "CuentaPublica/1.0 (+legislative-monitor)" }, next: { revalidate: 86400 } });
  if (!response.ok) return [];
  const posts = await response.json() as WpPost[];
  return posts.map((post) => ({ id: `${source}-${post.id}`, source, title: plain(post.title?.rendered), summary: plain(post.excerpt?.rendered).slice(0, 320), url: post.link, publishedAt: post.date }));
}

export async function GET() {
  const endpoints = [
    chamberPosts("https://www.camara.gov.co/wp-json/wp/v2/posts?per_page=12&search=proyecto%20de%20ley&_fields=id,date,link,title,excerpt", "Cámara de Representantes"),
    chamberPosts("https://poderlegislativo.camara.gov.co/wp-json/wp/v2/posts?per_page=12&search=proyecto%20de%20ley&_fields=id,date,link,title,excerpt", "Poder Legislativo · Cámara"),
  ];
  const results = await Promise.allSettled(endpoints);
  const items = results.flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .filter((item) => /proyecto|reforma|ley|legislativ/i.test(`${item.title} ${item.summary}`))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 16);
  return NextResponse.json({
    updatedAt: new Date().toISOString(), items,
    composition: { senate: 103, house: 183, period: "2026–2030" },
    sources: [
      { label: "Resultados oficiales de Congreso 2026", url: "https://wapp.registraduria.gov.co/electoral/2026/congreso-de-la-republica/" },
      { label: "Representantes elegidos 2026–2030", url: "https://www.camara.gov.co/representantes-a-la-camara-elegidos-para-el-periodo-legislativo-2026-2030-2/" },
      { label: "Base oficial de proyectos de ley", url: "https://www.camara.gov.co/proyectos-ley/" },
    ],
  }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
