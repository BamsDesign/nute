export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const absoluteUrl = (p = "/") => (p.startsWith("http") ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`);
