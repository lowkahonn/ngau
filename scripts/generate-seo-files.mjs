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
const sitemapPages = [
  { path: "", changefreq: "weekly", priority: "1.0" },
  { path: "history.html", changefreq: "weekly", priority: "0.7" },
  { path: "how-to-play-ngau.html", changefreq: "weekly", priority: "0.9" },
  { path: "zh-hant/how-to-play-ngau.html", changefreq: "weekly", priority: "0.9" },
  { path: "zh-hans/how-to-play-ngau.html", changefreq: "weekly", priority: "0.9" },
  { path: "ngau-rules-explained.html", changefreq: "weekly", priority: "0.9" },
  { path: "zh-hant/ngau-rules-explained.html", changefreq: "weekly", priority: "0.9" },
  { path: "zh-hans/ngau-rules-explained.html", changefreq: "weekly", priority: "0.9" },
  { path: "ngau-3-6-explained.html", changefreq: "weekly", priority: "0.8" },
  { path: "zh-hant/ngau-3-6-explained.html", changefreq: "weekly", priority: "0.8" },
  { path: "zh-hans/ngau-3-6-explained.html", changefreq: "weekly", priority: "0.8" },
  { path: "ngau-example-rounds.html", changefreq: "weekly", priority: "0.8" },
  { path: "zh-hant/ngau-example-rounds.html", changefreq: "weekly", priority: "0.8" },
  { path: "zh-hans/ngau-example-rounds.html", changefreq: "weekly", priority: "0.8" },
  { path: "ngau-faq.html", changefreq: "weekly", priority: "0.8" },
  { path: "zh-hant/ngau-faq.html", changefreq: "weekly", priority: "0.8" },
  { path: "zh-hans/ngau-faq.html", changefreq: "weekly", priority: "0.8" }
];
const publicDir = resolve(process.cwd(), "public");
mkdirSync(publicDir, { recursive: true });

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`;

const sitemapEntries = sitemapPages
  .map(({ path, changefreq, priority }) => {
    const loc = new URL(path || "", siteUrl).href;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;

writeFileSync(resolve(publicDir, "robots.txt"), robots, "utf8");
writeFileSync(resolve(publicDir, "sitemap.xml"), sitemap, "utf8");
console.log(`Generated SEO files for ${siteUrl}`);
