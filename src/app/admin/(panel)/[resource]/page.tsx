import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { getResource } from "@/lib/admin/resources";
import { delegate } from "@/lib/admin/save";
import { formatDate } from "@/lib/format";
import { labelOf } from "@/lib/taxonomy";
import { AdminHead } from "@/components/admin/Head";

const PAGE_SIZE = 30;

export async function generateMetadata({ params }: { params: Promise<{ resource: string }> }) {
  return { title: getResource((await params).resource)?.label ?? "Contenu" };
}

function get(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; page?: string; supprime?: string }> }) {
  await requireUser();
  const res = getResource((await params).resource);
  if (!res) notFound();
  const { q = "", page = "1", supprime } = await searchParams;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const where = q.trim() ? { OR: res.searchFields.map((f) => ({ [f]: { contains: q.trim().slice(0, 100), mode: "insensitive" } })) } : {};
  const include = res.columns.some((c) => c.field.includes(".")) ? { include: { category: { select: { title: true } } } } : {};
  const [rows, total] = await Promise.all([
    delegate(res.model).findMany({ where, orderBy: res.orderBy, skip: (p - 1) * PAGE_SIZE, take: PAGE_SIZE, ...include }),
    delegate(res.model).count({ where }),
  ]);
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <AdminHead
        title={res.label}
        description={res.description}
        actions={
          <Link href={adminHref(`${res.key}/nouveau`)} className="a-btn a-btn--primary">
            Ajouter {res.singular === "règle SEO" ? "une règle" : `un(e) ${res.singular}`}
          </Link>
        }
      />
      {supprime && <p className="a-alert a-alert--ok" style={{ marginBottom: "1rem" }}>Élément supprimé.</p>}
      {res.notice && <p className="a-alert a-alert--info" style={{ marginBottom: "1rem" }}>{res.notice}</p>}
      <form className="a-toolbar" role="search">
        <input className="a-input" type="search" name="q" defaultValue={q} placeholder="Rechercher…" aria-label="Rechercher" />
        <button className="a-btn" type="submit">Rechercher</button>
        <span className="a-hint">{total} élément(s)</span>
      </form>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              {res.columns.map((c) => (
                <th key={c.field}>{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={res.columns.length + 1} className="a-hint" style={{ padding: "2rem", textAlign: "center" }}>
                  Aucun élément. Commencez par en ajouter un.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={String(row.id)}>
                {res.columns.map((c, i) => {
                  const v = get(row, c.field);
                  let content: React.ReactNode = v === null || v === undefined || v === "" ? <span className="a-hint">—</span> : String(v);
                  if (c.kind === "date") content = v ? formatDate(v as Date) : <span className="a-hint">—</span>;
                  if (c.kind === "bool") content = v ? <span className="a-pill a-pill--on">Oui</span> : <span className="a-pill a-pill--off">Non</span>;
                  if (c.kind === "option" && c.options) content = labelOf(c.options, String(v ?? ""));
                  if (c.field === "isDemo") content = v ? <span className="a-pill a-pill--warn">Exemple</span> : <span className="a-hint">—</span>;
                  return (
                    <td key={c.field}>
                      {i === 0 ? (
                        <Link className="a-row-link" href={adminHref(`${res.key}/${row.id}`)}>
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </td>
                  );
                })}
                <td style={{ textAlign: "right" }}>
                  {res.publicPath && (
                    <a className="a-hint" href={res.publicPath(row) ?? "#"} target="_blank" rel="noopener">
                      Voir ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <nav className="a-pagination" aria-label="Pagination">
          {p > 1 && <Link className="a-btn" href={`?q=${encodeURIComponent(q)}&page=${p - 1}`}>← Précédent</Link>}
          <span className="a-hint" style={{ alignSelf: "center" }}>Page {p} / {pages}</span>
          {p < pages && <Link className="a-btn" href={`?q=${encodeURIComponent(q)}&page=${p + 1}`}>Suivant →</Link>}
        </nav>
      )}
    </>
  );
}
