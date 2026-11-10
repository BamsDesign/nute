import type { NextConfig } from "next";

// Site vitrine 100 % statique : `next build` produit le dossier `out/`,
// publié tel quel (Render Static Site, Netlify, GitHub Pages, tout hébergeur).
// Les en-têtes de sécurité sont définis côté hébergeur (render.yaml).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
