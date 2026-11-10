import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { CONTACT_STATUSES, labelOf } from "@/lib/taxonomy";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";

export const metadata = { title: "Demandes de contact" };

export default async function Contacts({ searchParams }: { searchParams: Promise<{ statut?: string; supprime?: string }> }) {
  await requireUser();
  const { statut, supprime } = await searchParams;
  const status = CONTACT_STATUSES.some((s) => s.value === statut) ? statut : undefined;
  const [rows, counts] = await Promise.all([
    db.contactRequest.findMany({ where: status ? { status: status as "NEW" } : { status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.contactRequest.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  return (
    <>
      <AdminHead title="Demandes de contact" description="Messages reçus via le formulaire du site." />
      {supprime && <p className="a-alert a-alert--ok" style={{ marginBottom: "1rem" }}>Demande supprimée.</p>}
      <nav className="a-tabs" aria-label="Filtrer par statut">
        <Link href={adminHref("demandes")} aria-current={!status ? "page" : undefined}>Actives</Link>
        {CONTACT_STATUSES.map((s) => (
          <Link key={s.value} href={adminHref(`demandes?statut=${s.value}`)} aria-current={status === s.value ? "page" : undefined}>
            {s.label} ({count(s.value)})
          </Link>
        ))}
      </nav>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Objet</th>
              <th>Contact</th>
              <th>Service</th>
              <th>Reçue le</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="a-hint" style={{ padding: "2rem", textAlign: "center" }}>Aucune demande.</td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link className="a-row-link" href={adminHref(`demandes/${r.id}`)}>{r.subject}</Link>
                </td>
                <td>
                  {r.name}
                  <div className="a-hint">{r.company ?? r.email}</div>
                </td>
                <td className="a-hint">{r.service ?? "—"}</td>
                <td className="a-hint">{formatDateTime(r.createdAt)}</td>
                <td>
                  <span className={`a-pill ${r.status === "NEW" ? "a-pill--new" : r.status === "DONE" ? "a-pill--on" : ""}`}>{labelOf(CONTACT_STATUSES, r.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
