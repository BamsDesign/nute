import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { getResource } from "@/lib/admin/resources";
import { loadFormContext } from "@/lib/admin/form-data";
import { AdminHead } from "@/components/admin/Head";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { saveResource } from "../../../actions";

export const metadata = { title: "Nouveau contenu" };

export default async function NewResource({ params }: { params: Promise<{ resource: string }> }) {
  await requireUser();
  const res = getResource((await params).resource);
  if (!res) notFound();
  const ctx = await loadFormContext(res, null);
  const defaults: Record<string, string | boolean> = { published: false };
  if (res.model === "service") defaults.published = true;
  return (
    <>
      <AdminHead title={`Nouveau : ${res.singular}`} crumbs={[{ href: adminHref(res.key), label: res.label }]} />
      {res.notice && <p className="a-alert a-alert--info" style={{ marginBottom: "1rem" }}>{res.notice}</p>}
      <ResourceForm action={saveResource.bind(null, res.key, null)} fields={ctx.fields} values={defaults} relationOptions={ctx.relationOptions} gallery={[]} />
    </>
  );
}
