import type { APIRoute } from 'astro';
import { listResources, listCategories } from '../lib/resources';

const BASE_URL = import.meta.env.SITE_URL ?? 'http://localhost:4321';

export const GET: APIRoute = async () => {
  const resourcesResult = listResources();
  const categoriesResult = listCategories();

  const staticRoutes = ['', '/recursos', '/recursos/new', '/recursos/trash'];

  const resourceUrls = resourcesResult.ok && resourcesResult.value
    ? resourcesResult.value.map((r) => ({
        loc: `${BASE_URL}/recursos/${r.id}`,
        changefreq: 'monthly',
        priority: '0.7',
      }))
    : [];

  const categoryUrls = categoriesResult.ok && categoriesResult.value
    ? categoriesResult.value.map((c) => ({
        loc: `${BASE_URL}/recursos?categoryId=${c.id}`,
        changefreq: 'weekly',
        priority: '0.6',
      }))
    : [];

  const urls = [
    ...staticRoutes.map((path) => ({
      loc: `${BASE_URL}${path}`,
      changefreq: path === '' ? 'weekly' : 'daily',
      priority: path === '' ? '1.0' : '0.8',
    })),
    ...resourceUrls,
    ...categoryUrls,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};