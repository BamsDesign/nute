import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { getResource } from "@/lib/admin/resources";
import { delegate, toFormValues } from "@/lib/admin/save";
import { loadFormContext } from "@/lib/admin/form-data";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { ConfirmButton } from "@/components/admin/fields";
import { deleteResource, saveResource } from "../../../actions";

export const metadata = { title: "Modifier" };

export default async function EditResource({ params, searchParams }: { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ cree?: string; erreur?: string }> }) {
  await requireUser();
  const { resource, id } = await params;
  const { cree, erreur } = await searchParams;
  const res = getResource(resource);
  if (!res) notFound();
  const item = await delegate(res.model).findUnique({ where: { id } });
  if (!item) notFound();
  const ctx = await loadFormContext(res, id);
  const title = String(item[res.titleField] ?? res.singular);
  const publicUrl = res.publicPath?.(item);

  return (
    <>
      <AdminHead
        title={title}
        description={item.updatedAt ? `Dernière modification : ${formatDateTime(item.updatedAt as Date)}` : undefined}
        crumbs={[{ href: adminHref(res.key), label: res.label }]}
        actions={
          <>
            {publicUrl && (
              <a className="a-btn" href={publicUrl} target="_blank" rel="noopener">
                Voir sur le site ↗
              </a>
            )}
            <form action={deleteResource.bind(null, res.key, id)}>
              <ConfirmButton message={`Supprimer définitivement « ${title} » ?`}>Supprimer</ConfirmButton>
            </form>
          </>
        }
      />
      {cree && <p className="a-alert a-alert--ok" style={{ marginBottom: "1rem" }}>Contenu créé. Vous pouvez continuer à le compléter.</p>}
      {erreur === "categorie-non-vide" && <p className="a-alert a-alert--error" style={{ marginBottom: "1rem" }}>Cette catégorie contient encore des services : déplacez-les ou supprimez-les d&apos;abord.</p>}
      {"published" in item && !item.published && <p className="a-alert a-alert--warn" style={{ marginBottom: "1rem" }}>Ce contenu n&apos;est pas publié : il n&apos;apparaît pas sur le site.</p>}
      {res.notice && <p className="a-alert a-alert--info" style={{ marginBottom: "1rem" }}>{res.notice}</p>}
      <ResourceForm action={saveResource.bind(null, res.key, id)} fields={ctx.fields} values={toFormValues(res.fields, item)} relationOptions={ctx.relationOptions} gallery={ctx.gallery} />
    </>
  );
}
