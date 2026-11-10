import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";
import { PasswordForm } from "./PasswordForm";
import { changeOwnPassword } from "../../actions";

export const metadata = { title: "Mon compte" };

export default async function AccountPage() {
  const user = await requireUser();
  const sessions = await db.session.findMany({ where: { userId: user.id, expiresAt: { gt: new Date() } }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <AdminHead title="Mon compte" description={`${user.name} · ${user.email}`} />
      <div className="a-cols">
        <section className="a-card">
          <h2>Changer de mot de passe</h2>
          <PasswordForm action={changeOwnPassword} />
        </section>
        <section className="a-card">
          <h2>Sessions actives</h2>
          <ul className="a-checklist">
            {sessions.map((s) => (
              <li key={s.id} style={{ display: "block" }}>
                <strong>{formatDateTime(s.createdAt)}</strong>
                <div className="a-hint">{s.ip} · {s.userAgent?.slice(0, 80)}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
