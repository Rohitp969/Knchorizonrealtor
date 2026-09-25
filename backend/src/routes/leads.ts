import { Router } from "express";
import { queryOne } from "../lib/postgres.ts";
import { insertRow, toApi } from "../lib/repositories.ts";
import type { InquiryDoc, NewsletterDoc } from "../lib/models.ts";
import { sendLeadAlert } from "../lib/mailer.ts";
import { readSettings } from "../lib/settings.ts";
import { logger } from "../lib/logger.ts";

const router = Router();

/** Resolves the slug a form submitted to the listing it refers to, so the lead is linked. */
async function resolveId(table: "properties" | "projects", slug: unknown) {
  if (typeof slug !== "string" || !slug.trim()) return undefined;
  const row = await queryOne<{ id: string }>(`select id from "${table}" where slug = $1`, [slug.trim()]);
  return row?.id;
}

router.post("/inquiries", async (req, res, next) => {
  try {
    const { name, email, phone, interest, inquiryType, message, budget, propertyType, location, propertySlug, projectSlug, project, preferredVisitDate } = req.body as Partial<InquiryDoc>;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
    const normalizedInterest = typeof interest === "string" ? interest.trim() : "";
    const normalizedMessage = typeof message === "string" ? message.trim() : "";
    const normalizedBudget = typeof budget === "string" ? budget.trim() : undefined;
    const normalizedPropertyType = typeof propertyType === "string" ? propertyType.trim() : undefined;
    const normalizedLocation = typeof location === "string" ? location.trim() : undefined;
    if (!normalizedName || !normalizedEmail || !normalizedPhone || !normalizedInterest || !normalizedMessage) return res.status(400).json({ message: "Name, phone, email, interest, and message are required." });
    if (normalizedName.length > 120 || normalizedEmail.length > 254 || normalizedPhone.length > 40 || normalizedInterest.length > 120 || normalizedMessage.length > 5000) return res.status(400).json({ message: "Please keep the enquiry within the allowed length limits." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return res.status(400).json({ message: "Please provide a valid email address." });
    // The site's phone field checks the number against its country; this is the server-side
    // floor: international format with the country code, 7-15 digits (the E.164 limit).
    const phoneDigits = normalizedPhone.replace(/\D/g, "");
    if (!/^\+[\d\s().-]+$/.test(normalizedPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) return res.status(400).json({ message: "Please provide a valid phone number with its country code, e.g. +971 50 123 4567." });

    // The slugs stay exactly as submitted; the ids are the resolved links for reporting.
    const [propertyId, projectId] = await Promise.all([
      resolveId("properties", propertySlug),
      resolveId("projects", projectSlug ?? project),
    ]);

    const row = await insertRow("inquiries", {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      interest: normalizedInterest,
      inquiryType: inquiryType ?? "contact",
      message: normalizedMessage,
      budget: normalizedBudget,
      propertyType: normalizedPropertyType,
      location: normalizedLocation,
      propertySlug,
      projectSlug,
      property: propertyId,
      project: projectId,
      preferredVisitDate,
      status: "new",
      createdAt: new Date(),
    });
    /*
     * Alert the advisory desk. The enquiry is already committed, so this runs after the
     * response is decided and every failure is logged rather than raised: a mail outage
     * must never turn into a failed enquiry for the visitor.
     */
    void readSettings()
      .then((settings) =>
        sendLeadAlert(
          {
            name: normalizedName,
            email: normalizedEmail,
            phone: normalizedPhone,
            interest: normalizedInterest,
            message: normalizedMessage,
            budget: normalizedBudget,
            propertyType: normalizedPropertyType,
            location: normalizedLocation,
            propertySlug: typeof propertySlug === "string" ? propertySlug : undefined,
            projectSlug: typeof projectSlug === "string" ? projectSlug : undefined,
            inquiryType: inquiryType ?? "contact",
          },
          settings,
        ),
      )
      .catch((error) => logger.error({ err: error }, "Lead alert pipeline failed"));

    return res.status(201).json({ inquiry: toApi("inquiries", row) });
  } catch (error) {
    return next(error);
  }
});

router.post("/newsletter", async (req, res, next) => {
  try {
    const { email } = req.body as Partial<NewsletterDoc>;
    if (!email || !email.includes("@")) return res.status(400).json({ message: "A valid email is required." });
    const normalized = email.toLowerCase();
    const existing = await queryOne("select id from newsletter where email = $1", [normalized]);
    if (existing) return res.status(200).json({ message: "You are already on the list." });
    await insertRow("newsletter", { email: normalized, subscribedAt: new Date(), createdAt: new Date() });
    return res.status(201).json({ message: "You are on the list." });
  } catch (error) {
    return next(error);
  }
});

export default router;
