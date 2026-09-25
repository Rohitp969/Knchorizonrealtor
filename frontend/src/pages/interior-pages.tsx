import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Building2, Check, ChevronDown, Coins, Compass, Globe2, Landmark, MapPin, Phone, ShieldCheck, TrendingUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'wouter';
import { ContactForm, FaqSection, PageHero, PropertyCard, SectionIntro, SectionLabel, ServiceRow, cardGrid } from '@/components/blocks';
import { areas, properties, services, specialistServices } from '@/lib/site-data';
import { useContact } from '@/lib/site-settings';
import { apiFetch, type Project, type RemoteProperty } from '@/lib/api';

export function AboutPage() {
  return (
    <main className="overflow-x-clip">

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
        image="/images/dubai-skyline-creek-sunset.jpg"
      />

      {/* OUR POINT OF VIEW */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionLabel>Our Point of View</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#202635]">
            The best property advice starts with a better{" "}
            <em className="text-[#c97352]">question.</em>
          </h2>

          <p className="body-copy measure mt-8 text-[#202635]/75">
            What does home need to make possible? What would make this
            investment resilient? Which parts of the city feel like you?
            These are the questions that shape our work — long before we
            send a listing.
          </p>

          <p className="body-copy measure mt-5 text-[#202635]/75">
            KNC was founded to make the Dubai property experience feel
            more human. Our clients come from everywhere, but they all want
            the same thing: someone local enough to know the detail, and
            independent enough to tell the truth.
          </p>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-[#e9e4da] site-section">
        <div className="site-container">
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

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
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
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                  {item.step}
                </span>

                <h3 className="block-title mt-4 max-w-sm text-[#202635]">
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
      <section className="bg-[#d9d2c5] site-section text-[#202635]">
        <div className="site-container">
          <SectionLabel>Our Commitment</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#202635]">
            Useful honesty,
            <br />
            <em className="text-[#c97352]">beautifully delivered.</em>
          </h2>

          <p className="body-copy measure mt-8 text-[#202635]/75">
            We will always tell you what we see, what we know, and what we
            would do if it were our decision. That is the foundation of trust
            — and the reason our business is built on referrals.
          </p>

          <div className="btn-row mt-10">
            <Link href="/contact" className="btn btn-primary" data-testid="link-about-contact">
              Start a conversation <ArrowUpRight size={14} />
            </Link>
            <Link href="/about/approach" className="btn btn-secondary" data-testid="link-about-approach">
              Our approach <ArrowUpRight size={14} />
            </Link>
          </div>
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
        image="/images/downtown-safa-park.jpg"
      />
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
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
          <div className={`mt-12 ${cardGrid(filtered.length)}`}>
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} featured={false} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="block-title text-[#202635]">Nothing in this edit yet.</p>
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
    <main className="overflow-x-clip">
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
        image="/images/dubai-skyline-golf-course.jpg"
      />

      {/* CORE ADVISORY SERVICES */}
      <section className="bg-[#e9e4da] site-section">
        <div className="site-container">
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

          <div className="mt-12">
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
      <section className="bg-[#dfe2dc] site-section">
        <div className="site-container">
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

          <div className={`mt-12 ${cardGrid(specialistServices.length)}`}>
            {specialistServices.map((specialist) => (
              <div
                key={specialist.id}
                className="card-editorial group flex h-full flex-col justify-between p-5"
              >
                <div>
                  <div className="card-media mb-6">
                    <img
                      src={specialist.image}
                      alt={specialist.title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                    Specialist Practice
                  </span>
                  <h3 className="block-title mt-2 text-[#202635]">
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
      <section className="bg-[#c6d0c9] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionLabel>What you can expect</SectionLabel>
            <h2 className="section-title mt-6">
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
            <em className="text-[#c97352]">adds value.</em>
          </>
        }
        copy="A property-focused design and coordination service for clients who want their Dubai home or investment property to feel considered, practical, and ready for its next chapter."
        image="/images/dubai-hills-construction.jpg"
      />

      {/* INTRO */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionLabel>
            Design & build coordination
          </SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#202635]">
            A better property deserves
            <br />
            a better{" "}
            <em className="text-[#c97352]">
              plan.
            </em>
          </h2>

          <p className="body-copy measure mt-8 text-[#202635]/75">
            Whether you are preparing a new home, improving a property
            before letting it, or considering how a space can work harder
            as an investment, the right decisions start with understanding
            the property and the people it needs to serve.
          </p>

          <p className="body-copy measure mt-5 text-[#202635]/75">
            Property decisions do not always stop at the purchase. KNC brings
            the property perspective first, helping you coordinate the design
            direction and specialist requirements that make sense for your project.
          </p>
        </div>

        {/* SERVICE CARDS */}
        <div className="site-container mt-12 grid border-t border-[#202635]/20 sm:grid-cols-2 lg:grid-cols-4">
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
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                {service.badge}
              </span>

              <h3 className="block-title mt-4 max-w-xs text-[#202635]">
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
      <section className="bg-[#e9e4da] site-section">
        <div className="site-container">
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

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                Preparation
              </span>
              <h3 className="block-title mt-3 text-[#202635]">
                New home setup
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Planning the design direction and practical requirements for
                a newly purchased home.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                Optimization
              </span>
              <h3 className="block-title mt-3 text-[#202635]">
                Investment property
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Thinking through presentation, usability and improvements
                before leasing or marketing a property.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                Aesthetic
              </span>
              <h3 className="block-title mt-3 text-[#202635]">
                Interior direction
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/65">
                Establishing a clear visual direction before engaging the
                appropriate interior or specialist team.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                Delivery
              </span>
              <h3 className="block-title mt-3 text-[#202635]">
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
      <section className="bg-[#c6d0c9] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          {/* BRIEF */}
          <div className="flex flex-col">
            <SectionLabel>
              Start with the brief
            </SectionLabel>

            <h2 className="section-title mt-6 text-[#202635]">
              Tell us about the
              <br />
              <em className="text-[#c97352]">
                property.
              </em>
            </h2>

            <p className="body-copy measure mt-6 text-[#202635]/65">
              Tell us what you have purchased, what you are planning, and what
              kind of support you need. Our team can understand the requirement
              and guide you towards the appropriate next step.
            </p>

            <p className="measure-narrow mt-4 text-sm leading-7 text-[#202635]/60">
              Share the basics and our team can follow up with the right
              questions about your property and requirements.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 border-t border-[#202635]/20 pt-6 lg:mt-auto">
              <p className="eyebrow text-[#c97352]">Or speak to the studio</p>
              <a
                href={`tel:${contact.phoneHref}`}
                className="block-title text-[#202635] transition-colors hover:text-[#c97352]"
              >
                {contact.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="line-link font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* FORM */}
          <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-8">
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
            <br />
            <em className="text-[#c97352]">touch.</em>
          </>
        }
        copy="Interior direction and furniture solutions shaped around the property, its purpose, and the people who will use it."
        image="/images/dubai-apartment-living-room.jpg"
      />

      {/* INTRO / IMAGE */}
      <section className="bg-[#dfe2dc] site-section">
        <div className="site-container">
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">

            {/* CONTROLLED IMAGE */}
            <div className="card-media card-media-wide lg:aspect-[4/3]">
              <img
                src="/images/dubai-interior-styling.jpg"
                alt="Black side table with a white ceramic vase of dried stems beside a boucle headboard"
                loading="lazy"
              />
            </div>

            {/* TEXT */}
            <div className="min-w-0">
              <SectionLabel>Interior direction</SectionLabel>

              <h2 className="section-title mt-6 max-w-xl text-[#202635]">
                A home should feel{" "}
                <em className="text-[#c97352]">collected.</em>
              </h2>

              <p className="body-copy measure mt-6 text-[#202635]/75">
                From a newly purchased apartment to an investment property
                being prepared for its next tenant, we help shape a clear
                interior direction that feels practical, refined, and
                appropriate to the property.
              </p>

              <p className="body-copy measure mt-4 text-[#202635]/75">
                The focus is not on adding more. It is on choosing the right
                pieces, proportions, materials, and finishing details for the
                space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
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

                <h3 className="block-title mt-8 max-w-sm text-[#202635]">
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
      <section className="bg-[#e9e4da] site-section">
        <div className="site-container">
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

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="border-t border-[#202635]/20 pt-7">
              <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                Phase · Understand
              </span>

              <h3 className="block-title mt-4 text-[#202635]">
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

              <h3 className="block-title mt-4 text-[#202635]">
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

              <h3 className="block-title mt-4 text-[#202635]">
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
      <section className="bg-[#c6d0c9] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          <div className="flex flex-col">
            <SectionLabel>Talk to the studio</SectionLabel>

            <h2 className="section-title mt-6 text-[#202635]">
              Bring us
              <br />
              <em className="text-[#c97352]">the room.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#202635]/65">
              Tell us about the property, what you want to achieve, and the
              kind of interior support you are looking for.
            </p>

            <p className="measure-narrow mt-4 text-sm leading-7 text-[#202635]/60">
              Share a few details and our team can understand the requirement
              before discussing the appropriate next step.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 border-t border-[#202635]/20 pt-6 lg:mt-auto">
              <p className="eyebrow text-[#c97352]">Or speak to the studio</p>
              <a
                href={`tel:${contact.phoneHref}`}
                className="block-title text-[#202635] transition-colors hover:text-[#c97352]"
              >
                {contact.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="line-link font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-8">
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



export function AreasPage() {
  const contact = useContact();
  // Live stock per community, so a card says what is actually behind it before it is opened.
  const [counts, setCounts] = useState<Record<string, { properties: number; projects: number }>>({});
  useEffect(() => {
    let live = true;
    Promise.all([
      apiFetch<{ properties: RemoteProperty[] }>('/public/properties?limit=50').catch(() => ({ properties: [] as RemoteProperty[] })),
      apiFetch<{ projects: Project[] }>('/public/projects').catch(() => ({ projects: [] as Project[] })),
    ]).then(([p, j]) => {
      if (!live) return;
      const next: Record<string, { properties: number; projects: number }> = {};
      for (const area of areas) {
        const is = (value: string) => value.trim().toLowerCase() === area.name.toLowerCase();
        next[area.id] = {
          properties: (p.properties ?? []).filter((item) => is(item.community ?? '') || (item.location ?? '').split(',').some(is)).length,
          projects: (j.projects ?? []).filter((item) => is(item.location ?? '')).length,
        };
      }
      setCounts(next);
    });
    return () => { live = false; };
  }, []);


  return (
    <main className="overflow-x-clip">
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
        image="/images/marina-resort-greens.jpg"
      />

      {/* AREA NOTES */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">

          <div className="max-w-3xl">
            <SectionLabel>Area notes</SectionLabel>

            <h2 className="section-title mt-6 text-[#202635]">
              Understand Dubai
              <br />
              <em className="text-[#c97352]">by address.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#202635]/65">
              From waterfront communities and established villa
              neighbourhoods to new districts shaped by Dubai&apos;s continued
              growth, every address offers a different way of living and
              investing.
            </p>
          </div>

          {/* AREA GRID — one card per community, identical media ratio and CTA */}
          <div className={`mt-12 ${cardGrid(areas.length)}`}>
            {areas.map((area) => (
              <article
                key={area.id}
                id={area.id}
                className="card-editorial group scroll-mt-28 p-5"
                data-testid={`card-community-${area.id}`}
              >
                <div className="card-media image-reveal">
                  <img
                    src={area.image}
                    alt={`${area.name}, Dubai`}
                    loading="lazy"
                    className="transition-transform duration-700 group-hover:scale-105"
                    data-testid={`img-area-detail-${area.id}`}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="eyebrow text-[#c97352]">{area.descriptor}</p>
                  {counts[area.id] && (
                    <p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#202635]/45" data-testid={`text-area-count-${area.id}`}>
                      {counts[area.id].properties + counts[area.id].projects === 0
                        ? 'By request'
                        : [
                            counts[area.id].properties && `${counts[area.id].properties} ${counts[area.id].properties === 1 ? 'property' : 'properties'}`,
                            counts[area.id].projects && `${counts[area.id].projects} off-plan`,
                          ].filter(Boolean).join(' \u00b7 ')}
                    </p>
                  )}
                </div>
                <h3 className="card-title mt-2">{area.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#202635]/65">{area.detail}</p>

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#202635]/12 pt-4">
                  <Link
                    href={`/communities/${area.id}`}
                    className="line-link inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
                    data-testid={`link-area-properties-${area.id}`}
                  >
                    View community <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href="/contact"
                    className="line-link font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/55"
                  >
                    Ask an advisor
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* LOCAL PERSPECTIVE */}
          <div className="measure mt-14 border-t border-[#202635]/20 pt-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              Local perspective
            </span>

            <p className="body-copy measure mt-3 text-[#202635]/70">
              Choosing a Dubai property starts with choosing the right
              location. If you are unsure which community fits your
              requirements, speak with our property advisory team before
              narrowing down the options.
            </p>
          </div>
        </div>
      </section>

      {/* AREA ADVISORY CTA */}
      <section className="bg-[#c6d0c9] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          <div className="flex flex-col">
            <SectionLabel>Need a local view?</SectionLabel>

            <h2 className="section-title mt-6 text-[#202635]">
              Start with the{" "}
              <em className="text-[#c97352]">right area.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#202635]/65">
              Tell us what you are looking for and our property advisory team
              can help you compare locations, property types, and suitable
              opportunities.
            </p>

            <p className="measure-narrow mt-4 text-sm leading-7 text-[#202635]/60">
              Share your requirements and we&apos;ll help you understand which
              Dubai locations may fit your plans, and what is realistic in each
              of them.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 border-t border-[#202635]/20 pt-6 lg:mt-auto">
              <p className="eyebrow text-[#c97352]">Or speak to an advisor</p>
              <a
                href={`tel:${contact.phoneHref}`}
                className="block-title text-[#202635] transition-colors hover:text-[#c97352]"
              >
                {contact.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="line-link font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-8">
            <ContactForm compact inquiryType="area-advisory" />
          </div>

        </div>
      </section>
    </main>
  );
}


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
            <br />
            starts with a{" "}
            <em className="text-[#c97352]">hello.</em>
          </>
        }
        copy="Tell us a little about what you are looking for. We&apos;ll come back with a thoughtful next step."
        image="/images/jlt-towers-sheikh-zayed-road.jpg"
      />

      {/* CONTACT INFORMATION + FORM */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-20">

            {/* LEFT - CONTACT DETAILS */}
            <div>
              <SectionLabel>Reach us directly</SectionLabel>

              <div className="mt-8">
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="block-title block text-[#202635] transition-colors hover:text-[#c97352]"
                  data-testid="link-contact-page-phone"
                >
                  {contact.phoneDisplay}
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="mt-3 block break-all font-mono text-[10px] uppercase tracking-[0.14em] text-[#202635]/60 transition-colors hover:text-[#c97352]"
                  data-testid="link-contact-page-email"
                >
                  {contact.email}
                </a>

                <a
                  href={`https://wa.me/${contact.whatsapp}`}
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
                  {contact.studioHours}
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
                    {contact.dubaiAddress}
                  </p>
                </div>
              </div>

              {/* INDIA OFFICE */}
              <div className="mt-8 border-t border-[#202635]/15 pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
                  India office
                </p>

                <p className="mt-4 text-sm leading-7 text-[#202635]/60">
                  {contact.indiaAddress}
                </p>
              </div>
            </div>

            {/* RIGHT - FORM */}
            <div>
              <div className="mb-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">
                  Property enquiry
                </span>

                <h2 className="block-title mt-4 text-[#202635]">
                  Tell us what you&apos;re looking for.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#202635]/60">
                  Whether you are buying, selling, investing, or simply
                  exploring Dubai property, share a few details and our team
                  will get back to you.
                </p>
              </div>

              <div className="rounded-sm bg-[#e9e4da] p-5 shadow-sm sm:p-8">
                <ContactForm />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM CONTACT STRIP */}
      <section className="site-section site-section-compact bg-[#c6d0c9]">
        <div className="site-container grid gap-8 sm:grid-cols-3 sm:gap-10">

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              Dubai
            </span>
            <p className="card-title mt-3 text-[#202635]">
              Property advisory
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              India
            </span>
            <p className="card-title mt-3 text-[#202635]">
              DLF Phase 1, Gurugram
            </p>
          </div>

          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
              Speak with us
            </span>

            <a
              href={`tel:${contact.phoneHref}`}
              className="card-title mt-3 block text-[#202635] transition-colors hover:text-[#c97352]"
            >
              {contact.phoneDisplay}
            </a>
          </div>

        </div>
      </section>

    </main>
  );
}

/* ============================================================
   COMMUNITIES PAGE (ALIAS OF AREAS WITH SPECIALIZED TITLE)
============================================================ */
export const CommunitiesPage = AreasPage;

/* ============================================================
   OUR APPROACH PAGE
============================================================ */
export function AboutApproachPage() {
  const contact = useContact();
  const pillars = [
    {
      icon: Compass,
      title: 'Discovery & Requirement Scoping',
      description: 'We begin by understanding the lifestyle horizons, investment benchmarks, and holding timelines that matter to you. Real advisory begins with listening, not pushing inventory.',
    },
    {
      icon: ShieldCheck,
      title: 'Independent Due Diligence',
      description: 'Every project and title deed is cross-referenced against Dubai Land Department records, developer construction milestones, service charge models, and historical resale velocity.',
    },
    {
      icon: Landmark,
      title: 'Structured Acquisition & Terms',
      description: 'Whether buying directly from a master developer or negotiating private resales, we protect your interests through transparent conveyancing, escrow verification, and milestone alignment.',
    },
    {
      icon: Building2,
      title: 'Handover & Ongoing Asset Care',
      description: 'Our engagement continues through professional snagging inspections, key handover, utility registrations, and seamless transition to tenant leasing or interior styling coordination.',
    },
  ];

  return (
    <main className="overflow-x-clip">
      <PageHero
        label="Our Advisory Method"
        title={
          <>
            Calm is not passive.
            <br />
            <em className="text-[#c97352]">It is prepared.</em>
          </>
        }
        copy="A disciplined, transparent advisory practice shaped around the reality of Dubai real estate. No pressure, no developer bias — just considered guidance at every turn."
        image="/images/al-fahidi-wind-towers.jpg"
      />

      {/* CORE PHILOSOPHY */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionLabel>Core Philosophy</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#202635]">
            The standard of care should match the magnitude of the{' '}
            <em className="text-[#c97352]">decision.</em>
          </h2>

          <div className="body-copy measure mt-10 space-y-6 text-[#202635]/75">
            <p>
              In a fast-moving market like Dubai, speed is often confused with competence. We take the contrary view: that the best property moves are made with deliberation, contextual analysis, and an honest reading of both upside and downside.
            </p>
            <p>
              KNC Horizon Realtor was built to provide clients with a trusted, independent sounding board. We maintain direct relationships with Dubai’s leading master developers, yet our allegiance remains exclusively with the client we advise.
            </p>
          </div>
        </div>
      </section>

      {/* ADVISORY PILLARS */}
      <section className="bg-[#e9e4da] site-section">
        <div className="site-container">
          <SectionIntro
            label="Structured Process"
            title={
              <>
                Four phases of
                <br />
                <em className="text-[#c97352]">considered advisory.</em>
              </>
            }
            copy="From initial consultation through to post-handover asset management, our process ensures total clarity and legal security."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-sm border border-[#202635]/15 bg-[#f5f0e6] p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-[#202635] text-[#d9c6a4]">
                    <Icon size={22} />
                  </div>
                  <h3 className="block-title mt-6 text-[#202635]">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#202635]/65">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONVERSATION STRIP */}
      <section className="bg-[#202635] site-section text-[#f5f0e6]">
        <div className="site-container text-center">
          <SectionLabel>Connect With An Advisor</SectionLabel>

          <h2 className="section-title mt-6">
            Start with an honest{' '}
            <em className="text-[#d9c6a4]">conversation.</em>
          </h2>

          <p className="body-copy measure mx-auto mt-6 text-[#f5f0e6]/70">
            No sales pitches. Just a thoughtful discussion on your Dubai property plans, community options, and investment goals.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="btn btn-sand"
            >
              Contact Us <ArrowRight size={15} />
            </Link>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-light"
            >
              <FaWhatsapp size={16} className="text-[#25D366]" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

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
            <br />
            <em className="text-[#c97352]">prime Dubai real estate.</em>
          </>
        }
        copy="Dedicated, local advisory for Indian business families, NRIs, and global investors seeking high-calibre residential and investment property in Dubai."
        image="/images/gurugram-skyline.jpg"
      />

      {/* OVERVIEW */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionLabel>Local Presence, International Reach</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#202635]">
            A trusted bridge between{' '}
            <em className="text-[#c97352]">India and Dubai.</em>
          </h2>

          <div className="body-copy measure mt-10 space-y-6 text-[#202635]/75">
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
      <section className="bg-[#dfe2dc] site-section">
        <div className="site-container">
          <SectionIntro
            label="Cross-Border Services"
            title={
              <>
                Tailored solutions for
                <br />
                <em className="text-[#c97352]">Indian & NRI clients.</em>
              </>
            }
            copy="Every step of the acquisition process is handled with complete regulatory compliance and transparent communication."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-sm border border-[#202635]/15 bg-[#f5f0e6] p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-[#c97352] text-white">
                  <Check size={20} />
                </div>
                <h3 className="block-title mt-6 text-[#202635]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-6 text-[#202635]/65">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICE DETAILS & CONSULTATION FORM */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 xl:gap-20">
          <div>
            <SectionLabel>India Office</SectionLabel>

            <h2 className="section-title mt-6 text-[#202635]">
              Meet our team in{' '}
              <em className="text-[#c97352]">Gurugram.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#202635]/70">
              Schedule an in-person advisory meeting at our Gurugram desk or request a private video consultation with our senior UAE team.
            </p>

            <div className="mt-8 space-y-6 rounded-sm border border-[#202635]/15 bg-[#e9e4da] p-6 sm:p-8">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">Address</span>
                <p className="card-title mt-2 text-[#202635]">DLF Phase 1, Gurugram</p>
                <p className="text-xs text-[#202635]/60">Haryana, India</p>
              </div>

              <div className="border-t border-[#202635]/15 pt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">Direct Contact</span>
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="card-title mt-2 block text-[#202635] transition-colors hover:text-[#c97352]"
                >
                  {contact.phoneDisplay}
                </a>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#25D366] hover:underline"
                >
                  <FaWhatsapp size={15} /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c97352]">Enquiry Form</span>
              <h3 className="block-title mt-2 text-[#202635]">Request an India Desk Consultation</h3>
            </div>
            <div className="rounded-sm bg-[#e9e4da] p-5 shadow-sm sm:p-8">
              <ContactForm inquiryType="india-office" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   MARKET INSIGHTS PAGE
============================================================ */
type PublishedInsight = { id: string; slug: string; title: string; category?: string; summary?: string; date?: string };

export function MarketInsightsPage() {
  const contact = useContact();
  // Anything published in the admin's Market Insights section leads the page.
  const [published, setPublished] = useState<PublishedInsight[]>([]);
  useEffect(() => {
    let live = true;
    apiFetch<{ insights: PublishedInsight[] }>('/public/insights')
      .then((data) => { if (live) setPublished(data.insights ?? []); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const insights = [
    {
      icon: Landmark,
      title: 'Freehold Ownership Legal Framework',
      description: 'Enacted under Law No. 7 of 2006, foreign nationals of any nationality can purchase 100% freehold titles in designated investment zones across Dubai, with absolute ownership rights guaranteed by the Dubai Land Department (DLD).',
    },
    {
      icon: ShieldCheck,
      title: 'DLD Escrow Account Protections',
      description: 'Under Law No. 8 of 2007, every off-plan project must maintain an official DLD escrow account. Buyer funds can only be released to developers against verified construction milestones certified by government-appointed engineers.',
    },
    {
      icon: TrendingUp,
      title: 'Attractive Net Rental Yields (6% to 9%)',
      description: 'Dubai consistently yields between 6% and 9% gross rental returns across prime and emerging communities, supported by strong global talent migration, high occupancy rates, and corporate headquarters relocations.',
    },
    {
      icon: Coins,
      title: '0% Property and Capital Gains Taxes',
      description: 'The UAE levies 0% personal income tax, 0% annual recurring property tax, and 0% capital gains tax on property sales. Transactions involve only a transparent one-time 4% DLD transfer fee.',
    },
    {
      icon: Building2,
      title: 'UAE 10-Year Golden Residency Visa',
      description: 'Investors acquiring properties with a minimum aggregate purchase value of AED 2,000,000 (approx. USD 545,000) are eligible for the prestigious 10-Year Golden Visa, covering spouse, children, and domestic staff.',
    },
    {
      icon: Globe2,
      title: 'Monetary Stability & Dollar Peg',
      description: 'The UAE Dirham (AED) has been pegged to the US Dollar at a fixed rate of 3.6725 since 1997, providing global investors with immunity against emerging-market currency fluctuations and inflation erosion.',
    },
  ];

  return (
    <main className="overflow-x-clip">
      <PageHero
        label="Market Intelligence & Research"
        title={
          <>
            Dubai property fundamentals,
            <br />
            <em className="text-[#c97352]">grounded in fact.</em>
          </>
        }
        copy="Independent regulatory context, rental yield mechanics, and macroeconomic foundations for informed property decisions across Dubai."
        image="/images/sheikh-zayed-road-aerial.jpg"
      />

      {/* CORE MARKET PILLARS */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionIntro
            label="Market Fundamentals"
            title={
              <>
                The structural pillars of
                <br />
                <em className="text-[#c97352]">Dubai real estate.</em>
              </>
            }
            copy="Dubai’s property market is built on robust legal security, government escrow regulations, and global capital preservation."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex h-full flex-col rounded-sm border border-[#202635]/15 bg-[#e9e4da] p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-[#202635] text-[#d9c6a4]">
                      <Icon size={22} />
                    </div>
                    <h3 className="block-title mt-6 text-[#202635]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#202635]/70">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GLOBAL COMPARISON TABLE */}
      <section className="bg-[#dfe2dc] site-section">
        <div className="site-container">
          <SectionLabel>Global Comparison</SectionLabel>

          <h2 className="section-title mt-6 text-[#202635]">
            Why global capital{' '}
            <em className="text-[#c97352]">chooses Dubai.</em>
          </h2>

          <div className="mt-10 overflow-x-auto rounded-sm border border-[#202635]/15 bg-[#f5f0e6] shadow-xs">
            <table className="w-full text-left font-sans text-sm text-[#202635]">
              <thead>
                <tr className="border-b border-[#202635]/15 bg-[#202635] font-mono text-[10px] uppercase tracking-[0.14em] text-[#f5f0e6]">
                  <th className="p-4 sm:p-5">Indicator</th>
                  <th className="p-4 sm:p-5 text-[#d9c6a4]">Dubai</th>
                  <th className="p-4 sm:p-5">London</th>
                  <th className="p-4 sm:p-5">New York</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202635]/10">
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Annual Property Tax</td>
                  <td className="p-4 font-mono font-bold text-[#c97352] sm:p-5">0%</td>
                  <td className="p-4 sm:p-5">Council Tax & Band Rates</td>
                  <td className="p-4 sm:p-5">Approx. 1.2% – 2.0%</td>
                </tr>
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Capital Gains Tax</td>
                  <td className="p-4 font-mono font-bold text-[#c97352] sm:p-5">0%</td>
                  <td className="p-4 sm:p-5">Up to 24%</td>
                  <td className="p-4 sm:p-5">Up to 20% + State Tax</td>
                </tr>
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Gross Rental Yields</td>
                  <td className="p-4 font-mono font-bold text-[#c97352] sm:p-5">6.0% – 9.0%</td>
                  <td className="p-4 sm:p-5">2.5% – 4.0%</td>
                  <td className="p-4 sm:p-5">3.0% – 4.5%</td>
                </tr>
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Investor Residency Visa</td>
                  <td className="p-4 font-mono font-bold text-[#c97352] sm:p-5">10-Year Golden Visa</td>
                  <td className="p-4 sm:p-5">Not Applicable</td>
                  <td className="p-4 sm:p-5">EB-5 ($800k+ USD)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ADVISORY BRIEFING CTA */}
      <section className="bg-[#202635] site-section text-[#f5f0e6]">
        <div className="site-container text-center">
          <SectionLabel>Private Research Briefing</SectionLabel>

          <h2 className="section-title mt-6">
            Request a bespoke{' '}
            <em className="text-[#d9c6a4]">market analysis.</em>
          </h2>

          <p className="body-copy measure mx-auto mt-6 text-[#f5f0e6]/70">
            Connect with our advisory desk for detailed yield modeling, historical transaction data, and off-plan allocation strategies tailored to your investment mandate.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="btn btn-sand"
            >
              Consult With An Advisor <ArrowRight size={15} />
            </Link>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-light"
            >
              <FaWhatsapp size={16} className="text-[#25D366]" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

