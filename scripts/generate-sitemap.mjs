import { writeFileSync } from "node:fs";

const domain = "https://getinksights.co.uk";
const lastmod = process.env.SITEMAP_LASTMOD || new Date().toISOString().slice(0, 10);
const routes = [
  ["/", "weekly", "1.0"],
  ["/full-audit", "monthly", "0.95"],
  ["/offers", "weekly", "0.9"],
  ["/offers/72-hour-visibility-fix", "weekly", "0.9"],
  ["/offers/visibility-watch", "monthly", "0.8"],
  ["/offers/revenue-audit", "monthly", "0.8"],
  ["/offers/booking-retention-engine", "monthly", "0.8"],
  ["/offers/founding-studio-pilot", "monthly", "0.8"],
  ["/studio-growth-check", "monthly", "0.9"],
  ["/resources", "weekly", "0.9"],
  ["/tattoo-studio-visibility-scorecard", "monthly", "0.9"],
  ["/tattoo-studio-software", "monthly", "0.8"],
  ["/tools/tattoo-pain-chart-reality-check", "monthly", "0.9"],
  ["/guides/full-sleeve-cost-uk", "monthly", "0.9"],
  ["/guides/grey-line-healing-week-by-week", "monthly", "0.9"],
  ["/growth-model", "monthly", "0.7"],
  ["/case-studies", "monthly", "0.8"],
  ["/about", "monthly", "0.7"],
  ["/support", "monthly", "0.6"],
  ["/contact", "monthly", "0.6"],
  ["/privacy", "yearly", "0.3"],
  ["/cookies", "yearly", "0.3"],
  ["/terms", "yearly", "0.3"],
  ["/accessibility", "yearly", "0.3"],
];

const body = routes.map(([path, changefreq, priority]) => `  <url><loc>${domain}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`).join("\n");
writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
console.log(`Generated sitemap with ${routes.length} public URLs.`);
