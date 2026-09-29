/*
 * Sends one test email with the SMTP_* settings in backend/.env, to check the mailbox
 * password and the mail server before the same settings go into Render.
 *
 *   node scripts/test-email.mjs                    # to SMTP_USER itself
 *   node scripts/test-email.mjs someone@else.com   # to another address
 *
 * It does not connect to the database and changes nothing. The password is never printed.
 */
import "dotenv/config";
import { mailStatus, sendTestEmail } from "../src/lib/mailer.ts";

const to = process.argv[2] || process.env.SMTP_USER || "";
const status = mailStatus();
console.log(`Mail server: ${process.env.SMTP_HOST || "(SMTP_HOST is empty)"}, port ${process.env.SMTP_PORT || "587"}, signing in as ${process.env.SMTP_USER || "(SMTP_USER is empty)"}`);
if (!status.configured) {
  console.log(`Not sent: ${status.reason}`);
  process.exit(1);
}
const result = await sendTestEmail({ siteName: "KNC Horizon Realtor", leadNotificationEmail: to });
console.log(result.sent ? `Sent to ${result.to}. Check that inbox, and its spam folder.` : `Not sent: ${result.reason}`);
process.exit(result.sent ? 0 : 1);
