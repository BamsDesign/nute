import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect(adminHref());
  return (
    <main className="a-login">
      <div className="a-login__card">
        <div>
          <p className="a-hint" style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            NUTE · Espace d&apos;administration
          </p>
          <h1 style={{ marginTop: "0.5rem" }}>Connexion</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
