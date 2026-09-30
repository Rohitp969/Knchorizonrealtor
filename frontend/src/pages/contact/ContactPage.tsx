import { ArrowUpRight, Globe2 } from 'lucide-react';
import { ContactForm, PageHero, SectionLabel, SectionBreak } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';

export function ContactPage() {
  const contact = useContact();
  return (
    <main className="overflow-x-clip">

      {/* HERO */}
      <PageHero
        label="Start a conversation"
        title={
          <>
            A good move
            <SectionBreak />
            starts with a{" "}
            <em className="text-[#9f7a47]">hello.</em>
          </>
        }
        copy="Tell us a little about what you are looking for. We&apos;ll come back with a thoughtful next step."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jlt-towers-sheikh-zayed-road.jpg"
      />

      {/* CONTACT INFORMATION + FORM */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-20">

            {/* LEFT - CONTACT DETAILS */}
            <div>
              <SectionLabel>Reach us directly</SectionLabel>

              <div className="mt-8">
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="block-title block text-[#2b3242] transition-colors hover:text-[#9f7a47]"
                  data-testid="link-contact-page-phone"
                >
                  {contact.phoneDisplay}
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="mt-3 block break-all font-mono text-[11px] uppercase tracking-[0.14em] text-[#2b3242]/60 transition-colors hover:text-[#9f7a47]"
                  data-testid="link-contact-page-email"
                >
                  {contact.email}
                </a>

                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#9f7a47] line-link"
                  data-testid="link-contact-page-whatsapp"
                >
                  WhatsApp us
                  <ArrowUpRight size={14} />
                </a>
              </div>

              {/* STUDIO HOURS */}
              <div className="mt-10 border-t border-[#2b3242]/15 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#2b3242]/60">
                  Studio hours
                </p>

                <p className="mt-4 max-w-sm text-sm leading-7 text-[#2b3242]/60">
                  {contact.studioHours}
                </p>
              </div>

              {/* DUBAI OFFICE */}
              <div className="mt-8 border-t border-[#2b3242]/15 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9f7a47]">
                  Dubai office
                </p>

                <div className="mt-4 flex items-start gap-3">
                  <Globe2
                    size={16}
                    className="mt-1 shrink-0 text-[#9f7a47]"
                  />

                  <p className="text-sm leading-7 text-[#2b3242]/60">
                    {contact.dubaiAddress}
                  </p>
                </div>
              </div>

              {/* INDIA OFFICE */}
              <div className="mt-8 border-t border-[#2b3242]/15 pt-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9f7a47]">
                  India office
                </p>

                <p className="mt-4 text-sm leading-7 text-[#2b3242]/60">
                  {contact.indiaAddress}
                </p>
              </div>
            </div>

            {/* RIGHT - FORM */}
            <div>
              <div className="mb-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                  Property enquiry
                </span>

                <h2 className="block-title mt-4 text-[#2b3242]">
                  Tell us what you&apos;re looking for.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#2b3242]/60">
                  Whether you are buying, selling, investing, or simply
                  exploring Dubai property, share a few details and our team
                  will get back to you.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f2ede4] p-5 shadow-sm sm:p-8">
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM CONTACT STRIP */}
      <section className="site-section site-section-compact bg-[#ebe4d7]">
        <div className="site-container grid gap-8 sm:grid-cols-3 sm:gap-10">

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9f7a47]">
              Dubai
            </span>
            <p className="card-title mt-3 text-[#2b3242]">
              Property advisory
            </p>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9f7a47]">
              India
            </span>
            <p className="card-title mt-3 text-[#2b3242]">
              DLF Phase 1, Gurugram
            </p>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9f7a47]">
              Speak with us
            </span>

            <a
              href={`tel:${contact.phoneHref}`}
              className="card-title mt-3 block text-[#2b3242] transition-colors hover:text-[#9f7a47]"
            >
              {contact.phoneDisplay}
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}
