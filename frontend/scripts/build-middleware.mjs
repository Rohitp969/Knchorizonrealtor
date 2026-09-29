/*
 * Writes frontend/middleware.js, the file Vercel runs before every page request, from
 * src/middleware/share-preview.ts.
 *
 *   node scripts/build-middleware.mjs      (npm run build runs it first)
 *
 * Everything the middleware needs is bundled into that one plain JavaScript file, so Vercel
 * has no TypeScript to compile and nothing to install for it. middleware.js is committed,
 * because Vercel only builds a middleware it finds in the repository.
 *
 * `config` is written out below as plain text, the form Vercel reads it in:
 *   matcher  pages only: no files (anything with a dot), API calls, built assets or the
 *            admin console
 *   runtime  Node.js, which Vercel recommends over the older Edge runtime
 */
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'middleware.js');

const CONFIG = `export const config = {
  runtime: 'nodejs',
  matcher: ['/', '/((?!api/|assets/|admin|.*\\\\.).*)'],
};
`;

const BANNER = `/*
 * GENERATED FILE. Do not edit it: edit src/middleware/share-preview.ts and run
 * "npm run build" (or "node scripts/build-middleware.mjs"), then commit both files.
 *
 * Vercel Routing Middleware: writes each page's title, description and share image into the
 * HTML, for WhatsApp, Facebook and the other readers that do not run the app.
 */`;

const result = await build({
  entryPoints: [path.join(root, 'src/middleware/share-preview.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  mainFields: ['module', 'main'],
  target: 'es2022',
  legalComments: 'none',
  write: false,
});

const code = result.outputFiles[0].text;
if (!/export\s*\{[^}]*\bas default\b[^}]*\}/.test(code) && !/export default/.test(code)) throw new Error('The bundle has no default export.');
if (/\bexport const config\b/.test(code)) throw new Error('config must only be written by this script.');

const text = `${BANNER}\n${code.trimEnd()}\n\n${CONFIG}`;
const before = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '';
if (before !== text) fs.writeFileSync(output, text);
console.log(`middleware.js ${before === text ? 'is up to date' : 'written'} (${(text.length / 1024).toFixed(1)} kB)`);
