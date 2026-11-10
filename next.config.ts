import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  // Next.js injecte des scripts inline d'hydratation.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  // Vidéos intégrées (YouTube / Vimeo) et carte Google Maps.
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Inliné à la compilation (middleware + composants d’administration).
  env: { ADMIN_PATH: process.env.ADMIN_PATH || "espace-nute" },
  output: "standalone",
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  async headers() {
    // /media/* définit ses propres en-têtes (CSP « sandbox »).
    return [{ source: "/((?!media/).*)", headers: securityHeaders }];
  },
};

export default nextConfig;
