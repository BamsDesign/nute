import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PATH = (process.env.ADMIN_PATH || "espace-nute").replace(/^\/+|\/+$/g, "");
const COOKIE = process.env.NODE_ENV === "production" ? "__Host-nute_session" : "nute_session";

/**
 * - /admin n'est jamais accessible directement (404) : l'administration n'est servie
 *   que via le chemin secret ADMIN_PATH, réécrit en interne vers /admin.
 * - Sans cookie de session, toute page d'administration redirige vers la connexion.
 *   La validité réelle de la session est vérifiée côté serveur (base de données).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/__introuvable", req.url));
  }

  if (pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)) {
    const rest = pathname.slice(ADMIN_PATH.length + 1);
    const isLogin = rest === "/connexion";
    if (!isLogin && !req.cookies.get(COOKIE)) {
      return NextResponse.redirect(new URL(`/${ADMIN_PATH}/connexion`, req.url));
    }
    const res = NextResponse.rewrite(new URL(`/admin${rest}${req.nextUrl.search}`, req.url));
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|media/).*)"],
};
