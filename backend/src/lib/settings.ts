/*
 * Site settings.
 *
 * One row in the `settings` table carries the whole site configuration inside its `value`
 * jsonb (see repositories.ts for how the flat document is folded in and out). This module is
 * the only place that decides what a setting is called, what it defaults to, and what counts
 * as a valid value, so the admin console, the public API and the lead mailer cannot drift
 * apart.
 *
 * Defaults matter: the public site reads these to render its contact details, so a missing
 * row must still produce a usable site rather than blank phone numbers.
 */

import { findOneBy, insertRow, listAll, toApi, updateRow } from "./repositories.ts";

export type SiteSettings = {
  // Settings panel
  siteName: string;
  defaultCurrency: string;
  leadNotificationEmail: string;
  // Website content panel — contact details
  contactPhone: string;
  contactPhoneHref: string;
  contactEmail: string;
  contactWhatsapp: string;
  officeDubai: string;
  officeIndia: string;
  studioHours: string;
  // Website content panel — home hero
  heroEyebrow: string;
  heroHeadline: string;
  heroCopy: string;
  // Website content panel — SEO defaults
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

/** What the site falls back to when a value has never been set. */
export const SETTINGS_DEFAULTS: SiteSettings = {
  siteName: "KNC Horizon Realtor",
  defaultCurrency: "AED",
  leadNotificationEmail: "",
  contactPhone: "+971 58 514 1770",
  contactPhoneHref: "+971585141770",
  contactEmail: "hello@knchorizonrealtor.com",
  contactWhatsapp: "971585141770",
  officeDubai: "Dubai, UAE",
  officeIndia: "DLF Phase 1, Gurugram, Haryana, India",
  studioHours: "Monday — Saturday, 09:00 — 18:00 GST",
  heroEyebrow: "",
  heroHeadline: "",
  heroCopy: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

/** The currencies the console offers. Anything else is rejected rather than stored. */
export const SUPPORTED_CURRENCIES = ["AED", "USD", "EUR", "GBP", "INR", "SAR"] as const;

/** `leadNotificationEmail` is internal: it is never exposed on a public endpoint. */
const PRIVATE_FIELDS = new Set<keyof SiteSettings>(["leadNotificationEmail"]);

const SETTINGS_KEYS = Object.keys(SETTINGS_DEFAULTS) as (keyof SiteSettings)[];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationError = { field: string; message: string };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validates the fields present in `patch`. Partial updates are normal — the console has two
 * panels that each save their own half of the row — so a field that was not submitted is
 * simply not checked.
 */
export function validateSettings(patch: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const has = (field: keyof SiteSettings) => Object.prototype.hasOwnProperty.call(patch, field);

  if (has("siteName")) {
    const value = text(patch.siteName);
    if (!value) errors.push({ field: "siteName", message: "Site name is required." });
    else if (value.length > 80) errors.push({ field: "siteName", message: "Site name must be 80 characters or fewer." });
  }

  if (has("defaultCurrency")) {
    const value = text(patch.defaultCurrency).toUpperCase();
    if (!value) errors.push({ field: "defaultCurrency", message: "Default currency is required." });
    else if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(value)) {
      errors.push({ field: "defaultCurrency", message: `Currency must be one of: ${SUPPORTED_CURRENCIES.join(", ")}.` });
    }
  }

  // Optional, but if it is filled in it has to be an address a lead alert can reach.
  if (has("leadNotificationEmail")) {
    const value = text(patch.leadNotificationEmail);
    if (value && !EMAIL_RE.test(value)) {
      errors.push({ field: "leadNotificationEmail", message: "Enter a valid email address." });
    }
  }

  if (has("contactEmail")) {
    const value = text(patch.contactEmail);
    if (!value) errors.push({ field: "contactEmail", message: "Contact email is required." });
    else if (!EMAIL_RE.test(value)) errors.push({ field: "contactEmail", message: "Enter a valid email address." });
  }

  if (has("contactPhone")) {
    const value = text(patch.contactPhone);
    if (!value) errors.push({ field: "contactPhone", message: "Contact phone is required." });
    else if (!/^[+\d][\d\s()-]{6,24}$/.test(value)) {
      errors.push({ field: "contactPhone", message: "Enter a phone number like +971 58 514 1770." });
    }
  }

  // wa.me links only accept digits, so a number typed with +, spaces or dashes would 404.
  if (has("contactWhatsapp")) {
    const value = text(patch.contactWhatsapp);
    if (!value) errors.push({ field: "contactWhatsapp", message: "WhatsApp number is required." });
    else if (!/^\d{8,15}$/.test(value)) {
      errors.push({ field: "contactWhatsapp", message: "Digits only, with country code and no +, e.g. 971585141770." });
    }
  }

  for (const field of ["officeDubai", "officeIndia", "studioHours", "heroEyebrow", "heroHeadline", "seoTitle", "seoKeywords"] as const) {
    if (has(field) && text(patch[field]).length > 200) {
      errors.push({ field, message: "Keep this under 200 characters." });
    }
  }
  for (const field of ["heroCopy", "seoDescription"] as const) {
    if (has(field) && text(patch[field]).length > 600) {
      errors.push({ field, message: "Keep this under 600 characters." });
    }
  }

  return errors;
}

/** Trims, normalises and drops anything that is not a known setting. */
export function normaliseSettings(patch: Record<string, unknown>) {
  const clean: Record<string, string> = {};
  for (const field of SETTINGS_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(patch, field)) continue;
    let value = text(patch[field]);
    if (field === "defaultCurrency") value = value.toUpperCase();
    if (field === "contactEmail" || field === "leadNotificationEmail") value = value.toLowerCase();
    if (field === "contactWhatsapp") value = value.replace(/\D/g, "");
    clean[field] = value;
  }
  // A phone number typed for display doubles as the tel: link, minus the spacing.
  if (clean.contactPhone !== undefined) {
    clean.contactPhoneHref = clean.contactPhone.replace(/[^\d+]/g, "");
  }
  return clean;
}

/** The single settings row, or undefined when the table is empty. */
async function settingsRow() {
  const keyed = await findOneBy("settings", "key", "site");
  if (keyed) return keyed;
  const rows = await listAll("settings", "created_at asc");
  return rows[0];
}

/** Every setting, defaults filled in for anything never saved. */
export async function readSettings(): Promise<SiteSettings & { id?: string }> {
  const row = await settingsRow();
  const stored = (row ? toApi("settings", row) : undefined) as Record<string, unknown> | undefined;
  const result = { ...SETTINGS_DEFAULTS } as SiteSettings & { id?: string };
  if (stored) {
    result.id = String(stored.id ?? "");
    for (const field of SETTINGS_KEYS) {
      const value = stored[field];
      if (typeof value === "string" && value.trim()) result[field] = value as never;
    }
  }
  return result;
}

/** The half of the settings a public page is allowed to see. */
export function publicSettings(settings: SiteSettings) {
  const result: Record<string, string> = {};
  for (const field of SETTINGS_KEYS) {
    if (PRIVATE_FIELDS.has(field)) continue;
    result[field] = settings[field];
  }
  return result;
}

/**
 * Applies a validated patch to the settings row, creating it if this is the first save.
 * Returns the full settings object so a caller never has to read back.
 */
export async function writeSettings(patch: Record<string, unknown>) {
  const clean = normaliseSettings(patch);
  const row = await settingsRow();
  const now = new Date();
  if (row) {
    await updateRow("settings", String(row.id), { ...clean, updatedAt: now });
  } else {
    await insertRow("settings", { ...clean, key: "site", createdAt: now, updatedAt: now });
  }
  return readSettings();
}
