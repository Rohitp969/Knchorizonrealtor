import { ContactForm, PageHero, SectionIntro, SectionBreak, SectionLabel } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';
import { optimizedImage } from '@/lib/cloudinary-image';

export function InteriorsPage() {
  const contact = useContact();
  const services = [
    {
      badge: "Curation",
      title: "Furniture curation",
      text: "Furniture selected around the property's scale, layout, purpose, and the way the space is intended to be used.",
    },
    {
      badge: "Direction",
      title: "Interior direction",
      text: "A clear visual direction for materials, finishes, lighting, furniture, and the overall character of the property.",
    },
    {
      badge: "Finishing",
      title: "Styling & finishing",
      text: "The final layer of furniture, art, objects, and styling that helps a home feel complete without feeling over-designed.",
    },
  ];

  return (
    <main className="overflow-x-clip">
      <PageHero
        label="KNC Studio · Interiors & Furniture"
        title={
          <>
            The finishing
            <SectionBreak />
            <em className="text-[#9f7a47]">touch.</em>
          </>
        }
        copy="Interior direction and furniture solutions shaped around the property, its purpose, and the people who will use it."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/dubai-apartment-living-room.jpg"
      />

      {/* INTRO / IMAGE */}
      <section className="bg-[#efeae2] site-section">
        <div className="site-container">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">

            {/* CONTROLLED IMAGE */}
            <div className="card-media card-media-wide lg:aspect-[4/3]">
              <img
                src={optimizedImage('https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/interiors/dubai-interior-styling.jpg', 1200)}
                alt="Black side table with a white ceramic vase of dried stems beside a boucle headboard"
                loading="lazy"
              />
            </div>

            {/* TEXT */}
            <div className="min-w-0">
              <SectionLabel>Interior direction</SectionLabel>

              <h2 className="section-title mt-6 max-w-xl text-[#2b3242]">
                A home should feel{" "}
                <em className="text-[#9f7a47]">collected.</em>
              </h2>

              <p className="body-copy measure mt-6 text-[#2b3242]/75">
                From a newly purchased apartment to an investment property
                being prepared for its next tenant, we help shape a clear
                interior direction that feels practical, refined, and
                appropriate to the property.
              </p>

              <p className="body-copy measure mt-4 text-[#2b3242]/75">
                The focus is not on adding more. It is on choosing the right
                pieces, proportions, materials, and finishing details for the
                space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <SectionIntro
            label="What we can shape"
            title={
              <>
                A complete point
                <SectionBreak />
                <em className="text-[#9f7a47]">of view.</em>
              </>
            }
            copy="Interior support for new homes, refreshes, and investment properties that need to feel considered and ready."
          />

          <div className="mt-12 grid border-t border-[#2b3242]/20 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.badge}
                className="border-b border-[#2b3242]/15 py-7 sm:px-6 sm:py-8 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9f7a47]">
                  {service.badge}
                </span>

                <h3 className="block-title mt-8 max-w-sm text-[#2b3242]">
                  {service.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-[#2b3242]/60">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#f2ede4] site-section">
        <div className="site-container">
          <SectionIntro
            label="Our approach"
            title={
              <>
                Less noise.
                <SectionBreak />
                <em className="text-[#9f7a47]">More intention.</em>
              </>
            }
            copy="A phased, property-first method that shapes coherent, finished spaces without unnecessary complexity."
          />

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="border-t border-[#2b3242]/20 pt-7">
              <span className="font-mono text-[11px] tracking-[0.16em] text-[#9f7a47]">
                Phase · Understand
              </span>

              <h3 className="block-title mt-4 text-[#2b3242]">
                Start with the property
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                We consider the location, layout, intended use, existing
                condition, and the overall requirement before recommending
                an interior direction.
              </p>
            </div>

            <div className="border-t border-[#2b3242]/20 pt-7">
              <span className="font-mono text-[11px] tracking-[0.16em] text-[#9f7a47]">
                Phase · Curate
              </span>

              <h3 className="block-title mt-4 text-[#2b3242]">
                Choose what belongs
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                Furniture, finishes, lighting, art, and objects are
                considered as part of one coherent visual language.
              </p>
            </div>

            <div className="border-t border-[#2b3242]/20 pt-7">
              <span className="font-mono text-[11px] tracking-[0.16em] text-[#9f7a47]">
                Phase · Complete
              </span>

              <h3 className="block-title mt-4 text-[#2b3242]">
                Prepare the space
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                The final result is a space that feels ready for living,
                presentation, leasing, or the property's next chapter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-[#ebe4d7] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          <div className="flex flex-col">
            <SectionLabel>Talk to the studio</SectionLabel>

            <h2 className="section-title mt-6 text-[#2b3242]">
              Bring us
              <SectionBreak />
              <em className="text-[#9f7a47]">the room.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#2b3242]/65">
              Tell us about the property, what you want to achieve, and the
              kind of interior support you are looking for.
            </p>

            <p className="measure-narrow mt-4 text-sm leading-7 text-[#2b3242]/60">
              Share a few details and our team can understand the requirement
              before discussing the appropriate next step.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 border-t border-[#2b3242]/20 pt-6 lg:mt-auto">
              <p className="eyebrow text-[#9f7a47]">Or speak to the studio</p>
              <a
                href={`tel:${contact.phoneHref}`}
                className="block-title text-[#2b3242] transition-colors hover:text-[#9f7a47]"
              >
                {contact.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="line-link font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-[#faf7f1] p-5 shadow-sm sm:p-8">
            <ContactForm
              compact
              inquiryType="interiors"
            />
          </div>

        </div>
      </section>
    </main>
  );
}
