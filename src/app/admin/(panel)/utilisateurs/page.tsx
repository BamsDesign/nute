import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";
import { CreateUserForm, EditUserForm } from "./UserForms";
import { createUser, updateUser } from "../../actions";

export const metadata = { title: "Utilisateurs" };

export default async function UsersPage() {
  const me = await requireUser(["ADMIN"]);
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, lockedUntil: true } });
  return (
    <>
      <AdminHead title="Utilisateurs" description="Administrateurs : accès complet. Éditeurs : gestion des contenus, médias et demandes (sans paramètres, utilisateurs ni journal)." />
      <div className="a-cols">
        <div>
          {users.map((u) => (
            <section key={u.id} className="a-card">
              <h2>
                {u.name} {u.id === me.id && <span className="a-pill">Vous</span>} {!u.active && <span className="a-pill a-pill--off">Désactivé</span>}
                {u.lockedUntil && u.lockedUntil > new Date() && <span className="a-pill a-pill--warn">Bloqué temporairement</span>}
              </h2>
              <p className="a-hint" style={{ marginBottom: "0.75rem" }}>
                {u.email} · Dernière connexion : {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "jamais"}
              </p>
              <EditUserForm action={updateUser.bind(null, u.id)} role={u.role} active={u.active} self={u.id === me.id} />
            </section>
          ))}
        </div>
        <section className="a-card">
          <h2>Nouveau compte</h2>
          <CreateUserForm action={createUser} />
        </section>
      </div>
    </>
  );
}
