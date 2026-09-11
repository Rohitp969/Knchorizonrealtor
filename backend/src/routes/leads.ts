import { Router } from "express";
import { getDb, serializeDocument } from "../lib/mongodb";
import type { InquiryDoc, NewsletterDoc } from "../lib/models";

const router = Router();

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
    const inquiry: Omit<InquiryDoc, "_id"> = {
      name: normalizedName, email: normalizedEmail, phone: normalizedPhone, interest: normalizedInterest, inquiryType: inquiryType ?? "contact",
      message: normalizedMessage, budget: normalizedBudget, propertyType: normalizedPropertyType, location: normalizedLocation, propertySlug, projectSlug, project, preferredVisitDate, status: "new", createdAt: new Date(),
    };
    const result = await getDb().collection<InquiryDoc>("inquiries").insertOne(inquiry);
    return res.status(201).json({ inquiry: serializeDocument({ ...inquiry, _id: result.insertedId } as unknown as Record<string, unknown>) });
  } catch (error) {
    return next(error);
  }
});

router.post("/newsletter", async (req, res, next) => {
  try {
    const { email } = req.body as Partial<NewsletterDoc>;
    if (!email || !email.includes("@")) return res.status(400).json({ message: "A valid email is required." });
    const existing = await getDb().collection<NewsletterDoc>("newsletter").findOne({ email: email.toLowerCase() });
    if (existing) return res.status(200).json({ message: "You are already on the list." });
    await getDb().collection<NewsletterDoc>("newsletter").insertOne({ email: email.toLowerCase(), subscribedAt: new Date(), createdAt: new Date() });
    return res.status(201).json({ message: "You are on the list." });
  } catch (error) {
    return next(error);
  }
});

export default router;