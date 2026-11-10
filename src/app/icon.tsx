import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon typographique provisoire. Remplacer par le logo officiel (app/icon.png) dès qu'il est fourni.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1014", color: "#ffffff", fontSize: 44, fontWeight: 700, fontFamily: "sans-serif" }}>
        N
      </div>
    ),
    size,
  );
}
