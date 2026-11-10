import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { adminHref } from "@/lib/admin-path";
import { formatDateTime } from "@/lib/format";
import { AdminHead } from "@/components/admin/Head";
import { ConfirmButton } from "@/components/admin/fields";
import { ContactStatusForm } from "./StatusForm";
import { deleteContact, updateContact } from "../../../actions";

export const metadata = { title: "Demande de contact" };

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const r = await db.contactRequest.findUnique({ where: { id: (await params).id } });
  if (!r) notFound();
  const service = r.service ? await db.service.findUnique({ where: { slug: r.service }, select: { title: true } }) : null;
  const reply = `mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.subject}`)}`;
  const wa = r.phone ? `https://wa.me/${r.phone.replace(/\D/g, "")}` : null;
  return (
    <>
      <AdminHead
        title={r.subject}
        crumbs={[{ href: adminHref("demandes"), label: "Demandes" }]}
        actions={
          <>
            <a className="a-btn a-btn--primary" href={reply}>Répondre par e-mail</a>
            {wa && <a className="a-btn" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            {user.role === "ADMIN" && (
              <form action={deleteContact.bind(null, r.id)}>
                <ConfirmButton message="Supprimer définitivement cette demande ?">Supprimer</ConfirmButton>
              </form>
            )}
          </>
        }
      />
      <div className="a-cols">
        <section className="a-card">
          <h2>Message</h2>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{r.message}</p>
        </section>
        <div>
          <section className="a-card">
            <h2>Coordonnées</h2>
            <dl className="a-kv">
              <dt>Nom</dt><dd>{r.name}</dd>
              <dt>E-mail</dt><dd><a href={reply} style={{ textDecoration: "underline" }}>{r.email}</a></dd>
              <dt>Téléphone</dt><dd>{r.phone ?? "—"}</dd>
              <dt>Organisation</dt><dd>{r.company ?? "—"}</dd>
              <dt>Service</dt><dd>{service?.title ?? r.service ?? "—"}</dd>
              <dt>Reçue le</dt><dd>{formatDateTime(r.createdAt)}</dd>
            </dl>
          </section>
          <section className="a-card">
            <h2>Suivi</h2>
            <ContactStatusForm action={updateContact.bind(null, r.id)} status={r.status} notes={r.notes ?? ""} />
          </section>
        </div>
      </div>
    </>
  );
}
