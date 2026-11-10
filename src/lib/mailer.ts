import "server-only";
import nodemailer from "nodemailer";

/** Envoi d'e-mail optionnel : actif uniquement si SMTP_HOST est configuré. */
export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!process.env.SMTP_HOST) return false;
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
    await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, ...opts });
    return true;
  } catch (e) {
    console.error("[mail] échec d'envoi", e);
    return false;
  }
}
