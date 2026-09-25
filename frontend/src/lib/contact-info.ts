/**
 * Company contact information — update these values to update the entire site.
 *
 * Every phone number, WhatsApp link, and email on the website reads
 * from this single file. Update the values below once, and the whole
 * site (navbar, footer, contact page, WhatsApp bubble, property pages)
 * updates automatically. Nothing else in the code needs to change.
 */
export const CONTACT = {
  // Shown to visitors, e.g. "+971 58 514 1770"
  phoneDisplay: '+971 58 514 1770',
  // Used in tel: links — digits only, with country code, no spaces
  phoneHref: '+971585141770',
  // WhatsApp number — digits only, with country code, no + or spaces
  whatsapp: '971585141770',
  email: 'hello@knchorizonrealtor.com',
  dubaiAddress: 'Dubai, UAE',
  indiaAddress: 'DLF Phase 1, Gurugram, Haryana, India',
  studioHours: 'Monday — Saturday, 09:00 — 18:00 GST',
};

/*
 * Social profiles.
 * Each of these opens its network when clicked. Instagram goes to KNC's own account; the
 * others still point at the network itself until KNC's handles are added — swap in the full
 * profile URL and the same icon goes straight to the account, with nothing else to change:
 *
 *   linkedin: 'https://www.linkedin.com/company/<handle>/',
 *
 * Set a value to an empty string to drop that icon from the footer altogether. WhatsApp and
 * email are built from the number and address above, so they are always there.
 */
export const SOCIAL = {
  instagram: 'https://www.instagram.com/knchorizonllc/',
  facebook: '',
  x: 'https://x.com/',
  linkedin: 'https://www.linkedin.com/',
  youtube: '',
  tiktok: '',
};
