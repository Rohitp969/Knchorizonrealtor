import { Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { ContactForm, PageHero, SectionIntro, SectionBreak, SectionLabel } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';

/* ============================================================
   INDIA OFFICE PAGE
============================================================ */
export function IndiaOfficePage() {
  const contact = useContact();
  const benefits = [
    {
      title: 'In-Person Consultations in Delhi NCR',
      description: 'Meet our advisory leadership face-to-face at DLF Phase 1, Gurugram to review master plans, floor layouts, and live developer allocations before traveling.',
    },
    {
      title: 'RBI LRS & FEMA Compliance',
      description: 'Clear guidance on structuring capital transfers under the Reserve Bank of India’s Liberalised Remittance Scheme (LRS) up to USD 250,000 per financial year per individual.',
    },
    {
      title: 'UAE Golden Visa Direct Pathways',
      description: 'Comprehensive assistance securing the renewable 10-Year UAE Golden Visa through qualifying property acquisitions of AED 2,000,000 or above for investors and families.',
    },
    {
      title: 'Direct Master Developer Portfolios',
      description: 'Direct institutional access to prime developments from Emaar, Sobha, Meraas, Nakheel, Omniyat, and Ellington without third-party markups.',
    },
    {
      title: 'Remote Digital Transactions & Escrow Security',
      description: 'Execute reservations, DLD escrow-linked deposits, and title trustee processes securely and legally from your office or home in India.',
    },
    {
      title: 'Dual-City Post-Handover Management',
      description: 'Continuous asset care: in-person reviews in Gurugram paired with on-the-ground snagging inspections, leasing coordination, and rental collection in Dubai.',
    },
  ];

  return (
    <main className="overflow-x-clip">
      <PageHero
        label="India Advisory Desk · Gurugram"
        title={
          <>
            Connecting India to
            <SectionBreak />
            <em className="text-[#9f7a47]">prime Dubai real estate.</em>
          </>
        }
        copy="Dedicated, local advisory for Indian business families, NRIs, and global investors seeking high-calibre residential and investment property in Dubai."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577272/knc-horizon/hero/gurugram-skyline.jpg"
      />

      {/* OVERVIEW */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <SectionLabel>Local Presence, International Reach</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#2b3242]">
            A trusted bridge between{' '}
            <em className="text-[#9f7a47]">India and Dubai.</em>
          </h2>

          <div className="body-copy measure mt-10 space-y-6 text-[#2b3242]/75">
            <p>
              For Indian residents and global NRI investors, Dubai represents one of the world’s most accessible, tax-efficient, and currency-stable real estate environments. However, cross-border property transactions require accurate regulatory context, reliable due diligence, and dedicated post-purchase coordination.
            </p>
            <p>
              Our India Office in DLF Phase 1, Gurugram provides you with direct personal access to experienced advisors who understand both Indian regulatory nuances (FEMA, LRS, repatriation) and the ground reality of Dubai’s property landscape.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES FOR INDIAN INVESTORS */}
      <section className="bg-[#efeae2] site-section">
        <div className="site-container">
          <SectionIntro
            label="Cross-Border Services"
            title={
              <>
                Tailored solutions for
                <SectionBreak />
                <em className="text-[#9f7a47]">Indian & NRI clients.</em>
              </>
            }
            copy="Every step of the acquisition process is handled with complete regulatory compliance and transparent communication."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#2b3242]/15 bg-[#faf7f1] p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-[#8f6d3f] text-[#fffdf8]">
                  <Check size={20} />
                </div>
                <h3 className="block-title mt-6 text-[#2b3242]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#2b3242]/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICE DETAILS & CONSULTATION FORM */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-20">
          <div>
            <SectionLabel>India Office</SectionLabel>

            <h2 className="section-title mt-6 text-[#2b3242]">
              Meet our team in{' '}
              <em className="text-[#9f7a47]">Gurugram.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#2b3242]/70">
              Schedule an in-person advisory meeting at our Gurugram desk or request a private video consultation with our senior UAE team.
            </p>

            <div className="mt-8 space-y-6 rounded-2xl border border-[#2b3242]/15 bg-[#f2ede4] p-6 sm:p-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">Address</span>
                <p className="card-title mt-2 text-[#2b3242]">DLF Phase 1, Gurugram</p>
                <p className="text-xs text-[#2b3242]/60">Haryana, India</p>
              </div>

              <div className="border-t border-[#2b3242]/15 pt-6">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">Direct Contact</span>
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="card-title mt-2 block text-[#2b3242] transition-colors hover:text-[#9f7a47]"
                >
                  {contact.phoneDisplay}
                </a>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#17753f] hover:underline"
                >
                  <FaWhatsapp size={15} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">Enquiry Form</span>
              <h3 className="block-title mt-2 text-[#2b3242]">Request an India Desk Consultation</h3>
            </div>
            <div className="rounded-2xl bg-[#f2ede4] p-5 shadow-sm sm:p-8">
              <ContactForm inquiryType="india-office" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
