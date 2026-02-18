import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function normalizeSiteUrl(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  return url.href.endsWith("/") ? url.href : `${url.href}/`;
}

function deriveGithubPagesUrl() {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !repo.includes("/")) return null;
  const [owner, name] = repo.split("/");
  return `https://${owner}.github.io/${name}/`;
}

const siteUrl =
  normalizeSiteUrl(process.env.VITE_SITE_URL) ??
  normalizeSiteUrl(deriveGithubPagesUrl()) ??
  "https://example.com/";

const today = new Date().toISOString().slice(0, 10);
const publicDir = resolve(process.cwd(), "public");
mkdirSync(publicDir, { recursive: true });

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`;

writeFileSync(resolve(publicDir, "robots.txt"), robots, "utf8");
writeFileSync(resolve(publicDir, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated SEO files for ${siteUrl}`);
