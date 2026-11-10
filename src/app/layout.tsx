import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";

// Polices auto-hébergées : aucun appel à un service tiers, ni au build ni à l'affichage.
const inter = localFont({ src: "./fonts/inter.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
const interTight = localFont({ src: "./fonts/inter-tight.woff2", weight: "100 900", variable: "--font-inter-tight", display: "swap" });
const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NUTE — Services technologiques, informatiques et multimédias en Haïti",
    template: "%s · NUTE",
  },
  description:
    "NUTE accompagne les particuliers, entreprises et institutions avec des solutions technologiques, informatiques et multimédias adaptées à leurs besoins.",
  applicationName: "NUTE",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f4ef",
  width: "device-width",
  initialScale: 1,
};

// Active les animations seulement si JS est disponible et si le mouvement n'est pas réduit.
// Filet de sécurité : sans initialisation sous 3 s, le contenu est affiché.
const motionBoot = `(function(){try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('js-motion');setTimeout(function(){if(!window.__nuteMotion)d.classList.remove('js-motion')},3000)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${interTight.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
