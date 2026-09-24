/*
 * Site settings, live from the admin console.
 *
 * Everything the "Settings" and "Website content" panels save in PostgreSQL is served by
 * GET /public/settings and read through here, so changing a phone number in the admin
 * updates the navbar, the footer, the contact page and the WhatsApp button without a deploy.
 *
 * The values in contact-info.ts stay as the fallback. They are what renders on the very
 * first paint, and what the site keeps using if the API is unreachable, so a settings
 * outage degrades to the committed values rather than to blank phone numbers.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONTACT } from '@/lib/contact-info';
import { apiFetch } from '@/lib/api';

export type SiteSettings = {
  siteName: string;
  defaultCurrency: string;
  contactPhone: string;
  contactPhoneHref: string;
  contactEmail: string;
  contactWhatsapp: string;
  officeDubai: string;
  officeIndia: string;
  studioHours: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroCopy: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

export const SITE_SETTINGS_FALLBACK: SiteSettings = {
  siteName: 'KNC Horizon Realtor',
  defaultCurrency: 'AED',
  contactPhone: CONTACT.phoneDisplay,
  contactPhoneHref: CONTACT.phoneHref,
  contactEmail: CONTACT.email,
  contactWhatsapp: CONTACT.whatsapp,
  officeDubai: CONTACT.dubaiAddress,
  officeIndia: CONTACT.indiaAddress,
  studioHours: CONTACT.studioHours,
  heroEyebrow: '',
  heroHeadline: '',
  heroCopy: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

const SiteSettingsContext = createContext<SiteSettings>(SITE_SETTINGS_FALLBACK);

/** Keeps a saved blank from wiping a good fallback value. */
function withoutBlanks(patch: Partial<SiteSettings>) {
  const clean: Partial<SiteSettings> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === 'string' && value.trim()) clean[key as keyof SiteSettings] = value;
  }
  return clean;
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(SITE_SETTINGS_FALLBACK);

  useEffect(() => {
    let active = true;
    apiFetch<{ settings: Partial<SiteSettings> }>('/public/settings')
      .then((data) => {
        if (!active || !data?.settings) return;
        setSettings((current) => ({ ...current, ...withoutBlanks(data.settings) }));
      })
      .catch(() => {
        // Keep the committed fallback: a settings outage must not blank the contact details.
      });
    return () => { active = false; };
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

/**
 * The contact details in the shape the markup has always used, so a component reads
 * `contact.phoneDisplay` exactly as it read `CONTACT.phoneDisplay` before.
 */
export function useContact() {
  const settings = useSiteSettings();
  return useMemo(
    () => ({
      phoneDisplay: settings.contactPhone,
      phoneHref: settings.contactPhoneHref,
      whatsapp: settings.contactWhatsapp,
      email: settings.contactEmail,
      dubaiAddress: settings.officeDubai,
      indiaAddress: settings.officeIndia,
      studioHours: settings.studioHours,
    }),
    [settings],
  );
}

/**
 * Formats a price in the currency the admin chose, unless the listing carries its own.
 * Falls back to plain grouping if the code is one Intl does not know.
 */
export function formatPrice(value: number, currency: string) {
  try {
    return `${currency} ${new Intl.NumberFormat('en-AE').format(value)}`;
  } catch {
    return `${currency} ${value}`;
  }
}

/** `formatPrice` bound to the configured default currency. */
export function usePrice() {
  const { defaultCurrency } = useSiteSettings();
  return useMemo(
    () => (value: number, currency?: string) => formatPrice(value, currency?.trim() || defaultCurrency),
    [defaultCurrency],
  );
}
