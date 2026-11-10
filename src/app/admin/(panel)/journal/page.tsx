import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";

export const metadata = { title: "Journal d'audit" };
const PAGE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string; action?: string }> }) {
  await requireUser(["ADMIN"]);
  const { page = "1", action } = await searchParams;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const where = action ? { action: { startsWith: action.slice(0, 40) } } : {};
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (p - 1) * PAGE, take: PAGE, include: { user: { select: { name: true, email: true } } } }),
    db.auditLog.count({ where }),
  ]);
  const filters = [["", "Tout"], ["auth", "Connexions"], ["content", "Contenus"], ["media", "Médias"], ["settings", "Paramètres"], ["user", "Utilisateurs"], ["contact", "Demandes"]];
  return (
    <>
      <AdminHead title="Journal d'audit" description="Toutes les actions sensibles : connexions, échecs de connexion, créations, modifications et suppressions." />
      <nav className="a-tabs">
        {filters.map(([v, l]) => (
          <Link key={v} href={v ? `?action=${v}` : "?"} aria-current={(action ?? "") === v ? "page" : undefined}>{l}</Link>
        ))}
      </nav>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr><th>Date</th><th>Utilisateur</th><th>Action</th><th>Élément</th><th>Détails</th><th>IP</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="a-hint" style={{ whiteSpace: "nowrap" }}>{formatDateTime(l.createdAt)}</td>
                <td>{l.user?.name ?? <span className="a-hint">—</span>}</td>
                <td className="a-mono">{l.action}</td>
                <td className="a-hint">{l.entity ?? ""}</td>
                <td className="a-mono a-hint" style={{ maxWidth: 360, overflowWrap: "anywhere" }}>{l.details ? JSON.stringify(l.details) : ""}</td>
                <td className="a-mono a-hint">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="a-pagination">
        {p > 1 && <Link className="a-btn" href={`?page=${p - 1}${action ? `&action=${action}` : ""}`}>← Plus récents</Link>}
        {p * PAGE < total && <Link className="a-btn" href={`?page=${p + 1}${action ? `&action=${action}` : ""}`}>Plus anciens →</Link>}
      </nav>
    </>
  );
}
