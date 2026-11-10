import "server-only";
import { getGallery } from "./queries";
import type { GalleryImage } from "@/components/site/Gallery";

export async function loadGallery(ownerType: "Project" | "Intervention" | "Event", ownerId: string) {
  const items = await getGallery(ownerType, ownerId);
  const toImg = (g: (typeof items)[number]): GalleryImage => ({
    id: g.id,
    url: g.media.url,
    thumbUrl: g.media.thumbUrl,
    alt: g.media.alt || g.caption || "",
    caption: g.caption,
    isVideo: g.media.mimeType.startsWith("video/"),
  });
  return {
    gallery: items.filter((g) => g.kind === "GALLERY").map(toImg),
    before: items.filter((g) => g.kind === "BEFORE").map(toImg),
    after: items.filter((g) => g.kind === "AFTER").map(toImg),
  };
}
