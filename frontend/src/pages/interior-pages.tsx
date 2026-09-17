import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Globe2 } from 'lucide-react';
import { Link } from 'wouter';
import { ContactForm, FaqSection, PageHero, PropertyCard, SectionIntro, SectionLabel, ServiceRow } from '@/components/blocks';
import { areas, properties, services, specialistServices } from '@/lib/site-data';
import { CONTACT } from '@/lib/contact-info';

export function AboutPage() {
  return (
    <main className="overflow-hidden">

      {/* HERO */}
      <PageHero
        label="About KNC Horizon"
        title={
          <>
            A steady point
            <br />
            in a moving city.
          </>
        }
        copy="We are an independent Dubai property advisory for people who value context, candour, and an exceptionally well-handled move."
        image="/images/creek-waterfront.jpg"
      />

      {/* OUR POINT OF VIEW */}
      <section className="bg-[#f5f0e6] px-5 py-20 sm:py-24 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <SectionLabel>Our Point of View</SectionLabel>

          <h2 className="display mt-6 max-w-4xl text-4xl leading-[0.95] text-[#202635] sm:text-5xl md:text-6xl lg:text-7xl">
            The best property advice starts with a better{" "}
            <em className="text-[#c97352]">question.</em>
          </h2>

          <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
            What does home need to make possible? What would make this
            investment resilient? Which parts of the city feel like you?
            These are the questions that shape our work — long before we
            send a listing.
          </p>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
            KNC was founded to make the Dubai property experience feel
            more human. Our clients come from everywhere, but they all want
            the same thing: someone local enough to know the detail, and
            independent enough to tell the truth.
          </p>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="Our Working Method"
            title={
              <>
                Calm is not passive.
                <br />
                <em className="text-[#c97352]">It is prepared.</em>
              </>
            }
            copy="A high-touch process, built around the detail that makes decisions feel simple."
          />

          <div className="mt-14 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-12">
            {[
              {
                step: "Discovery & Brief",
                title: "Listen before we look",
                desc: "A proper brief makes everything downstream sharper. We learn the practicals, the preferences, and the non-negotiables.",
              },
              {
                step: "Curated Analysis",
                title: "Edit with context",
                desc: "Every recommendation comes with the why: the community, the quality, the value, and the questions worth asking.",
              },
              {
                step: "Advisory to Completion",
                title: "Stay close through handover",
                desc: "Our work does not end when the offer is accepted. We keep momentum through the details, right up to the handover.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border-t border-[#202635]/20 pt-6"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                  {item.step}
                </span>

                <h3 className="mt-4 max-w-sm font-serif text-2xl leading-tight text-[#202635] md:text-3xl">
                  {item.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[#202635]/65">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR COMMITMENT */}
      <section className="bg-[#d9d2c5] px-5 py-20 text-[#202635] sm:py-24 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1100px]">
          <SectionLabel>Our Commitment</SectionLabel>

          <h2 className="display mt-6 max-w-4xl text-4xl leading-[0.94] text-[#202635] sm:text-5xl md:text-6xl lg:text-7xl">
            Useful honesty,
            <br />
            <em className="text-[#c97352]">beautifully delivered.</em>
          </h2>

          <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
            We will always tell you what we see, what we know, and what we
            would do if it were our decision. That is the foundation of trust
            — and the reason our business is built on referrals.
          </p>
        </div>
      </section>

    </main>
  );
}

export function PropertiesPage() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Villas', 'Apartments', 'Investment'];
  const filtered = filter === 'All' ? properties : properties.filter((p) => filter === 'Villas' ? p.type.toLowerCase().includes('villa') : filter === 'Apartments' ? p.type.toLowerCase().includes('penthouse') : p.price.includes('8,900'));
  return (
    <main>
      <PageHero
        label="The property edit"
        title={<>Places worth<br /><em className="text-[#c97352]">your attention.</em></>}
        copy="A considered selection of Dubai homes and opportunities, selected for their quality, position, and possibility."
        image="/images/penthouse-marina.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-wrap gap-2 border-b border-[#202635]/15 pb-6">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[.13em] transition-colors ${filter === item ? 'bg-[#202635] text-[#f5f0e6]' : 'border border-[#202635]/20 text-[#202635]/60 hover:border-[#c97352] hover:text-[#c97352]'
                  }`}
                data-testid={`button-property-filter-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} featured={false} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="display text-4xl">Nothing in this edit yet.</p>
              <button
                onClick={() => setFilter('All')}
                className="mt-5 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] line-link"
                data-testid="button-property-reset"
              >
                View the full edit
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export function ServicesPage() {
  return (
    <main className="overflow-hidden">
      {/* HERO */}
      <PageHero
        label="Our Advisory Services"
        title={
          <>
            Advice for
            <br />
            <em className="text-[#c97352]">every direction.</em>
          </>
        }
        copy="Buying, selling, renting, or investing — the route is different for everyone. The standard of care should not be."
        image="/images/interior-detail.jpg"
      />

      {/* CORE ADVISORY SERVICES */}
      <section className="bg-[#e9e4da] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="Advisory Practices"
            title={
              <>
                More than a
                <br />
                property <em className="text-[#c97352]">transaction.</em>
              </>
            }
            copy="Our role is to make the important parts clearer, and the complicated parts feel structured and held."
          />

          <div className="mt-14">
            {services.map((service) => (
              <div id={service.id} key={service.id}>
                <ServiceRow service={service} />
                <p className="max-w-2xl pb-6 pl-4 text-sm leading-6 text-[#202635]/60 md:hidden">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIST PRACTICES (DESIGN & BUILD / INTERIORS) */}
      <section className="bg-[#dfe2dc] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="Specialist Practices"
            title={
              <>
                Design & interior
                <br />
                <em className="text-[#c97352]">coordination.</em>
              </>
            }
            copy="Beyond advisory, we support clients with dedicated design, procurement, and furnishing coordination for their Dubai residences."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {specialistServices.map((specialist) => (
              <div
                key={specialist.id}
                className="group flex flex-col justify-between rounded-sm border border-[#202635]/15 bg-[#f5f0e6] p-8 shadow-xs transition-shadow hover:shadow-md md:p-10"
              >
                <div>
                  <div className="relative mb-6 h-52 w-full overflow-hidden rounded-xs bg-[#202635]">
                    <img
                      src={specialist.image}
                      alt={specialist.title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                    Specialist Practice
                  </span>
                  <h3 className="mt-2 font-serif text-3xl text-[#202635]">
                    {specialist.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#202635]/70">
                    {specialist.description}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#202635]/10">
                  <Link
                    href={specialist.href}
                    className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c97352] line-link"
                  >
                    Learn more
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN EXPECT */}
      <section className="bg-[#c6d0c9] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1380px] gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionLabel>What you can expect</SectionLabel>
            <h2 className="display mt-6 text-5xl leading-[.9] sm:text-6xl md:text-7xl">
              No noise.
              <br />
              <em className="text-[#c97352]">Just movement.</em>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#202635]/70">
              Clear commitments that guide every conversation, recommendation, and transaction we oversee.
            </p>
          </div>
          <div className="grid gap-5">
            {[
              'A dedicated senior point of contact',
              'Clear, timely communication without pushiness',
              'Independent market perspective and valuation context',
              'End-to-end care through conveyancing and completion',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 border-b border-[#202635]/20 pb-4 text-sm font-medium text-[#202635]"
              >
                <Check size={16} className="shrink-0 text-[#c97352]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQS */}
      <FaqSection compact />
    </main>
  );
}

export function DesignBuildPage() {
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
    <main className="overflow-hidden">

      {/* HERO */}
      <PageHero
        label="KNC Studio · Design & Build"
        title={
          <>
            Design that
            <br />
            <em className="text-[#c97352]">adds value.</em>
          </>
        }
        copy="A property-focused design and coordination service for clients who want their Dubai home or investment property to feel considered, practical, and ready for its next chapter."
        image="/images/interior-detail.jpg"
      />

      {/* INTRO */}
      <section className="bg-[#f5f0e6] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-[1100px]">
          <SectionLabel>
            Design & build coordination
          </SectionLabel>

          <h2 className="display mt-6 max-w-4xl text-4xl leading-[0.94] text-[#202635] sm:text-5xl md:text-6xl lg:text-7xl">
            A better property deserves
            <br />
            a better{" "}
            <em className="text-[#c97352]">
              plan.
            </em>
          </h2>

          <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
            Whether you are preparing a new home, improving a property
            before letting it, or considering how a space can work harder
            as an investment, the right decisions start with understanding
            the property and the people it needs to serve.
          </p>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
            Property decisions do not always stop at the purchase. KNC brings
            the property perspective first, helping you coordinate the design
            direction and specialist requirements that make sense for your project.
          </p>
        </div>

        {/* SERVICE CARDS */}
        <div className="mx-auto mt-16 max-w-[1380px] grid border-t border-[#202635]/20 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.badge}
              className="
                border-b
                border-[#202635]/15
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
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                {service.badge}
              </span>

              <h3 className="mt-4 max-w-xs font-serif text-2xl leading-tight text-[#202635]">
                {service.title}
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[#202635]/60">
                {service.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT CLIENTS CAN ASK FOR */}
      <section className="bg-[#e9e4da] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-[1380px]">
          <SectionIntro
            label="What we can help with"
            title={
              <>
                Start with the
                <br />
                <em className="text-[#c97352]">property.</em>
              </>
            }
            copy="Tailored coordination services designed to enhance the livability and capital value of your Dubai asset."
          />

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                Preparation
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#202635]">
                New home setup
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Planning the design direction and practical requirements for
                a newly purchased home.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                Optimization
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#202635]">
                Investment property
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Thinking through presentation, usability and improvements
                before leasing or marketing a property.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                Aesthetic
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#202635]">
                Interior direction
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Establishing a clear visual direction before engaging the
                appropriate interior or specialist team.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#c97352]">
                Delivery
              </span>
              <h3 className="mt-3 font-serif text-2xl text-[#202635]">
                Specialist coordination
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Helping connect the property requirement with the right
                specialist where additional design or build expertise is
                needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section className="bg-[#c6d0c9] px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:py-32">
        <div className="mx-auto w-full max-w-[1180px]">

          {/* HEADER */}
          <div className="max-w-3xl">
            <SectionLabel>
              Start with the brief
            </SectionLabel>

            <h2 className="display mt-6 text-5xl leading-[0.9] text-[#202635] sm:text-6xl md:text-7xl">
              Tell us about the
              <br />
              <em className="text-[#c97352]">
                property.
              </em>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
              Tell us what you have purchased, what you are planning, and what
              kind of support you need. Our team can understand the requirement
              and guide you towards the appropriate next step.
            </p>
          </div>

          {/* FORM AREA */}
          <div className="mt-12 border-t border-[#202635]/20 pt-10">

            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">

              {/* FORM INTRO */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                  Property enquiry
                </p>

                <h3 className="mt-5 max-w-sm font-serif text-3xl leading-tight text-[#202635] sm:text-4xl">
                  A considered conversation starts here.
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-6 text-[#202635]/60">
                  Share the basics and our team can follow up with the right
                  questions about your property and requirements.
                </p>
              </div>

              {/* FORM */}
              <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-8 md:p-10">
                <ContactForm
                  compact
                  inquiryType="design-build"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

export function InteriorsPage() {
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
    <main className="overflow-hidden">
      <PageHero
        label="KNC Studio · Interiors & Furniture"
        title={
          <>
            The finishing
            <br />
            <em className="text-[#c97352]">touch.</em>
          </>
        }
        copy="Interior direction and furniture solutions shaped around the property, its purpose, and the people who will use it."
        image="/images/hero-dubai-villa.jpg"
      />

      {/* INTRO / IMAGE */}
      <section className="bg-[#dfe2dc] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">

            {/* CONTROLLED IMAGE */}
            <div className="w-full">
              <div className="overflow-hidden rounded-sm bg-[#202635]/10">
                <img
                  src="/images/interior-detail.jpg"
                  alt="Contemporary Dubai interior with warm neutral materials"
                  loading="lazy"
                  className="block h-[280px] w-full object-cover object-center sm:h-[340px] md:h-[380px]"
                />
              </div>
            </div>

            {/* TEXT */}
            <div className="min-w-0">
              <SectionLabel>Interior direction</SectionLabel>

              <h2 className="display mt-6 max-w-xl text-4xl leading-[0.92] text-[#202635] sm:text-5xl md:text-6xl">
                A home should feel{" "}
                <em className="text-[#c97352]">collected.</em>
              </h2>

              <p className="mt-6 text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
                From a newly purchased apartment to an investment property
                being prepared for its next tenant, we help shape a clear
                interior direction that feels practical, refined, and
                appropriate to the property.
              </p>

              <p className="mt-4 text-base leading-relaxed text-[#202635]/75 sm:text-lg sm:leading-8">
                The focus is not on adding more. It is on choosing the right
                pieces, proportions, materials, and finishing details for the
                space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#f5f0e6] px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:py-32">
        <div className="mx-auto w-full max-w-[1280px]">
          <SectionIntro
            label="What we can shape"
            title={
              <>
                A complete point
                <br />
                <em className="text-[#c97352]">of view.</em>
              </>
            }
            copy="Interior support for new homes, refreshes, and investment properties that need to feel considered and ready."
          />

          <div className="mt-12 grid border-t border-[#202635]/20 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.badge}
                className="border-b border-[#202635]/15 py-7 sm:px-6 sm:py-8 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#c97352]">
                  {service.badge}
                </span>

                <h3 className="mt-8 max-w-sm font-serif text-2xl leading-tight text-[#202635] sm:text-3xl">
                  {service.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-[#202635]/60">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#e9e4da] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-[1280px]">
          <SectionIntro
            label="Our approach"
            title={
              <>
                Less noise.
                <br />
                <em className="text-[#c97352]">More intention.</em>
              </>
            }
            copy="A phased, property-first method that shapes coherent, finished spaces without unnecessary complexity."
          />

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="border-t border-[#202635]/20 pt-7">
              <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                Phase · Understand
              </span>

              <h3 className="mt-4 font-serif text-2xl text-[#202635] sm:text-3xl">
                Start with the property
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                We consider the location, layout, intended use, existing
                condition, and the overall requirement before recommending
                an interior direction.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-7">
              <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                Phase · Curate
              </span>

              <h3 className="mt-4 font-serif text-2xl text-[#202635] sm:text-3xl">
                Choose what belongs
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Furniture, finishes, lighting, art, and objects are
                considered as part of one coherent visual language.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-7">
              <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                Phase · Complete
              </span>

              <h3 className="mt-4 font-serif text-2xl text-[#202635] sm:text-3xl">
                Prepare the space
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                The final result is a space that feels ready for living,
                presentation, leasing, or the property's next chapter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="bg-[#c6d0c9] px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:py-32">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="max-w-3xl">
            <SectionLabel>Talk to the studio</SectionLabel>

            <h2 className="display mt-6 text-5xl leading-[0.9] text-[#202635] sm:text-6xl md:text-7xl">
              Bring us
              <br />
              <em className="text-[#c97352]">the room.</em>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
              Tell us about the property, what you want to achieve, and the
              kind of interior support you are looking for.
            </p>
          </div>

          <div className="mt-12 border-t border-[#202635]/20 pt-10">
            <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                  Interior enquiry
                </p>

                <h3 className="mt-5 max-w-sm font-serif text-3xl leading-tight text-[#202635] sm:text-4xl">
                  Let's understand the space.
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-6 text-[#202635]/60">
                  Share a few details and our team can understand the
                  requirement before discussing the appropriate next step.
                </p>
              </div>

              <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-8 md:p-10">
                <ContactForm
                  compact
                  inquiryType="interiors"
                />
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



export function AreasPage() {
  const [open, setOpen] = useState<string | null>("palm-jumeirah");

  return (
    <main className="overflow-hidden">
      <PageHero
        label="Dubai, by neighbourhood"
        title={
          <>
            Find the place
            <br />
            that feels like <em className="text-[#c97352]">you.</em>
          </>
        }
        copy="Dubai is a city of very different neighbourhoods. We help you understand each location, its character, and the property opportunities it offers."
        image="/images/creek-waterfront.jpg"
      />

      {/* AREA NOTES */}
      <section className="bg-[#f5f0e6] px-5 py-16 sm:px-8 md:px-10 md:py-24 lg:py-28">
        <div className="mx-auto w-full max-w-[1280px]">

          <div className="max-w-3xl">
            <SectionLabel>Area notes</SectionLabel>

            <h2 className="display mt-6 text-5xl leading-[0.92] text-[#202635] sm:text-6xl md:text-7xl">
              Understand Dubai
              <br />
              <em className="text-[#c97352]">by address.</em>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
              From waterfront communities and established villa
              neighbourhoods to new districts shaped by Dubai&apos;s continued
              growth, every address offers a different way of living and
              investing.
            </p>
          </div>

          {/* AREA LIST */}
          <div className="mt-14 border-t border-[#202635]/20">
            {areas.map((area) => (
              <div
                key={area.id}
                id={area.id}
                className="border-b border-[#202635]/15"
              >
                <button
                  onClick={() =>
                    setOpen(open === area.id ? null : area.id)
                  }
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
                  aria-expanded={open === area.id}
                  data-testid={`button-area-toggle-${area.id}`}
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#c97352]">
                      Dubai area
                    </span>

                    <span className="mt-2 block font-serif text-3xl leading-tight text-[#202635] transition-colors group-hover:text-[#c97352] sm:text-4xl">
                      {area.name}
                    </span>
                  </div>

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#202635]/15">
                    <ChevronDown
                      size={17}
                      className={`text-[#c97352] transition-transform duration-300 ${open === area.id ? "rotate-180" : ""
                        }`}
                    />
                  </span>
                </button>

                {open === area.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-8 pb-9 pt-1 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-16">

                      {/* IMAGE */}
                      <div className="w-full">
                        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-sm">
                          <img
                            src={area.image}
                            alt={`${area.name} Dubai`}
                            loading="lazy"
                            className="block h-[180px] w-full object-cover object-center sm:h-[195px] md:h-[215px] lg:h-[240px]"
                            data-testid={`img-area-detail-${area.id}`}
                          />
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="flex min-w-0 flex-col justify-center">
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
                          {area.descriptor}
                        </p>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
                          {area.detail}
                        </p>

                        <div className="mt-7">
                          <Link
                            href={`/properties#${area.id}`}
                            className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c97352] line-link"
                            data-testid={`link-area-properties-${area.id}`}
                          >
                            Explore properties
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* LOCAL PERSPECTIVE */}
          <div className="mt-14 max-w-3xl border-t border-[#202635]/20 pt-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              Local perspective
            </span>

            <p className="mt-3 text-base leading-relaxed text-[#202635]/70 sm:text-lg sm:leading-8">
              Choosing a Dubai property starts with choosing the right
              location. If you are unsure which community fits your
              requirements, speak with our property advisory team before
              narrowing down the options.
            </p>
          </div>
        </div>
      </section>

      {/* AREA ADVISORY CTA */}
      <section className="bg-[#c6d0c9] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-[1180px]">

          <div className="max-w-3xl">
            <SectionLabel>Need a local view?</SectionLabel>

            <h2 className="display mt-5 text-5xl leading-[0.9] text-[#202635] sm:text-6xl md:text-7xl">
              Start with the{" "}
              <em className="text-[#c97352]">right area.</em>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
              Tell us what you are looking for and our property advisory team
              can help you compare locations, property types, and suitable
              opportunities.
            </p>
          </div>

          <div className="mt-10 border-t border-[#202635]/20 pt-8">
            <div className="grid items-start gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:gap-14">

              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                  Area advisory
                </span>

                <h3 className="mt-4 max-w-sm font-serif text-3xl leading-tight text-[#202635] sm:text-4xl">
                  Let&apos;s find the right neighbourhood.
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-[#202635]/60">
                  Share your requirements and we&apos;ll help you understand
                  which Dubai locations may fit your plans.
                </p>
              </div>

              <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-7 md:p-8">
                <ContactForm compact inquiryType="area-advisory" />
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


export function ContactPage() {
  return (
    <main className="overflow-hidden">

      {/* HERO */}
      <PageHero
        label="Start a conversation"
        title={
          <>
            A good move
            <br />
            starts with a{" "}
            <em className="text-[#c97352]">hello.</em>
          </>
        }
        copy="Tell us a little about what you are looking for. We&apos;ll come back with a thoughtful next step."
        image="/images/hero-dubai-villa.jpg"
      />

      {/* CONTACT INFORMATION + FORM */}
      <section className="bg-[#f5f0e6] px-5 py-16 sm:px-8 md:px-10 md:py-24 lg:py-28">
        <div className="mx-auto w-full max-w-[1280px]">

          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">

            {/* LEFT - CONTACT DETAILS */}
            <div>
              <SectionLabel>Reach us directly</SectionLabel>

              <div className="mt-8">
                <a
                  href={`tel:${CONTACT.phoneHref}`}
                  className="block font-serif text-3xl leading-tight text-[#202635] transition-colors hover:text-[#c97352] sm:text-4xl"
                  data-testid="link-contact-page-phone"
                >
                  {CONTACT.phoneDisplay}
                </a>

                <a
                  href={`mailto:${CONTACT.email}`}
                  className="mt-3 block break-all font-mono text-[10px] uppercase tracking-[0.14em] text-[#202635]/60 transition-colors hover:text-[#c97352]"
                  data-testid="link-contact-page-email"
                >
                  {CONTACT.email}
                </a>

                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c97352] line-link"
                  data-testid="link-contact-page-whatsapp"
                >
                  WhatsApp us
                  <ArrowUpRight size={14} />
                </a>
              </div>

              {/* STUDIO HOURS */}
              <div className="mt-10 border-t border-[#202635]/15 pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#202635]/40">
                  Studio hours
                </p>

                <p className="mt-4 max-w-sm text-sm leading-7 text-[#202635]/60">
                  {CONTACT.studioHours}
                </p>
              </div>

              {/* DUBAI OFFICE */}
              <div className="mt-8 border-t border-[#202635]/15 pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
                  Dubai office
                </p>

                <div className="mt-4 flex items-start gap-3">
                  <Globe2
                    size={16}
                    className="mt-1 shrink-0 text-[#c97352]"
                  />

                  <p className="text-sm leading-7 text-[#202635]/60">
                    {CONTACT.dubaiAddress}
                  </p>
                </div>
              </div>

              {/* INDIA OFFICE */}
              <div className="mt-8 border-t border-[#202635]/15 pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
                  India office
                </p>

                <p className="mt-4 text-sm leading-7 text-[#202635]/60">
                  {CONTACT.indiaAddress}
                </p>
              </div>
            </div>

            {/* RIGHT - FORM */}
            <div>
              <div className="mb-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                  Property enquiry
                </span>

                <h2 className="mt-4 font-serif text-3xl leading-tight text-[#202635] sm:text-4xl">
                  Tell us what you&apos;re looking for.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#202635]/60">
                  Whether you are buying, selling, investing, or simply
                  exploring Dubai property, share a few details and our team
                  will get back to you.
                </p>
              </div>

              <div className="rounded-sm bg-[#e9e4da] p-5 shadow-sm sm:p-8 md:p-10">
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM CONTACT STRIP */}
      <section className="bg-[#c6d0c9] px-5 py-14 sm:px-8 md:px-10 md:py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 md:grid-cols-3 md:gap-10">

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              Dubai
            </span>
            <p className="mt-3 font-serif text-2xl text-[#202635]">
              Property advisory
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              India
            </span>
            <p className="mt-3 font-serif text-2xl text-[#202635]">
              DLF Phase 1, Gurugram
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              Speak with us
            </span>

            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="mt-3 block font-serif text-2xl text-[#202635] transition-colors hover:text-[#c97352]"
            >
              {CONTACT.phoneDisplay}
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}

