import nodemailer from "nodemailer";
import { env } from "../config/env.js";

// In tests, mails go to this array so tests can read them. Without SMTP in dev, mails are logged.
export const outbox = [];

let transport;
function getTransport() {
  if (transport) return transport;
  if (env.isTest || !env.SMTP_HOST) {
    transport = nodemailer.createTransport({ jsonTransport: true });
  } else {
    transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transport;
}

export async function sendMail({ to, subject, text }) {
  const msg = { from: env.MAIL_FROM, to, subject, text };
  if (env.isTest) {
    outbox.push(msg);
    return;
  }
  if (!env.SMTP_HOST) {
    if (env.isProd) console.warn(`SMTP not configured; email to ${to} not sent`);
    else console.log(`\n--- email (dev, not sent) ---\nTo: ${to}\nSubject: ${subject}\n${text}\n-----------------------------\n`);
    return;
  }
  try {
    await getTransport().sendMail(msg);
  } catch (e) {
    // Account creation must not fail because SMTP is down; the temp password is also shown on screen.
    console.error("email send failed:", e.message);
  }
}

export function credentialsMail({ name, email, password, role }) {
  const roleHi = { lab_staff: "Lab", doctor: "Doctor", agent: "Field agent" }[role] || role;
  return {
    to: email,
    subject: "NidaanSetu login details",
    text: `Namaste ${name},

Aapka NidaanSetu ${roleHi} account ban gaya hai.

Login ID (email): ${email}
Temporary password: ${password}

Login: ${env.CLIENT_ORIGIN}/login
Pehli baar login karne par naya password banana hoga.

- NidaanSetu team`,
  };
}

export function resetMail({ name, email, token }) {
  return {
    to: email,
    subject: "NidaanSetu password reset",
    text: `Namaste ${name},

Password badalne ke liye yeh link kholein (30 minute tak chalega):
${env.CLIENT_ORIGIN}/reset-password?token=${token}

Agar aapne yeh nahi maanga tha, toh is email ko ignore karein.

- NidaanSetu team`,
  };
}
