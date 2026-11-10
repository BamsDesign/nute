import "server-only";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { db } from "./db";
import { getClientIp, getUserAgent } from "./request";
import { adminHref } from "./admin-path";

const isProd = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = isProd ? "__Host-nute_session" : "nute_session";
const SESSION_TTL_HOURS = 12;
const BCRYPT_COST = 12;
// Hash factice pour un temps de réponse constant quand l'utilisateur n'existe pas.
const DUMMY_HASH = "$2b$12$F0nMNv3.PbX8LurVGCikf.CtltRpfcRQrpbpkmBGT0/2OkKMl9VYa";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role">;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  return bcrypt.compare(password, hash ?? DUMMY_HASH);
}

export function passwordPolicyError(password: string): string | null {
  if (password.length < 12) return "Le mot de passe doit contenir au moins 12 caractères.";
  if (password.length > 128) return "Le mot de passe est trop long.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password))
    return "Le mot de passe doit contenir des minuscules, des majuscules et des chiffres.";
  return null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
  await db.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, ip: await getClientIp(), userAgent: await getUserAgent() },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, role: true, active: true } } },
  });
  if (!session || session.expiresAt < new Date() || !session.user.active) return null;
  const { active: _active, ...user } = session.user;
  return user;
}

/** À appeler en tête de chaque page et action d'administration. */
export async function requireUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(adminHref("connexion"));
  if (roles && !roles.includes(user.role)) notFound();
  return user;
}

/** Variante pour les route handlers : renvoie null au lieu de rediriger. */
export async function userForApi(roles?: Role[]): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (roles && !roles.includes(user.role)) return null;
  return user;
}

export const can = {
  manageUsers: (u: SessionUser) => u.role === "ADMIN",
  manageSettings: (u: SessionUser) => u.role === "ADMIN",
  viewAudit: (u: SessionUser) => u.role === "ADMIN",
};
