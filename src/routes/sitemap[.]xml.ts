import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", priority: "1.0", changefreq: "weekly" },
          { path: "/login", priority: "0.5", changefreq: "monthly" },
          { path: "/signup", priority: "0.7", changefreq: "monthly" },
          { path: "/forgot-password", priority: "0.3", changefreq: "yearly" },
          { path: "/chat", priority: "0.8", changefreq: "weekly" },
          { path: "/documents", priority: "0.6", changefreq: "weekly" },
          { path: "/analytics", priority: "0.5", changefreq: "monthly" },
          { path: "/settings", priority: "0.3", changefreq: "monthly" },
        ];
        const urls = entries
          .map(
            (e) =>
              `  <url><loc>${BASE_URL}${e.path}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
