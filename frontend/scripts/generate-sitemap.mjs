/*
 * Syncs frontend/public/sitemap.xml from the live API.
 * Runs before vite build so that the production dist/ bundle always has a static sitemap.xml fallback
 * for Nginx/CDN even when server-side proxying is not configured.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputFile = path.join(root, 'public', 'sitemap.xml');

const endpoints = [
  process.env.API_SERVER_URL ? `${process.env.API_SERVER_URL.replace(/\/$/, '')}/api/sitemap.xml` : null,
  process.env.VITE_API_URL ? `${process.env.VITE_API_URL.replace(/\/$/, '')}/api/sitemap.xml` : null,
  'https://knchorizonrealtor.com/api/sitemap.xml',
  'http://localhost:6000/api/sitemap.xml',
].filter(Boolean);

async function syncSitemap() {
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const text = await res.text();
        if (text.includes('<urlset') && text.includes('</urlset>')) {
          fs.writeFileSync(outputFile, text.trim() + '\n', 'utf8');
          console.log(`[sitemap] Successfully updated public/sitemap.xml from ${url}`);
          return;
        }
      }
    } catch {
      // try next endpoint
    }
  }

  if (fs.existsSync(outputFile)) {
    console.log('[sitemap] Kept existing public/sitemap.xml (API endpoints unreachable during build)');
  } else {
    console.warn('[sitemap] Warning: could not generate public/sitemap.xml and no existing file found.');
  }
}

syncSitemap();
