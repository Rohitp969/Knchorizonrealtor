import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Globe2 } from 'lucide-react';
import { Link } from 'wouter';
import { ContactForm, FaqSection, PageHero, PropertyCard, SectionIntro, SectionLabel, ServiceRow } from '@/components/blocks';
import { areas, properties, services } from '@/lib/site-data';
import { CONTACT } from '@/lib/contact-info';

// export function AboutPage() {
//   return <main>
//     <PageHero label="About KNC" title={<>A steady point<br />in a moving city.</>} copy="We are an independent Dubai property advisory for people who value context, candour, and an exceptionally well-handled move." image="/images/creek-waterfront.jpg" />
//     <section className="bg-[#f5f0e6] px-5 py-24 md:px-10 md:py-36"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[.65fr_1.35fr] md:gap-24"><div><SectionLabel>Our point of view</SectionLabel></div><div><h2 className="display max-w-4xl text-5xl leading-[.94] md:text-7xl">The best property advice starts with a better <em className="text-[#c97352]">question.</em></h2><p className="mt-10 max-w-2xl text-base leading-7 text-[#202635]/65 md:ml-[18%]">What does home need to make possible? What would make this investment resilient? Which parts of the city feel like you? These are the questions that shape our work — long before we send a listing.</p><p className="mt-6 max-w-2xl text-base leading-7 text-[#202635]/65 md:ml-[18%]">KNC was founded to make the Dubai property experience feel more human. Our clients come from everywhere, but they all want the same thing: someone local enough to know the detail, and independent enough to tell the truth.</p></div></div></section>
//     <section className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-[1380px]"><SectionIntro label="How we work" title={<>Calm is not passive.<br /><em className="text-[#c97352]">It is prepared.</em></>} copy="A high-touch process, built around the detail that makes decisions feel simple." /><div className="mt-16 grid gap-10 md:grid-cols-3">{[{ n: '01', t: 'Listen before we look', d: 'A proper brief makes everything downstream sharper. We learn the practicals, the preferences, and the non-negotiables.' }, { n: '02', t: 'Edit with context', d: 'Every recommendation comes with the why: the community, the quality, the value, and the questions worth asking.' }, { n: '03', t: 'Stay close to completion', d: 'Our work does not end when the offer is accepted. We keep momentum through the details, right up to the handover.' }].map((item) => <div key={item.n} className="border-t border-[#202635]/20 pt-5"><span className="font-mono text-[10px] text-[#c97352]">{item.n}</span><h3 className="mt-12 font-serif text-3xl">{item.t}</h3><p className="mt-4 text-sm leading-6 text-[#202635]/60">{item.d}</p></div>)}</div></div></section>
//     <section className="bg-[#202635] px-5 py-24 text-[#f5f0e6] md:px-10 md:py-32"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[1fr_.8fr] md:items-end"><div><SectionLabel light>Our promise</SectionLabel><h2 className="display mt-6 max-w-3xl text-5xl leading-[.9] md:text-7xl">Useful honesty,<br /><em className="text-[#d9c6a4]">beautifully delivered.</em></h2></div><p className="max-w-sm text-sm leading-7 text-[#f5f0e6]/60">We will always tell you what we see, what we know, and what we would do if it were our decision. That is the foundation of trust — and the reason our business is built on referrals.</p></div></section>
//   </main>;
// }

