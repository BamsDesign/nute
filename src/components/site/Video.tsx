import { videoEmbedUrl } from "@/lib/format";

export function Video({ url, title }: { url: string | null | undefined; title: string }) {
  const v = videoEmbedUrl(url);
  if (!v) return null;
  return (
    <div className="video-embed">
      {v.kind === "embed" ? (
        <iframe src={v.src} title={title} loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <video src={v.src} controls preload="metadata" aria-label={title} />
      )}
    </div>
  );
}
