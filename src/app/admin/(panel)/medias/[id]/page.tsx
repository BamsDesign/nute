import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { mediaUsage } from "@/lib/admin/media";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";
import { ConfirmButton } from "@/components/admin/fields";
import { MediaEditForm } from "./MediaEditForm";
import { deleteMedia, updateMedia } from "../../../actions";

export const metadata = { title: "Média" };

export default async function MediaDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string }> }) {
  await requireUser();
  const m = await db.media.findUnique({ where: { id: (await params).id }, include: { uploadedBy: { select: { name: true } } } });
  if (!m) notFound();
  const { erreur } = await searchParams;
  const [usage, galleries] = await Promise.all([mediaUsage(m.url), db.galleryItem.count({ where: { mediaId: m.id } })]);
  return (
    <>
      <AdminHead
        title={m.alt || m.originalName}
        crumbs={[{ href: adminHref("medias"), label: "Médiathèque" }]}
        actions={
          <>
            <a className="a-btn" href={m.url} target="_blank" rel="noopener">Ouvrir ↗</a>
            <form action={deleteMedia.bind(null, m.id)}>
              <ConfirmButton message={galleries ? `Ce média est utilisé dans ${galleries} galerie(s) et en sera retiré. Supprimer ?` : "Supprimer définitivement ce média ?"}>Supprimer</ConfirmButton>
            </form>
          </>
        }
      />
      {erreur === "utilise" && <p className="a-alert a-alert--error" style={{ marginBottom: "1rem" }}>Ce média est utilisé comme image principale, logo ou dans un contenu ({usage} usage(s)). Remplacez-le avant de le supprimer.</p>}
      <div className="a-cols">
        <section className="a-card">
          {m.mimeType.startsWith("image/") ? (
            <img src={m.url} alt={m.alt} style={{ width: "100%", borderRadius: 4 }} />
          ) : m.mimeType.startsWith("video/") ? (
            <video src={m.url} controls style={{ width: "100%" }} />
          ) : (
            <p>Document PDF — <a href={m.url} style={{ textDecoration: "underline" }}>télécharger</a></p>
          )}
          <dl className="a-kv" style={{ marginTop: "1rem" }}>
            <dt>Fichier d&apos;origine</dt><dd>{m.originalName}</dd>
            <dt>Adresse</dt><dd className="a-mono">{m.url}</dd>
            <dt>Format</dt><dd>{m.mimeType}{m.width ? ` · ${m.width}×${m.height}` : ""} · {(m.size / 1024).toFixed(0)} Ko</dd>
            <dt>Ajouté</dt><dd>{formatDateTime(m.createdAt)}{m.uploadedBy ? ` par ${m.uploadedBy.name}` : ""}</dd>
            <dt>Utilisation</dt><dd>{usage} contenu(s), {galleries} galerie(s)</dd>
          </dl>
        </section>
        <section className="a-card">
          <h2>Description et classement</h2>
          <MediaEditForm action={updateMedia.bind(null, m.id)} alt={m.alt} caption={m.caption ?? ""} category={m.category} />
        </section>
      </div>
    </>
  );
}
