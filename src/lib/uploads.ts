import "server-only";
import { randomBytes } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { del, put } from "@vercel/blob";

/** Vercel Blob si le jeton est défini (hébergement sans disque persistant), sinon disque local. */
export const blobStorageEnabled = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function save(rel: string, data: Buffer, contentType: string): Promise<string> {
  if (blobStorageEnabled()) {
    const blob = await put(`media/${rel}`, data, { access: "public", contentType, addRandomSuffix: false, cacheControlMaxAge: 31536000 });
    return blob.url;
  }
  await mkdir(path.dirname(path.join(UPLOAD_ROOT, rel)), { recursive: true });
  await writeFile(path.join(UPLOAD_ROOT, rel), data);
  return `/media/${rel}`;
}

export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || "./storage/uploads");

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

export type StoredFile = {
  filename: string;
  url: string;
  thumbUrl: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

export class UploadError extends Error {}

function detectKind(buf: Buffer): "image" | "mp4" | "webm" | "pdf" | null {
  if (buf.length < 12) return null;
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("ascii");
    // Les formats HEIC/AVIF partagent la structure ftyp : on les traite comme images.
    if (/^(heic|heix|hevc|mif1|avif|avis)/.test(brand)) return "image";
    return "mp4";
  }
  if (buf.readUInt32BE(0) === 0x1a45dfa3) return "webm";
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return "pdf";
  const sig = buf.subarray(0, 4).toString("hex");
  if (sig.startsWith("ffd8ff") || sig === "89504e47" || buf.subarray(0, 4).toString("ascii") === "RIFF" || buf.subarray(0, 3).toString("ascii") === "GIF")
    return "image";
  return null;
}

function monthDir() {
  const d = new Date();
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Stocke un fichier téléversé après validation de son contenu réel (signature binaire).
 * Les images sont ré-encodées en WebP : métadonnées EXIF (dont la géolocalisation) supprimées,
 * orientation corrigée, taille limitée, miniature générée. Les SVG sont refusés.
 */
export async function storeUpload(file: File): Promise<StoredFile> {
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = detectKind(buf);
  if (!kind) throw new UploadError("Format non pris en charge. Formats acceptés : JPG, PNG, WebP, AVIF, HEIC, GIF, MP4, WebM, PDF.");

  const dir = monthDir();
  const base = randomBytes(12).toString("hex");

  if (kind === "image") {
    if (buf.length > MAX_IMAGE_BYTES) throw new UploadError("Image trop lourde (15 Mo maximum).");
    let img: ReturnType<typeof sharp>;
    let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
    try {
      img = sharp(buf, { limitInputPixels: 80_000_000, animated: false }).rotate();
      meta = await img.metadata();
    } catch {
      throw new UploadError("Image illisible ou corrompue.");
    }
    if (meta.format === "svg") throw new UploadError("Les fichiers SVG ne sont pas acceptés.");
    const main = await img.clone().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const thumb = await img.clone().resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toBuffer();
    const filename = `${dir}/${base}.webp`;
    const thumbName = `${dir}/${base}-sm.webp`;
    const url = await save(filename, main.data, "image/webp");
    const thumbUrl = await save(thumbName, thumb, "image/webp");
    return {
      filename,
      url,
      thumbUrl,
      mimeType: "image/webp",
      size: main.data.length,
      width: main.info.width,
      height: main.info.height,
    };
  }

  const map = { mp4: ["mp4", "video/mp4", MAX_VIDEO_BYTES], webm: ["webm", "video/webm", MAX_VIDEO_BYTES], pdf: ["pdf", "application/pdf", MAX_PDF_BYTES] } as const;
  const [ext, mime, max] = map[kind];
  if (buf.length > max) throw new UploadError(`Fichier trop lourd (${Math.round(max / 1024 / 1024)} Mo maximum).`);
  const filename = `${dir}/${base}.${ext}`;
  const url = await save(filename, buf, mime);
  return { filename, url, thumbUrl: null, mimeType: mime, size: buf.length, width: null, height: null };
}

export async function deleteStored(filename: string, thumbUrl?: string | null, url?: string | null) {
  if (url && /^https:\/\//.test(url)) {
    await del([url, ...(thumbUrl ? [thumbUrl] : [])]).catch(() => undefined);
    return;
  }
  const safe = resolveSafe(filename);
  if (safe) await unlink(safe).catch(() => undefined);
  if (thumbUrl) {
    const t = resolveSafe(thumbUrl.replace(/^\/media\//, ""));
    if (t) await unlink(t).catch(() => undefined);
  }
}

/** Résout un chemin relatif dans UPLOAD_ROOT, en refusant toute traversée de répertoire. */
export function resolveSafe(rel: string): string | null {
  if (!/^[\w\-/.]+$/.test(rel) || rel.includes("..")) return null;
  const full = path.resolve(UPLOAD_ROOT, rel);
  return full.startsWith(UPLOAD_ROOT + path.sep) ? full : null;
}

export const MIME_BY_EXT: Record<string, string> = {
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};
