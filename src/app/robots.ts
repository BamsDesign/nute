import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Le chemin d'administration n'est volontairement pas mentionné ici (il est servi en noindex).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
