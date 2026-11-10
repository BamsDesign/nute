import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { MEDIA_CATEGORIES } from "@/lib/taxonomy";
import { AdminHead } from "@/components/admin/Head";
import { MediaUploadPanel } from "./UploadPanel";

export const metadata = { title: "Médiathèque" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ categorie?: string; q?: string; supprime?: string; sansalt?: string }> }) {
  await requireUser();
  const { categorie, q = "", supprime, sansalt } = await searchParams;
  const cat = MEDIA_CATEGORIES.some((c) => c.value === categorie) ? categorie : undefined;
  const [items, counts, missingAlt] = await Promise.all([
    db.media.findMany({
      where: {
        ...(cat ? { category: cat as "OTHER" } : {}),
        ...(q ? { OR: [{ alt: { contains: q, mode: "insensitive" } }, { originalName: { contains: q, mode: "insensitive" } }] } : {}),
        ...(sansalt ? { alt: "" } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.media.groupBy({ by: ["category"], _count: true }),
    db.media.count({ where: { alt: "" } }),
  ]);
  const total = counts.reduce((n, c) => n + c._count, 0);
  return (
    <>
      <AdminHead title="Médiathèque" description="Photographies, vidéos et documents classés par catégorie. Chaque image doit avoir une description." />
      {supprime && <p className="a-alert a-alert--ok" style={{ marginBottom: "1rem" }}>Média supprimé.</p>}
      {missingAlt > 0 && (
        <p className="a-alert a-alert--warn" style={{ marginBottom: "1rem" }}>
          {missingAlt} média(s) sans description. <Link href={adminHref("medias?sansalt=1")} style={{ textDecoration: "underline" }}>Les afficher</Link>
        </p>
      )}
      <MediaUploadPanel />
      <nav className="a-tabs" aria-label="Catégories" style={{ marginTop: "1.25rem" }}>
        <Link href={adminHref("medias")} aria-current={!cat && !sansalt ? "page" : undefined}>Tous ({total})</Link>
        {MEDIA_CATEGORIES.map((c) => (
          <Link key={c.value} href={adminHref(`medias?categorie=${c.value}`)} aria-current={cat === c.value ? "page" : undefined}>
            {c.label} ({counts.find((x) => x.category === c.value)?._count ?? 0})
          </Link>
        ))}
      </nav>
      <form className="a-toolbar" role="search">
        {cat && <input type="hidden" name="categorie" value={cat} />}
        <input className="a-input" type="search" name="q" defaultValue={q} placeholder="Rechercher…" aria-label="Rechercher" />
        <button className="a-btn" type="submit">Rechercher</button>
      </form>
      {items.length === 0 ? (
        <p className="a-hint">Aucun média.</p>
      ) : (
        <ul className="a-media-grid">
          {items.map((m) => (
            <li key={m.id}>
              <Link href={adminHref(`medias/${m.id}`)} className="a-media-tile">
                {m.mimeType.startsWith("image/") ? <img src={m.thumbUrl ?? m.url} alt="" loading="lazy" /> : <span className="a-media-tile__file">{m.mimeType.split("/")[1]?.toUpperCase()}</span>}
                <span className="a-media-tile__name">{m.alt || <em style={{ color: "#a36b00" }}>Sans description</em>}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
