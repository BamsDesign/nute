const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Port-au-Prince" });
const monthFmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "America/Port-au-Prince" });
const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "America/Port-au-Prince" });

export const formatDate = (d: Date | string | null | undefined) => (d ? dateFmt.format(new Date(d)) : "");
export const formatMonth = (d: Date | string | null | undefined) => (d ? monthFmt.format(new Date(d)) : "");
export const formatDateTime = (d: Date | string | null | undefined) => (d ? shortFmt.format(new Date(d)) : "");
export const yearOf = (d: Date | string | null | undefined) => (d ? new Date(d).getUTCFullYear() : null);

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Convertit une URL YouTube/Vimeo en URL d'intégration respectueuse de la vie privée. */
export function videoEmbedUrl(url: string | null | undefined): { kind: "embed" | "file"; src: string } | null {
  if (!url) return null;
  try {
    if (url.startsWith("/media/")) return { kind: "file", src: url };
    const u = new URL(url);
    if (/(^|\.)youtube\.com$/.test(u.hostname)) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      if (id && /^[\w-]{6,20}$/.test(id)) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      if (/^[\w-]{6,20}$/.test(id)) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (/(^|\.)vimeo\.com$/.test(u.hostname)) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return { kind: "embed", src: `https://player.vimeo.com/video/${id}` };
    }
  } catch {
    /* URL invalide */
  }
  return null;
}
