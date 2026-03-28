import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-static";

const BASE_URL = 'https://railthailand.com';
const PAGE_SIZE = 1000;

let cachedRoutes: string[] | null = null;

function getAllRouteSlugs() {
  if (cachedRoutes) return cachedRoutes;
  
  const filePath = path.join(process.cwd(), 'data', 'trains-by-stations', 'all-trips.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  cachedRoutes = data.routes.map((route: any) => route.filename.replace('.json', ''));
  return cachedRoutes;
}

export async function generateSitemaps() {
  const routes = getAllRouteSlugs();
  const total = Math.ceil(routes!.length / PAGE_SIZE);
  return Array.from({ length: total }).map((_, i) => ({ id: i }));
}

export async function generateStaticParams() {
  const routes = getAllRouteSlugs();
  const total = Math.ceil(routes!.length / PAGE_SIZE);
  return Array.from({ length: total }).map((_, i) => ({ id: i.toString() }));
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = parseInt(id);
  
  const routes = getAllRouteSlugs();
  const start = idNum * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const subset = routes!.slice(start, end);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${subset.map((slug: string) => {
  const [from] = slug.split('-to-');
  return `  <url>
    <loc>${BASE_URL}/stations/${from}/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}