import type { Photo } from "@/content/types";
import type { GalleryImage } from "@/components/site/Gallery";

const isVideo = (src: string) => /\.(mp4|webm)$/i.test(src);

/** Sépare les photos d'un contenu en galerie, « avant » et « après ». */
export function splitPhotos(photos: Photo[]) {
  const toImg = (p: Photo, i: number): GalleryImage => ({ id: `${i}-${p.src}`, url: p.src, thumbUrl: null, alt: p.alt, caption: p.caption ?? null, isVideo: isVideo(p.src) });
  return {
    gallery: photos.map(toImg).filter((_, i) => !photos[i].kind),
    before: photos.map(toImg).filter((_, i) => photos[i].kind === "BEFORE"),
    after: photos.map(toImg).filter((_, i) => photos[i].kind === "AFTER"),
  };
}
