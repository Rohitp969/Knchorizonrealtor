/*
 * Outgoing mail.
 *
 * Lead alerts are a convenience, never a gate: a visitor's enquiry is already safe in
 * PostgreSQL by the time we try to send anything, so every failure here is logged and
 * swallowed rather than surfaced to the visitor. If SMTP is not configured the alert is
 * logged and reported as "not configured", which is what the admin console shows, so an
 * unconfigured install looks unconfigured rather than broken.
 *
 * Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and optionally SMTP_FROM.
 */

import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger.ts";
import type { SiteSettings } from "./settings.ts";

export type MailStatus = {
  configured: boolean;
  host?: string;
  from?: string;
  reason?: string;
};

function config() {
  const host = process.env["SMTP_HOST"]?.trim();
  const port = Number(process.env["SMTP_PORT"] ?? 587);
  const user = process.env["SMTP_USER"]?.trim();
  const pass = process.env["SMTP_PASS"];
  const from = process.env["SMTP_FROM"]?.trim() || user;
  return { host, port, user, pass, from };
}

/** Whether outgoing mail can be sent, and why not when it cannot. */
export function mailStatus(): MailStatus {
  const { host, port, user, pass, from } = config();
  if (!host) return { configured: false, reason: "SMTP_HOST is not set." };
  if (!user || !pass) return { configured: false, host, reason: "SMTP_USER or SMTP_PASS is not set." };
  if (!Number.isFinite(port) || port <= 0) return { configured: false, host, reason: "SMTP_PORT is not a valid port." };
  return { configured: true, host, from };
}

/*
 * One transport for the process. nodemailer pools connections, so building this per message
 * would open a new SMTP session for every enquiry.
 */
let transport: Transporter | undefined;

function transporter() {
  if (transport) return transport;
  const { host, port, user, pass } = config();
  transport = nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; everything else starts plain and upgrades with STARTTLS.
    secure: port === 465,
    // The upgrade is required, not hoped for: the password is never sent unencrypted.
    requireTLS: port !== 465,
    auth: { user, pass },
    // A mail server that cannot be reached has to fail in seconds. Left to the defaults, each
    // enquiry would hold a connection open for minutes before giving up.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

/** Why a message could not be sent, in words the owner can act on. */
function explain(error: unknown) {
  const code = String((error as { code?: unknown } | null)?.code ?? "");
  const detail = error instanceof Error ? error.message : "Unknown mail error.";
  if (code === "EAUTH") return `The mail server refused the sign-in. Check SMTP_USER and SMTP_PASS (the mailbox's own password). [${detail}]`;
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNREFUSED", "EDNS"].includes(code)) {
    return `The mail server could not be reached. Check SMTP_HOST and SMTP_PORT. On a free Render instance outgoing mail ports (25, 465, 587) are blocked, so email needs a paid instance. [${detail}]`;
  }
  if (code === "EENVELOPE") return `The mail server refused the sender or the recipient address. SMTP_FROM must be the mailbox that signs in. [${detail}]`;
  return detail;
}

export type LeadAlert = {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  budget?: string;
  propertyType?: string;
  location?: string;
  propertySlug?: string;
  projectSlug?: string;
  inquiryType?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function alertBody(lead: LeadAlert, settings: SiteSettings) {
  const rows: [string, string | undefined][] = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Looking to", lead.interest],
    ["Budget", lead.budget],
    ["Property type", lead.propertyType],
    ["Preferred location", lead.location],
    ["Property", lead.propertySlug],
    ["Project", lead.projectSlug],
    ["Enquiry type", lead.inquiryType],
  ];
  const filled = rows.filter(([, value]) => value && String(value).trim());

  const text = [
    `New enquiry from ${settings.siteName}`,
    "",
    ...filled.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    lead.message,
  ].join("\n");

  const html = [
    `<h2 style="font-family:Georgia,serif;color:#202635;margin:0 0 16px">New enquiry from ${escapeHtml(settings.siteName)}</h2>`,
    '<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">',
    ...filled.map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#6b7280">${escapeHtml(label)}</td><td style="padding:4px 0;color:#202635">${escapeHtml(String(value))}</td></tr>`,
    ),
    "</table>",
    '<p style="font-family:system-ui,sans-serif;font-size:14px;color:#6b7280;margin:20px 0 4px">Message</p>',
    `<p style="font-family:system-ui,sans-serif;font-size:14px;color:#202635;white-space:pre-line;margin:0">${escapeHtml(lead.message)}</p>`,
  ].join("");

  return { text, html };
}

/**
 * Sends a lead alert to the address configured in Admin → Settings. Never throws: the
 * enquiry is already stored, so a mail problem must not turn into a failed submission.
 */
export async function sendLeadAlert(lead: LeadAlert, settings: SiteSettings): Promise<{ sent: boolean; reason?: string }> {
  const to = settings.leadNotificationEmail?.trim();
  if (!to) return { sent: false, reason: "No lead notification address is set in Admin → Settings." };

  const status = mailStatus();
  if (!status.configured) {
    logger.info({ to, lead: { name: lead.name, email: lead.email } }, `Lead alert not sent: ${status.reason}`);
    return { sent: false, reason: status.reason };
  }

  try {
    const { text, html } = alertBody(lead, settings);
    await transporter().sendMail({
      from: config().from,
      to,
      replyTo: lead.email,
      subject: `New enquiry — ${lead.name}`,
      text,
      html,
    });
    logger.info({ to }, "Lead alert sent");
    return { sent: true };
  } catch (error) {
    logger.error({ err: error, to }, "Lead alert failed to send");
    return { sent: false, reason: explain(error) };
  }
}

/**
 * Sends a short test message to the lead alert address, for the "Send a test email" button in
 * Admin → Settings: the one way to see, on the live server, that alerts really arrive.
 */
export async function sendTestEmail(settings: SiteSettings): Promise<{ sent: boolean; to?: string; reason?: string }> {
  const to = settings.leadNotificationEmail?.trim();
  if (!to) return { sent: false, reason: 'No lead alert address is saved yet. Fill in "Send lead alerts to" and save first.' };
  const status = mailStatus();
  if (!status.configured) return { sent: false, to, reason: status.reason };
  try {
    await transporter().sendMail({
      from: config().from,
      to,
      subject: `Test email from ${settings.siteName}`,
      text: `This is a test from the ${settings.siteName} admin console.\n\nIf you are reading it, enquiry alerts from the website will reach this address.`,
    });
    logger.info({ to }, "Test email sent");
    return { sent: true, to };
  } catch (error) {
    logger.error({ err: error, to }, "Test email failed to send");
    return { sent: false, to, reason: explain(error) };
  }
}