export function AboutPage() {
  return (
    <main className="overflow-hidden">

      {/* HERO */}
      <PageHero
        label="About KNC"
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
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1380px]">

          <div className="grid items-start gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">

            {/* LEFT */}
            <div>
              <SectionLabel>Our point of view</SectionLabel>

              <h2 className="display mt-8 max-w-3xl text-5xl leading-[0.94] md:text-6xl lg:text-7xl">
                The best property advice starts with a better{" "}
                <em className="text-[#c97352]">question.</em>
              </h2>
            </div>

            {/* RIGHT */}
            <div className="max-w-2xl pt-1 md:pt-12">
              <p className="text-base leading-7 text-[#202635]/70 md:text-lg">
                What does home need to make possible? What would make this
                investment resilient? Which parts of the city feel like you?
                These are the questions that shape our work — long before we
                send a listing.
              </p>

              <p className="mt-7 text-base leading-7 text-[#202635]/70 md:text-lg">
                KNC was founded to make the Dubai property experience feel
                more human. Our clients come from everywhere, but they all want
                the same thing: someone local enough to know the detail, and
                independent enough to tell the truth.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1380px]">

          <SectionIntro
            label="How we work"
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
                n: "01",
                t: "Listen before we look",
                d: "A proper brief makes everything downstream sharper. We learn the practicals, the preferences, and the non-negotiables.",
              },
              {
                n: "02",
                t: "Edit with context",
                d: "Every recommendation comes with the why: the community, the quality, the value, and the questions worth asking.",
              },
              {
                n: "03",
                t: "Stay close to completion",
                d: "Our work does not end when the offer is accepted. We keep momentum through the details, right up to the handover.",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="border-t border-[#202635]/20 pt-5"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#c97352]">
                  {item.n}
                </span>

                <h3 className="mt-10 max-w-sm font-serif text-2xl leading-tight md:text-3xl">
                  {item.t}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-[#202635]/65">
                  {item.d}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* OUR PROMISE */}
      {/* Changed background so it does NOT merge with the footer */}
      <section className="bg-[#d9d2c5] px-5 py-20 text-[#202635] md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1380px] items-end gap-12 md:grid-cols-[1fr_0.8fr] md:gap-20">

          <div>
            <SectionLabel>Our promise</SectionLabel>

            <h2 className="display mt-6 max-w-3xl text-5xl leading-[0.92] md:text-6xl lg:text-7xl">
              Useful honesty,
              <br />
              <em className="text-[#c97352]">beautifully delivered.</em>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#202635]/65 md:pb-2 md:text-base">
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
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[.13em] transition-colors ${
                  filter === item ? 'bg-[#202635] text-[#f5f0e6]' : 'border border-[#202635]/20 text-[#202635]/60 hover:border-[#c97352] hover:text-[#c97352]'
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
  return <main><PageHero label="Our services" title={<>Advice for<br /><em className="text-[#c97352]">every direction.</em></>} copy="Buying, selling, renting, or investing — the route is different for everyone. The standard of care should not be." image="/images/interior-detail.jpg" /><section className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-[1380px]"><SectionIntro label="The full picture" title={<>More than a<br />property <em className="text-[#c97352]">transaction.</em></>} copy="Our role is to make the important parts clearer, and the complicated parts feel held." /><div className="mt-14">{services.map((service) => <div id={service.id} key={service.id}><ServiceRow service={service} /><p className="max-w-2xl pb-8 pl-[58px] text-sm leading-6 text-[#202635]/60 md:hidden">{service.description}</p></div>)}</div></div></section><section className="bg-[#c6d0c9] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-[1380px] gap-10 md:grid-cols-[1fr_1fr] md:items-center"><div><SectionLabel>What you can expect</SectionLabel><h2 className="display mt-6 text-5xl leading-[.9] md:text-7xl">No noise.<br /><em className="text-[#c97352]">Just movement.</em></h2></div><div className="grid gap-5">{['A dedicated point of contact', 'Clear, timely communication', 'Independent market perspective', 'Care through completion'].map((item) => <div key={item} className="flex items-center gap-4 border-b border-[#202635]/20 pb-4 text-sm"><Check size={16} className="text-[#c97352]" />{item}</div>)}</div></div></section><FaqSection compact /></main>;
}

// export function DesignBuildPage() {
//   const steps = ['Brief and spatial direction', 'Material, lighting, and joinery design', 'Procurement and build coordination', 'Styling, snagging, and handover'];
//   return <main><PageHero label="KNC studio / 07" title={<>Design that<br /><em className="text-[#c97352]">holds up.</em></>} copy="A considered design and build service for homes, investment properties, and spaces ready for a more complete point of view." image="/images/interior-detail.jpg" /><section className="bg-[#f5f0e6] px-5 py-24 md:px-10 md:py-36"><div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.7fr_1.3fr] md:gap-24"><div><SectionLabel>From idea to handover</SectionLabel><p className="mt-7 max-w-xs text-sm leading-7 text-[#202635]/60">One accountable process, shaped around the property, the brief, and the way you want the finished space to feel.</p></div><div><h2 className="display max-w-4xl text-5xl leading-[.94] md:text-7xl">The detail is where a space becomes <em className="text-[#c97352]">yours.</em></h2><p className="mt-9 max-w-2xl text-base leading-7 text-[#202635]/65">We coordinate the creative and practical decisions that sit between an empty room and a finished home. The result is not a catalogue look. It is a place with a clear sense of proportion, material, and belonging.</p><div className="mt-12 grid gap-5 border-t border-[#202635]/20 pt-5 md:grid-cols-2">{steps.map((step, index) => <div key={step} className="border-b border-[#202635]/15 pb-5"><span className="font-mono text-[10px] text-[#c97352]">0{index + 1}</span><p className="mt-4 font-serif text-2xl">{step}</p></div>)}</div></div></div></section><section className="bg-[#202635] px-5 py-24 text-[#f5f0e6] md:px-10 md:py-32"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[1fr_.8fr] md:items-end"><div><SectionLabel light>Start with the brief</SectionLabel><h2 className="display mt-6 max-w-3xl text-5xl leading-[.9] md:text-7xl">Make room for<br /><em className="text-[#d9c6a4]">better living.</em></h2></div><ContactForm compact inquiryType="design-build" /></div></section></main>;
// }

export function DesignBuildPage() {
  const services = [
    {
      number: "01",
      title: "Property-led planning",
      text: "We start with the property itself — its layout, location, intended use, and the improvements that can make the space work better.",
    },
    {
      number: "02",
      title: "Design direction",
      text: "For clients who need help shaping the look and feel of a home or investment property, we help define a clear design direction.",
    },
    {
      number: "03",
      title: "Professional coordination",
      text: "Where specialist design or build work is required, we can help coordinate the next step with the appropriate professionals, subject to the scope of the project.",
    },
    {
      number: "04",
      title: "Investment-focused decisions",
      text: "For investment properties, we keep the focus on practical improvements, presentation, usability, and the property's intended market.",
    },
  ];

  return (
    <main className="overflow-hidden">

      {/* HERO */}
      <PageHero
        label="KNC studio / 07"
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
      <section className="bg-[#f5f0e6] px-5 py-20 sm:px-8 md:px-10 md:py-28 lg:py-32">
        <div className="mx-auto w-full max-w-[1380px]">

          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">

            {/* LEFT */}
            <div>
              <SectionLabel>
                Design & build coordination
              </SectionLabel>

              <p className="mt-7 max-w-sm text-sm leading-7 text-[#202635]/60 sm:text-base">
                Property decisions do not always stop at the purchase. We help
                clients think through what comes next and coordinate the right
                professional support when required.
              </p>
            </div>

            {/* RIGHT */}
            <div className="min-w-0">
              <h2 className="display max-w-5xl text-5xl leading-[0.94] text-[#202635] sm:text-6xl md:text-7xl">
                A better property deserves
                <br />
                a better{" "}
                <em className="text-[#c97352]">
                  plan.
                </em>
              </h2>

              <p className="mt-8 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
                Whether you are preparing a new home, improving a property
                before letting it, or considering how a space can work harder
                as an investment, the right decisions start with understanding
                the property and the people it needs to serve.
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
                KNC brings the property perspective first, then helps you
                identify the design and specialist requirements that make
                sense for the project.
              </p>
            </div>
          </div>

          {/* SERVICE CARDS */}
          <div className="mt-16 grid border-t border-[#202635]/20 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div
                key={service.number}
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
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c97352]">
                  {service.number}
                </span>

                <h3 className="mt-7 max-w-xs font-serif text-2xl leading-tight text-[#202635]">
                  {service.title}
                </h3>

                <p className="mt-4 max-w-xs text-sm leading-6 text-[#202635]/60">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT CLIENTS CAN ASK FOR */}
      <section className="bg-[#e9e4da] px-5 py-20 sm:px-8 md:px-10 md:py-28">
        <div className="mx-auto grid w-full max-w-[1380px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">

          <div>
            <SectionLabel>
              What we can help with
            </SectionLabel>

            <h2 className="display mt-6 max-w-xl text-5xl leading-[0.92] text-[#202635] sm:text-6xl md:text-7xl">
              Start with the
              <br />
              <em className="text-[#c97352]">
                property.
              </em>
            </h2>
          </div>

          <div className="grid gap-x-10 sm:grid-cols-2">

            <div className="border-t border-[#202635]/20 py-6">
              <h3 className="font-serif text-2xl text-[#202635]">
                New home setup
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/60">
                Planning the design direction and practical requirements for
                a newly purchased home.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 py-6">
              <h3 className="font-serif text-2xl text-[#202635]">
                Investment property
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/60">
                Thinking through presentation, usability and improvements
                before leasing or marketing a property.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 py-6">
              <h3 className="font-serif text-2xl text-[#202635]">
                Interior direction
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/60">
                Establishing a clear visual direction before engaging the
                appropriate interior or specialist team.
              </p>
            </div>

            <div className="border-t border-[#202635]/20 py-6">
              <h3 className="font-serif text-2xl text-[#202635]">
                Specialist coordination
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#202635]/60">
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

// export function InteriorsPage() {
//   return (
//     <main>
//       <PageHero
//         label="KNC studio / 08"
//         title={<>The finishing<br /><em className="text-[#c97352]">touch.</em></>}
//         copy="Interiors and furniture selected with restraint, warmth, and a close eye for the details that make a home feel lived in."
//         image="/images/hero-dubai-villa.jpg"
//       />
//       <section className="bg-[#dfe2dc] px-5 py-24 md:px-10 md:py-36">
//         <div className="mx-auto grid max-w-[1380px] gap-10 md:grid-cols-3">
//           <div className="md:col-span-2">
//             <div className="card-thumb aspect-[16/10] max-h-[420px] w-full">
//               <img
//                 src="/images/interior-detail.jpg"
//                 alt="Warm contemporary interior with considered details"
//                 className="h-full w-full object-cover"
//               />
//             </div>
//           </div>
//           <div className="flex flex-col justify-end">
//             <SectionLabel>Interior direction</SectionLabel>
//             <h2 className="display mt-6 text-5xl leading-[.92]">A home should feel <em className="text-[#c97352]">collected.</em></h2>
//             <p className="mt-7 text-sm leading-7 text-[#202635]/65">From one statement piece to a complete furnishing plan, we create a visual language that is personal, practical, and quietly distinctive.</p>
//           </div>
//         </div>
//       </section>
//       <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
//         <div className="mx-auto max-w-[1380px]">
//           <SectionIntro label="What we can shape" title={<>A complete point<br /><em className="text-[#c97352]">of view.</em></>} copy="For new homes, refreshes, and investment properties that need to work harder." />
//           <div className="mt-14 grid gap-8 md:grid-cols-3">
//             {['Furniture curation', 'Custom joinery and lighting', 'Art, objects, and styling'].map((item, index) => (
//               <div key={item} className="border-t border-[#202635]/20 pt-5">
//                 <span className="font-mono text-[10px] text-[#c97352]">0{index + 1}</span>
//                 <h3 className="mt-12 font-serif text-3xl">{item}</h3>
//                 <p className="mt-4 text-sm leading-6 text-[#202635]/60">A considered layer of the process, tailored to the architecture, use, and feeling of your space.</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//       <section className="bg-[#c6d0c9] px-5 py-20 md:px-10 md:py-28">
//         <div className="mx-auto grid max-w-[1380px] gap-10 md:grid-cols-[.8fr_1.2fr] md:items-center">
//           <div>
//             <SectionLabel>Talk to the studio</SectionLabel>
//             <h2 className="display mt-6 text-5xl leading-[.9] md:text-7xl">Bring us<br /><em className="text-[#c97352]">the room.</em></h2>
//           </div>
//           <ContactForm compact inquiryType="interiors" />
//         </div>
//       </section>
//     </main>
//   );
// }


export function InteriorsPage() {
  const services = [
    {
      number: "01",
      title: "Furniture curation",
      text: "Furniture selected around the property's scale, layout, purpose, and the way the space is intended to be used.",
    },
    {
      number: "02",
      title: "Interior direction",
      text: "A clear visual direction for materials, finishes, lighting, furniture, and the overall character of the property.",
    },
    {
      number: "03",
      title: "Styling & finishing",
      text: "The final layer of furniture, art, objects, and styling that helps a home feel complete without feeling over-designed.",
    },
  ];

  return (
    <main className="overflow-hidden">
      <PageHero
        label="KNC studio / 08"
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
      <section className="bg-[#dfe2dc] px-5 py-16 sm:px-8 md:px-10 md:py-24 lg:py-28">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.75fr] lg:gap-16">
            
            {/* SMALLER CONTROLLED IMAGE */}
            <div className="w-full">
              <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-sm">
                <img
                  src="/images/interior-detail.jpg"
                  alt="Contemporary Dubai interior with warm neutral materials"
                  loading="lazy"
                  className="block h-[250px] w-full object-cover object-center sm:h-[290px] md:h-[330px] lg:h-[360px]"
                />
              </div>
            </div>

            {/* TEXT */}
            <div className="min-w-0">
              <SectionLabel>Interior direction</SectionLabel>

              <h2 className="display mt-6 max-w-xl text-5xl leading-[0.92] text-[#202635] sm:text-6xl md:text-7xl">
                A home should feel{" "}
                <em className="text-[#c97352]">collected.</em>
              </h2>

              <p className="mt-7 max-w-lg text-sm leading-7 text-[#202635]/65 sm:text-base">
                From a newly purchased apartment to an investment property
                being prepared for its next tenant, we help shape a clear
                interior direction that feels practical, refined, and
                appropriate to the property.
              </p>

              <p className="mt-5 max-w-lg text-sm leading-7 text-[#202635]/65 sm:text-base">
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
                key={service.number}
                className="border-b border-[#202635]/15 py-7 sm:px-6 sm:py-8 lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c97352]">
                  {service.number}
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
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <SectionLabel>Our approach</SectionLabel>

              <h2 className="display mt-6 max-w-xl text-5xl leading-[0.92] text-[#202635] sm:text-6xl md:text-7xl">
                Less noise.
                <br />
                <em className="text-[#c97352]">More intention.</em>
              </h2>
            </div>

            <div className="grid gap-0">
              <div className="border-t border-[#202635]/20 py-7">
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                  01 / UNDERSTAND
                </span>

                <h3 className="mt-4 font-serif text-2xl text-[#202635] sm:text-3xl">
                  Start with the property
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#202635]/60">
                  We consider the location, layout, intended use, existing
                  condition, and the overall requirement before recommending
                  an interior direction.
                </p>
              </div>

              <div className="border-t border-[#202635]/20 py-7">
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                  02 / CURATE
                </span>

                <h3 className="mt-4 font-serif text-2xl text-[#202635] sm:text-3xl">
                  Choose what belongs
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#202635]/60">
                  Furniture, finishes, lighting, art, and objects are
                  considered as part of one coherent visual language.
                </p>
              </div>

              <div className="border-t border-[#202635]/20 py-7">
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#c97352]">
                  03 / COMPLETE
                </span>

                <h3 className="mt-4 font-serif text-2xl text-[#202635] sm:text-3xl">
                  Prepare the space
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#202635]/60">
                  The final result is a space that feels ready for living,
                  presentation, leasing, or the property's next chapter.
                </p>
              </div>
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


// export function AreasPage() {
//   const [open, setOpen] = useState<string | null>('palm-jumeirah');
//   return (
//     <main>
//       <PageHero
//         label="Dubai, by neighbourhood"
//         title={<>Find the place<br />that feels like <em className="text-[#c97352]">you.</em></>}
//         copy="The city is not one experience. We help you understand the rhythm, texture, and opportunity of each address."
//         image="/images/creek-waterfront.jpg"
//       />
//       <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
//         <div className="mx-auto max-w-[1380px]">
//           <div className="grid gap-14 md:grid-cols-[.6fr_1.4fr] md:gap-24">
//             <div>
//               <SectionLabel>Area notes</SectionLabel>
//               <p className="mt-6 max-w-xs text-sm leading-6 text-[#202635]/60">A local read on the communities our clients return to, again and again.</p>
//             </div>
//             <div>
//               {areas.map((area) => (
//                 <div key={area.id} id={area.id} className="border-t border-[#202635]/18">
//                   <button
//                     onClick={() => setOpen(open === area.id ? null : area.id)}
//                     className="flex w-full items-center justify-between py-6 text-left"
//                     data-testid={`button-area-toggle-${area.id}`}
//                   >
//                     <span className="font-serif text-3xl md:text-4xl">{area.name}</span>
//                     <ChevronDown size={18} className={`text-[#c97352] transition-transform ${open === area.id ? 'rotate-180' : ''}`} />
//                   </button>
//                   {open === area.id && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       className="grid gap-6 overflow-hidden pb-8 md:grid-cols-[.8fr_1fr] md:gap-10"
//                     >
//                       <div className="card-thumb aspect-[16/10] max-h-[300px] w-full">
//                         <img
//                           src={area.image}
//                           alt={area.name}
//                           loading="lazy"
//                           className="h-full w-full object-cover"
//                           data-testid={`img-area-detail-${area.id}`}
//                         />
//                       </div>
//                       <div>
//                         <p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352]">{area.descriptor}</p>
//                         <p className="mt-5 max-w-sm text-sm leading-7 text-[#202635]/65">{area.detail}</p>
//                         <Link
//                           href={`/properties#${area.id}`}
//                           className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] line-link"
//                           data-testid={`link-area-properties-${area.id}`}
//                         >
//                           See available homes <ArrowUpRight size={14} />
//                         </Link>
//                       </div>
//                     </motion.div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

// export function AreasPage() {
//   const [open, setOpen] = useState<string | null>("palm-jumeirah");

//   return (
//     <main className="overflow-hidden">
//       <PageHero
//         label="Dubai, by neighbourhood"
//         title={
//           <>
//             Find the place
//             <br />
//             that feels like <em className="text-[#c97352]">you.</em>
//           </>
//         }
//         copy="Dubai is a city of very different neighbourhoods. We help you understand each location, its character, and the property opportunities it offers."
//         image="/images/creek-waterfront.jpg"
//       />

//       <section className="bg-[#f5f0e6] px-5 py-16 sm:px-8 md:px-10 md:py-24 lg:py-28">
//         <div className="mx-auto w-full max-w-[1280px]">

//           {/* SECTION INTRO */}
//           <div className="max-w-3xl">
//             <SectionLabel>Area notes</SectionLabel>

//             <h2 className="display mt-6 text-5xl leading-[0.92] text-[#202635] sm:text-6xl md:text-7xl">
//               Understand Dubai
//               <br />
//               <em className="text-[#c97352]">by address.</em>
//             </h2>

//             <p className="mt-6 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
//               From waterfront communities and established villa
//               neighbourhoods to new districts shaped by Dubai's continued
//               growth, every address offers a different way of living and
//               investing.
//             </p>
//           </div>

//           {/* AREAS */}
//           <div className="mt-14 border-t border-[#202635]/20">
//             {areas.map((area) => (
//               <div
//                 key={area.id}
//                 id={area.id}
//                 className="border-b border-[#202635]/15"
//               >
//                 {/* AREA HEADER */}
//                 <button
//                   onClick={() =>
//                     setOpen(open === area.id ? null : area.id)
//                   }
//                   className="group flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
//                   aria-expanded={open === area.id}
//                   data-testid={`button-area-toggle-${area.id}`}
//                 >
//                   <div className="min-w-0">
//                     <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#c97352]">
//                       Dubai area
//                     </span>

//                     <span className="mt-2 block font-serif text-3xl leading-tight text-[#202635] transition-colors group-hover:text-[#c97352] sm:text-4xl">
//                       {area.name}
//                     </span>
//                   </div>

//                   <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#202635]/15">
//                     <ChevronDown
//                       size={17}
//                       className={`text-[#c97352] transition-transform duration-300 ${
//                         open === area.id ? "rotate-180" : ""
//                       }`}
//                     />
//                   </span>
//                 </button>

//                 {/* AREA DETAILS */}
//                 {open === area.id && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     transition={{ duration: 0.3 }}
//                     className="overflow-hidden"
//                   >
//                     <div className="grid gap-8 pb-9 pt-1 md:grid-cols-[0.85fr_1.15fr] md:gap-12 lg:gap-16">

//                       {/* IMAGE */}
//                       <div className="w-full">
//                         <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-sm">
//                           <img
//                             src={area.image}
//                             alt={`${area.name} Dubai`}
//                             loading="lazy"
//                             className="block h-[230px] w-full object-cover object-center sm:h-[270px] md:h-[300px] lg:h-[320px]"
//                             data-testid={`img-area-detail-${area.id}`}
//                           />
//                         </div>
//                       </div>

//                       {/* TEXT */}
//                       <div className="flex min-w-0 flex-col justify-center">
//                         <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
//                           {area.descriptor}
//                         </p>

//                         <p className="mt-5 max-w-2xl text-sm leading-7 text-[#202635]/65 sm:text-base">
//                           {area.detail}
//                         </p>

//                         <div className="mt-7">
//                           <Link
//                             href={`/properties#${area.id}`}
//                             className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[#c97352] line-link"
//                             data-testid={`link-area-properties-${area.id}`}
//                           >
//                             Explore properties
//                             <ArrowUpRight size={14} />
//                           </Link>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* BOTTOM NOTE */}
//           <div className="mt-14 grid gap-8 border-t border-[#202635]/20 pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
//             <div>
//               <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
//                 Local perspective
//               </span>
//             </div>

//             <p className="max-w-2xl text-sm leading-7 text-[#202635]/60 sm:text-base">
//               Choosing a Dubai property starts with choosing the right
//               location. If you are unsure which community fits your
//               requirements, speak with our property advisory team before
//               narrowing down the options.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* CONTACT CTA */}
//       <section className="bg-[#c6d0c9] px-5 py-20 sm:px-8 md:px-10 md:py-28">
//         <div className="mx-auto grid w-full max-w-[1180px] items-end gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

//           <div>
//             <SectionLabel>Need a local view?</SectionLabel>

//             <h2 className="display mt-6 max-w-2xl text-5xl leading-[0.9] text-[#202635] sm:text-6xl md:text-7xl">
//               Start with the
//               <br />
//               <em className="text-[#c97352]">right area.</em>
//             </h2>

//             <p className="mt-6 max-w-lg text-sm leading-7 text-[#202635]/65 sm:text-base">
//               Tell us what you are looking for and we can help you compare
//               locations, property types, and the opportunities that may suit
//               your requirements.
//             </p>
//           </div>

//           <div className="w-full rounded-sm bg-[#f5f0e6] p-5 shadow-sm sm:p-8 md:p-10">
//             <ContactForm compact inquiryType="area-advisory" />
//           </div>

//         </div>
//       </section>
//     </main>
//   );
// }

// export function ContactPage() {
//   return (
//     <main>
//       <PageHero
//         label="Start a conversation"
//         title={<>A good move<br />starts with a <em className="text-[#c97352]">hello.</em></>}
//         copy="Tell us a little about what you're looking for. We'll come back with a thoughtful next step."
//         image="/images/hero-dubai-villa.jpg"
//       />
//       <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
//         <div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.7fr_1.3fr] md:gap-24">
//           <div>
//             <SectionLabel>Reach us directly</SectionLabel>
//             <a href={`tel:${CONTACT.phoneHref}`} className="mt-7 block font-serif text-3xl text-[#202635] hover:text-[#c97352]" data-testid="link-contact-page-phone">{CONTACT.phoneDisplay}</a>
//             <a href={`mailto:${CONTACT.email}`} className="mt-2 block font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/60 hover:text-[#c97352]" data-testid="link-contact-page-email">{CONTACT.email}</a>
//             <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] line-link" data-testid="link-contact-page-whatsapp">WhatsApp us</a>
//             <div className="mt-10 border-t border-[#202635]/15 pt-5">
//               <p className="eyebrow text-[#202635]/45">Studio hours</p>
//               <p className="mt-4 text-sm leading-6 text-[#202635]/60">{CONTACT.studioHours}</p>
//             </div>
//             <div className="mt-8 border-t border-[#202635]/15 pt-5">
//               <p className="eyebrow text-[#c97352]">Dubai Office</p>
//               <p className="mt-4 flex items-center gap-2 text-sm text-[#202635]/60">
//                 <Globe2 size={15} className="text-[#c97352]" /> {CONTACT.dubaiAddress}
//               </p>
//             </div>
//             <div className="mt-8 border-t border-[#202635]/15 pt-5">
//               <p className="eyebrow text-[#c97352]">India Office</p>
//               <p className="mt-4 text-sm leading-6 text-[#202635]/60">{CONTACT.indiaAddress}</p>
//             </div>
//           </div>
//           <ContactForm />
//         </div>
//       </section>
//     </main>
//   );
// }



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
                      className={`text-[#c97352] transition-transform duration-300 ${
                        open === area.id ? "rotate-180" : ""
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
                        <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-sm">
                          <img
                            src={area.image}
                            alt={`${area.name} Dubai`}
                            loading="lazy"
                            className="block h-[230px] w-full object-cover object-center sm:h-[270px] md:h-[300px] lg:h-[320px]"
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
          <div className="mt-14 grid gap-8 border-t border-[#202635]/20 pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#c97352]">
                Local perspective
              </span>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-[#202635]/60 sm:text-base">
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

