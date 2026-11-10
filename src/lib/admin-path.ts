/** Chemin public (secret) de l'administration. /admin est volontairement inaccessible. */
export const ADMIN_PATH = (process.env.ADMIN_PATH || "espace-nute").replace(/^\/+|\/+$/g, "");

export function adminHref(path = ""): string {
  const clean = path.replace(/^\/+/, "");
  return `/${ADMIN_PATH}${clean ? `/${clean}` : ""}`;
}
