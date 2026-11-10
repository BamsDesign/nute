import { ImageResponse } from "next/og";

export const alt = "NUTE — La technologie, votre mission, notre solution.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Visuel de partage typographique (sans logo inventé) : à remplacer par une image officielle via l'administration (SEO).
export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0e12", color: "#e9e8e2", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#9aa0a8" }}>TECHNOLOGIE · INFORMATIQUE · MULTIMÉDIA</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 148, fontWeight: 700, letterSpacing: -6, lineHeight: 1 }}>NUTE</div>
          <div style={{ fontSize: 44, marginTop: 24, maxWidth: 900, lineHeight: 1.2 }}>La technologie, votre mission, notre solution.</div>
        </div>
        <div style={{ display: "flex", height: 6, width: 160, background: "#1f3fc4" }} />
      </div>
    ),
    size,
  );
}
