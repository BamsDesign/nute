/**
 * Crée (ou réinitialise) un compte administrateur.
 * Usage : ADMIN_EMAIL=… ADMIN_PASSWORD=… ADMIN_NAME="…" npm run admin:create
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = process.env.ADMIN_NAME?.trim() || "Administrateur NUTE";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("ADMIN_EMAIL manquant ou invalide.");
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))
    throw new Error("ADMIN_PASSWORD : 12 caractères minimum, avec majuscules, minuscules et chiffres.");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", active: true, failedLogins: 0, lockedUntil: null },
    create: { email, name, passwordHash, role: "ADMIN" },
  });
  await db.session.deleteMany({ where: { userId: user.id } });
  await db.auditLog.create({ data: { action: "user.cli_admin", userId: user.id, entity: "User", entityId: user.id } });
  console.log(`Administrateur prêt : ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
