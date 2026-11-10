"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaFrame } from "./MediaFrame";

export type GalleryImage = { id: string; url: string; thumbUrl: string | null; alt: string; caption?: string | null; isVideo?: boolean };

export function Gallery({ images, label }: { images: GalleryImage[]; label?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const photos = images.filter((i) => !i.isVideo);

  const close = useCallback(() => {
    setIndex(null);
    lastFocus.current?.focus();
  }, []);

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, photos.length, close]);

  if (!images.length) return null;
  const current = index !== null ? photos[index] : null;

  return (
    <>
      <div className="gallery">
        {images.map((img) =>
          img.isVideo ? (
            <figure key={img.id}>
              <div className="video-embed">
                <video src={img.url} controls preload="metadata" aria-label={img.alt} />
              </div>
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ) : (
            <figure key={img.id}>
              <button
                type="button"
                onClick={(e) => {
                  lastFocus.current = e.currentTarget;
                  setIndex(photos.findIndex((p) => p.id === img.id));
                }}
                aria-label={`Agrandir : ${img.alt || label || "photographie"}`}
              >
                <MediaFrame src={img.url} thumb={img.thumbUrl} alt={img.alt} ratio="4 / 3" />
              </button>
              {img.caption && <figcaption>{img.caption}</figcaption>}
            </figure>
          ),
        )}
      </div>
      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Visionneuse de photographies" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="lightbox__bar">
            <span className="mono">
              {index! + 1} / {photos.length}
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => setIndex((index! - 1 + photos.length) % photos.length)} aria-label="Photo précédente">
                    ←
                  </button>
                  <button type="button" onClick={() => setIndex((index! + 1) % photos.length)} aria-label="Photo suivante">
                    →
                  </button>
                </>
              )}
              <button ref={closeRef} type="button" onClick={close}>
                Fermer
              </button>
            </div>
          </div>
          <figure style={{ margin: 0 }}>
            <img src={current.url} alt={current.alt} />
            {(current.caption || current.alt) && <figcaption className="lightbox__caption">{current.caption || current.alt}</figcaption>}
          </figure>
        </div>
      )}
    </>
  );
}
