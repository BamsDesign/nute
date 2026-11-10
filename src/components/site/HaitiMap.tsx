"use client";

import Link from "next/link";
import { useState } from "react";
import { HAITI_MAP, projectHaiti } from "@/lib/haiti-map";

export type MapPoint = { id: string; slug: string; name: string; city: string | null; department: string | null; typeLabel: string; dateLabel: string; lat: number; lng: number; isDemo: boolean };

const CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Port-au-Prince", lat: 18.5944, lng: -72.3074 },
  { name: "Cap-Haïtien", lat: 19.7578, lng: -72.2042 },
  { name: "Les Cayes", lat: 18.193, lng: -73.7461 },
  { name: "Gonaïves", lat: 19.4475, lng: -72.6889 },
  { name: "Jacmel", lat: 18.2342, lng: -72.5347 },
  { name: "Jérémie", lat: 18.65, lng: -74.1167 },
];

/** Carte vectorielle d'Haïti (aucune tuile externe), points d'intervention vérifiés uniquement. */
export function HaitiMap({ points }: { points: MapPoint[] }) {
  const [active, setActive] = useState<string | null>(points[0]?.id ?? null);
  const current = points.find((p) => p.id === active) ?? null;
  const { width, height, d } = HAITI_MAP;

  return (
    <div className="map-wrap">
      <figure style={{ margin: 0 }}>
        <svg className="haiti-map" viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`Carte d'Haïti — ${points.length} lieu(x) d'intervention`}>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={`h${f}`} className="gridline" x1="0" x2={width} y1={height * f} y2={height * f} />
          ))}
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={`v${f}`} className="gridline" y1="0" y2={height} x1={width * f} x2={width * f} />
          ))}
          <path className="land" d={d} />
          {CITIES.map((c) => {
            const { x, y } = projectHaiti(c.lng, c.lat);
            return (
              <g key={c.name} aria-hidden="true">
                <circle cx={x} cy={y} r="2.5" fill="var(--subtle)" />
                <text className="map-label" x={x + 8} y={y + 5}>
                  {c.name}
                </text>
              </g>
            );
          })}
          {points.map((p) => {
            const { x, y } = projectHaiti(p.lng, p.lat);
            return (
              <g
                key={p.id}
                className="map-pin"
                tabIndex={0}
                role="button"
                aria-label={`${p.name}${p.city ? `, ${p.city}` : ""}`}
                aria-pressed={active === p.id}
                data-active={active === p.id}
                onClick={() => setActive(p.id)}
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActive(p.id))}
              >
                <circle className="halo" cx={x} cy={y} r="22" />
                <circle className="dot" cx={x} cy={y} r="8" />
              </g>
            );
          })}
        </svg>
        <figcaption className="mono muted" style={{ marginTop: "0.75rem" }}>
          Lieux d&apos;intervention vérifiés · Fond de carte : Natural Earth
        </figcaption>
      </figure>
      <div className="map-panel" aria-live="polite">
        {current ? (
          <>
            <span className="mono muted">
              {current.typeLabel}
              {current.dateLabel ? ` · ${current.dateLabel}` : ""}
              {current.isDemo ? " · Exemple" : ""}
            </span>
            <h2 className="h3">{current.name}</h2>
            <p className="muted">{[current.city, current.department].filter(Boolean).join(", ")}</p>
            <div>
              <Link href={`/interventions/${current.slug}`} className="link-arrow">
                Voir l&apos;intervention <span aria-hidden="true">→</span>
              </Link>
            </div>
          </>
        ) : (
          <p className="muted">Les lieux d&apos;intervention géolocalisés apparaîtront sur la carte dès leur publication.</p>
        )}
      </div>
    </div>
  );
}
