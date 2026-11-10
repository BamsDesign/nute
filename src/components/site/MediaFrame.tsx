import type { CSSProperties } from "react";

type Props = {
  src?: string | null;
  thumb?: string | null;
  alt?: string | null;
  ratio?: string;
  label?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  corner?: React.ReactNode;
};

/**
 * Cadre d'image unique du site. Sans photo réelle, affiche un emplacement
 * clairement identifié (« Photographie à venir ») plutôt qu'une image générique.
 */
export function MediaFrame({ src, thumb, alt, ratio, label, priority, sizes, className, corner }: Props) {
  const style = ratio ? ({ "--ratio": ratio } as CSSProperties) : undefined;
  if (!src) {
    return (
      <div className={`frame frame--placeholder ${className ?? ""}`} style={style} role="img" aria-label={`${label ?? "Photographie"} — image à venir`}>
        {corner && <div className="frame__corner">{corner}</div>}
        <div className="frame__ph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <rect x="3" y="6" width="18" height="13" rx="1" />
            <path d="M8 6l1.5-2h5L16 6" />
            <circle cx="12" cy="12.5" r="3.5" />
          </svg>
          <span className="mono">{label ? `${label} · ` : ""}Photographie à venir</span>
        </div>
      </div>
    );
  }
  const isLocalWebp = (src.startsWith("/media/") || src.includes(".public.blob.vercel-storage.com/media/")) && src.endsWith(".webp") && !src.endsWith("-sm.webp");
  const small = thumb ?? (isLocalWebp ? src.replace(/\.webp$/, "-sm.webp") : null);
  return (
    <div className={`frame ${className ?? ""}`} style={style}>
      {corner && <div className="frame__corner">{corner}</div>}
      <img
        src={src}
        srcSet={small ? `${small} 720w, ${src} 2400w` : undefined}
        sizes={sizes ?? "(max-width: 760px) 100vw, 50vw"}
        alt={alt ?? ""}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </div>
  );
}
