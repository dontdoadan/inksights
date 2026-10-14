import { writeFileSync } from "node:fs";

const domain = "https://getinksights.co.uk";

const lastmodByRoute = {
  "/": "2026-10-08",
  "/resources": "2026-10-08",
  "/tattoo-studio-growth": "2026-10-08",
  "/tattoo-studio-marketing": "2026-10-08",
  "/tattoo-studio-management": "2026-10-08",
  "/tattoo-studio-seo": "2026-10-08",
  "/tattoo-studio-revenue": "2026-10-08",
  "/tattoo-studio-booking": "2026-10-08",
  "/tattoo-studio-client-retention": "2026-10-08",
  "/tattoo-studio-software": "2026-07-26",
};

const routes = [
  ["/", "weekly", "1.0"],
  ["/solutions", "weekly", "0.9"],
  ["/tattoo-studio-growth", "monthly", "0.9"],
  ["/tattoo-studio-marketing", "monthly", "0.9"],
  ["/tattoo-studio-management", "monthly", "0.9"],
  ["/tattoo-studio-seo", "monthly", "0.9"],
  ["/tattoo-studio-revenue", "monthly", "0.9"],
  ["/tattoo-studio-booking", "monthly", "0.9"],
  ["/tattoo-studio-client-retention", "monthly", "0.9"],
  ["/offers", "weekly", "0.9"],
  ["/offers/studio-intelligence-audit", "weekly", "1.0"],
  ["/offers/72-hour-visibility-fix", "weekly", "0.8"],
  ["/offers/visibility-watch", "monthly", "0.8"],
  ["/offers/revenue-audit", "monthly", "0.9"],
  ["/offers/booking-retention-engine", "monthly", "0.8"],
  ["/offers/founding-studio-pilot", "monthly", "0.8"],
  ["/studio-growth-check", "monthly", "0.9"],
  ["/studio-visibility-report", "monthly", "0.9"],
  ["/resources", "weekly", "0.9"],
  ["/tattoo-studio-visibility-scorecard", "monthly", "0.9"],
  ["/tattoo-studio-software", "monthly", "0.8"],
  ["/growth-model", "monthly", "0.8"],
  ["/pricing-benchmark", "monthly", "0.8"],
  ["/case-studies", "monthly", "0.7"],
  ["/about", "monthly", "0.6"],
  ["/support", "monthly", "0.5"],
  ["/contact", "monthly", "0.6"],
  ["/privacy", "yearly", "0.3"],
  ["/cookies", "yearly", "0.3"],
  ["/terms", "yearly", "0.3"],
  ["/accessibility", "yearly", "0.3"],
];

const body = routes
  .map(([path, changefreq, priority]) => {
    const lastmod = lastmodByRoute[path];
    const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
    return `  <url><loc>${domain}${path}</loc>${lastmodTag}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  })
  .join("\n");

writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);
console.log(`Generated sitemap with ${routes.length} public URLs.`);
