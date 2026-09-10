import { PageHero, SectionLabel } from '@/components/blocks';
import { usePageMeta } from '@/lib/seo';

const sections = [
  ['Introduction', 'These terms explain the general conditions for using the KNC Horizon Realtor website. By using the website, you agree to use it lawfully and responsibly.'],
  ['Website Use', 'You may browse, save, and share links to this website for personal and lawful purposes. You must not misuse the website, interfere with its operation, or attempt to access restricted systems.'],
  ['Property Information', 'Property descriptions, images, locations, specifications, and other information are provided for general guidance. Final property details and availability should be verified directly with KNC Horizon Realtor before relying on them.'],
  ['Pricing & Availability', 'Prices, availability, payment details, and other commercial information may change without notice. Any displayed price or availability should be confirmed with the relevant KNC Horizon Realtor representative.'],
  ['Enquiries', 'Submitting an enquiry does not create an agency, brokerage, advisory, or other contractual relationship. We may contact you using the details supplied to respond to your request.'],
  ['Intellectual Property', 'Website text, branding, design, graphics, and original media belong to KNC Horizon Realtor or their respective rights holders. They may not be reproduced or reused without appropriate permission.'],
  ['Third-Party Links', 'The website may include links to third-party websites such as WhatsApp. KNC Horizon Realtor is not responsible for the content, availability, or privacy practices of external websites.'],
  ['Disclaimer', 'The website is provided for general information and does not constitute legal, financial, tax, or investment advice. Obtain independent professional advice where appropriate.'],
  ['Limitation of Liability', 'To the extent permitted by applicable law, KNC Horizon Realtor is not liable for losses arising from reliance on unverified website information, interruptions, or third-party services.'],
  ['Changes to Terms', 'These terms may be updated from time to time. The current version published on this page applies to website use after its publication.'],
  ['Contact', 'For questions about these terms, contact KNC Horizon Realtor through the website contact page or the published contact details.'],
] as const;

export function TermsPage() {
  usePageMeta('Terms & Conditions', 'General terms for using the KNC Horizon Realtor website.');
  return <main><PageHero label="Legal" title={<>Terms &<br /><em className="text-[#c97352]">conditions.</em></>} copy="General terms for using the KNC Horizon Realtor website and reviewing property information." image="/images/creek-waterfront.jpg" /><LegalContent sections={sections} /></main>;
}

const privacySections = [
  ['Information collected', 'When you contact us, we may receive the name, email address, phone number, property interest, and message you choose to submit.'],
  ['How information is used', 'We use enquiry information to respond to requests, provide property information, arrange follow-up communication, and improve how we handle website enquiries.'],
  ['Contact/enquiry forms', 'Information submitted through a form is sent to our backend and stored in the website database so the relevant team can manage and respond to the enquiry.'],
  ['Browser storage', 'The site may use essential browser storage for functions such as an admin session. No advertising or analytics system is described here.'],
  ['Data security', 'We use reasonable technical and organisational measures for the website systems. No online transmission or storage method can be guaranteed completely secure.'],
  ['Third-party services', 'The website may link to WhatsApp for direct contact. When you follow that link, the third party handles information according to its own policies.'],
  ['User rights and contact', 'You may contact KNC Horizon Realtor to ask about information submitted through the website, request correction, or ask a question about its handling, subject to applicable law.'],
] as const;

export function PrivacyPage() {
  usePageMeta('Privacy Policy', 'General privacy information for KNC Horizon Realtor website enquiries.');
  return <main><PageHero label="Legal" title={<>Privacy<br /><em className="text-[#c97352]">policy.</em></>} copy="How information submitted through the KNC Horizon Realtor website is handled." image="/images/interior-detail.jpg" /><LegalContent sections={privacySections} /></main>;
}

function LegalContent({ sections }: { sections: readonly (readonly [string, string])[] }) {
  return <section className="bg-[#f5f0e6] px-5 py-16 md:px-10 md:py-28"><div className="mx-auto max-w-4xl"><SectionLabel>Website information</SectionLabel><div className="mt-10 border-t border-[#202635]/20">{sections.map(([title, body]) => <article key={title} className="border-b border-[#202635]/15 py-7 md:py-9"><h2 className="font-serif text-3xl text-[#202635] md:text-4xl">{title}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-[#202635]/65">{body}</p></article>)}</div></div></section>;
}
