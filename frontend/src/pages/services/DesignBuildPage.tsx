import { ContactForm, PageHero, SectionIntro, SectionLabel } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';

export function DesignBuildPage() {
  const contact = useContact();
  const services = [
    {
      badge: "Planning",
      title: "Property-led planning",
      text: "We start with the property itself — its layout, location, intended use, and the improvements that can make the space work better.",
    },
    {
      badge: "Direction",
      title: "Design direction",
      text: "For clients who need help shaping the look and feel of a home or investment property, we help define a clear design direction.",
    },
    {
      badge: "Coordination",
      title: "Professional coordination",
      text: "Where specialist design or build work is required, we can help coordinate the next step with the appropriate professionals, subject to the scope of the project.",
    },
    {
      badge: "Advisory",
      title: "Investment-focused decisions",
      text: "For investment properties, we keep the focus on practical improvements, presentation, usability, and the property's intended market.",
    },
  ];

  return (
    <main className="overflow-x-clip">

      {/* HERO */}
      <PageHero
        label="KNC Studio · Design & Build"
        title={
          <>
            Design that
            <br />
            <em className="text-[#9f7a47]">adds value.</em>
          </>
        }
        copy="A property-focused design and coordination service for clients who want their Dubai home or investment property to feel considered, practical, and ready for its next chapter."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577270/knc-horizon/hero/dubai-hills-construction.jpg"
      />

      {/* INTRO */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <SectionLabel>
            Design & build coordination
          </SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#2b3242]">
            A better property deserves
            <br />
            a better{" "}
            <em className="text-[#9f7a47]">
              plan.
            </em>
          </h2>

          <p className="body-copy measure mt-8 text-[#2b3242]/75">
            Whether you are preparing a new home, improving a property
            before letting it, or considering how a space can work harder
            as an investment, the right decisions start with understanding
            the property and the people it needs to serve.
          </p>

          <p className="body-copy measure mt-5 text-[#2b3242]/75">
            Property decisions do not always stop at the purchase. KNC brings
            the property perspective first, helping you coordinate the design
            direction and specialist requirements that make sense for your project.
          </p>
        </div>

        {/* SERVICE CARDS */}
        <div className="site-container mt-12 grid border-t border-[#2b3242]/20 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.badge}
              className="
                border-b
                border-[#2b3242]/15
                px-0
                py-7
                sm:px-6
                sm:py-8
                lg:border-b-0
                lg:border-r
                lg:first:pl-0
                lg:last:border-r-0
                lg:last:pr-0
              "
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                {service.badge}
              </span>

              <h3 className="block-title mt-4 max-w-xs text-[#2b3242]">
                {service.title}
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[#2b3242]/60">
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT CLIENTS CAN ASK FOR */}
      <section className="bg-[#f2ede4] site-section">
        <div className="site-container">
          <SectionIntro
            label="What we can help with"
            title={
              <>
                Start with the
                <br />
                <em className="text-[#9f7a47]">property.</em>
              </>
            }
            copy="Tailored coordination services designed to enhance the livability and capital value of your Dubai asset."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-[#2b3242]/20 pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                Preparation
              </span>
              <h3 className="block-title mt-3 text-[#2b3242]">
                New home setup
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                Planning the design direction and practical requirements for
                a newly purchased home.
              </p>
            </div>

            <div className="border-t border-[#2b3242]/20 pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                Optimization
              </span>
              <h3 className="block-title mt-3 text-[#2b3242]">
                Investment property
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                Thinking through presentation, usability and improvements
                before leasing or marketing a property.
              </p>
            </div>

            <div className="border-t border-[#2b3242]/20 pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                Aesthetic
              </span>
              <h3 className="block-title mt-3 text-[#2b3242]">
                Interior direction
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                Establishing a clear visual direction before engaging the
                appropriate interior or specialist team.
              </p>
            </div>

            <div className="border-t border-[#2b3242]/20 pt-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                Delivery
              </span>
              <h3 className="block-title mt-3 text-[#2b3242]">
                Specialist coordination
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#2b3242]/65">
                Helping connect the property requirement with the right
                specialist where additional design or build expertise is
                needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section className="bg-[#ebe4d7] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          {/* BRIEF */}
          <div className="flex flex-col">
            <SectionLabel>
              Start with the brief
            </SectionLabel>

            <h2 className="section-title mt-6 text-[#2b3242]">
              Tell us about the
              <br />
              <em className="text-[#9f7a47]">
                property.
              </em>
            </h2>

            <p className="body-copy measure mt-6 text-[#2b3242]/65">
              Tell us what you have purchased, what you are planning, and what
              kind of support you need. Our team can understand the requirement
              and guide you towards the appropriate next step.
            </p>

            <p className="measure-narrow mt-4 text-sm leading-7 text-[#2b3242]/60">
              Share the basics and our team can follow up with the right
              questions about your property and requirements.
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

          {/* FORM */}
          <div className="w-full rounded-2xl bg-[#faf7f1] p-5 shadow-sm sm:p-8">
            <ContactForm
              compact
              inquiryType="design-build"
            />
          </div>

        </div>
      </section>

    </main>
  );
}
