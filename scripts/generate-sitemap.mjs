import { writeFileSync } from "node:fs";

const domain = "https://getinksights.co.uk";

const lastmodByRoute = {
  "/": "2026-10-08",
  "/resources": "2026-10-08",
  "/tattoo-studio-growth": "2026-10-08",
  "/tattoo-studio-marketing": "2026-10-08",
  "/tattoo-studio-management": "2026-10-08",
  "/tattoo-studio-seo": "2026-10-19",
  "/tattoo-studio-revenue": "2026-10-08",
  "/tattoo-studio-booking": "2026-10-08",
  "/tattoo-studio-client-retention": "2026-10-08",
  "/tattoo-studio-software": "2026-10-19",
  "/offers/studio-intelligence-audit": "2026-10-19",
  "/offers/72-hour-visibility-fix": "2026-10-19",
  "/offers/visibility-watch": "2026-10-19",
  "/offers/revenue-audit": "2026-10-19",
  "/offers/booking-retention-engine": "2026-10-19",
  "/studio-visibility-report": "2026-10-19",
};

const routes = [
  "/",
  "/solutions",
  "/tattoo-studio-growth",
  "/tattoo-studio-marketing",
  "/tattoo-studio-management",
  "/tattoo-studio-seo",
  "/tattoo-studio-revenue",
  "/tattoo-studio-booking",
  "/tattoo-studio-client-retention",
  "/offers",
  "/offers/studio-intelligence-audit",
  "/offers/72-hour-visibility-fix",
  "/offers/visibility-watch",
  "/offers/revenue-audit",
  "/offers/booking-retention-engine",
  "/offers/founding-studio-pilot",
  "/studio-growth-check",
  "/studio-visibility-report",
  "/resources",
  "/tattoo-studio-visibility-scorecard",
  "/tattoo-studio-software",
  "/growth-model",
  "/pricing-benchmark",
  "/case-studies",
  "/about",
  "/support",
  "/contact",
  "/privacy",
  "/cookies",
  "/terms",
  "/accessibility",
];

const body = routes
  .map((path) => {
    const lastmod = lastmodByRoute[path];
    const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
    return `  <url><loc>${domain}${path}</loc>${lastmodTag}</url>`;
  })
  .join("\n");

writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);
console.log(`Generated sitemap with ${routes.length} public URLs.`);
