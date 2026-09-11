import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, Globe2 } from 'lucide-react';
import { Link } from 'wouter';
import { ContactForm, FaqSection, PageHero, PropertyCard, SectionIntro, SectionLabel, ServiceRow } from '@/components/blocks';
import { areas, properties, services } from '@/lib/site-data';
import { CONTACT } from '@/lib/contact-info';

export function AboutPage() {
  return <main>
    <PageHero label="About KNC" title={<>A steady point<br />in a moving city.</>} copy="We are an independent Dubai property advisory for people who value context, candour, and an exceptionally well-handled move." image="/images/creek-waterfront.jpg" />
    <section className="bg-[#f5f0e6] px-5 py-24 md:px-10 md:py-36"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[.65fr_1.35fr] md:gap-24"><div><SectionLabel>Our point of view</SectionLabel></div><div><h2 className="display max-w-4xl text-5xl leading-[.94] md:text-7xl">The best property advice starts with a better <em className="text-[#c97352]">question.</em></h2><p className="mt-10 max-w-2xl text-base leading-7 text-[#202635]/65 md:ml-[18%]">What does home need to make possible? What would make this investment resilient? Which parts of the city feel like you? These are the questions that shape our work — long before we send a listing.</p><p className="mt-6 max-w-2xl text-base leading-7 text-[#202635]/65 md:ml-[18%]">KNC was founded to make the Dubai property experience feel more human. Our clients come from everywhere, but they all want the same thing: someone local enough to know the detail, and independent enough to tell the truth.</p></div></div></section>
    <section className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-[1380px]"><SectionIntro label="How we work" title={<>Calm is not passive.<br /><em className="text-[#c97352]">It is prepared.</em></>} copy="A high-touch process, built around the detail that makes decisions feel simple." /><div className="mt-16 grid gap-10 md:grid-cols-3">{[{ n: '01', t: 'Listen before we look', d: 'A proper brief makes everything downstream sharper. We learn the practicals, the preferences, and the non-negotiables.' }, { n: '02', t: 'Edit with context', d: 'Every recommendation comes with the why: the community, the quality, the value, and the questions worth asking.' }, { n: '03', t: 'Stay close to completion', d: 'Our work does not end when the offer is accepted. We keep momentum through the details, right up to the handover.' }].map((item) => <div key={item.n} className="border-t border-[#202635]/20 pt-5"><span className="font-mono text-[10px] text-[#c97352]">{item.n}</span><h3 className="mt-12 font-serif text-3xl">{item.t}</h3><p className="mt-4 text-sm leading-6 text-[#202635]/60">{item.d}</p></div>)}</div></div></section>
    <section className="bg-[#202635] px-5 py-24 text-[#f5f0e6] md:px-10 md:py-32"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[1fr_.8fr] md:items-end"><div><SectionLabel light>Our promise</SectionLabel><h2 className="display mt-6 max-w-3xl text-5xl leading-[.9] md:text-7xl">Useful honesty,<br /><em className="text-[#d9c6a4]">beautifully delivered.</em></h2></div><p className="max-w-sm text-sm leading-7 text-[#f5f0e6]/60">We will always tell you what we see, what we know, and what we would do if it were our decision. That is the foundation of trust — and the reason our business is built on referrals.</p></div></section>
  </main>;
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

export function DesignBuildPage() {
  const steps = ['Brief and spatial direction', 'Material, lighting, and joinery design', 'Procurement and build coordination', 'Styling, snagging, and handover'];
  return <main><PageHero label="KNC studio / 07" title={<>Design that<br /><em className="text-[#c97352]">holds up.</em></>} copy="A considered design and build service for homes, investment properties, and spaces ready for a more complete point of view." image="/images/interior-detail.jpg" /><section className="bg-[#f5f0e6] px-5 py-24 md:px-10 md:py-36"><div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.7fr_1.3fr] md:gap-24"><div><SectionLabel>From idea to handover</SectionLabel><p className="mt-7 max-w-xs text-sm leading-7 text-[#202635]/60">One accountable process, shaped around the property, the brief, and the way you want the finished space to feel.</p></div><div><h2 className="display max-w-4xl text-5xl leading-[.94] md:text-7xl">The detail is where a space becomes <em className="text-[#c97352]">yours.</em></h2><p className="mt-9 max-w-2xl text-base leading-7 text-[#202635]/65">We coordinate the creative and practical decisions that sit between an empty room and a finished home. The result is not a catalogue look. It is a place with a clear sense of proportion, material, and belonging.</p><div className="mt-12 grid gap-5 border-t border-[#202635]/20 pt-5 md:grid-cols-2">{steps.map((step, index) => <div key={step} className="border-b border-[#202635]/15 pb-5"><span className="font-mono text-[10px] text-[#c97352]">0{index + 1}</span><p className="mt-4 font-serif text-2xl">{step}</p></div>)}</div></div></div></section><section className="bg-[#202635] px-5 py-24 text-[#f5f0e6] md:px-10 md:py-32"><div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[1fr_.8fr] md:items-end"><div><SectionLabel light>Start with the brief</SectionLabel><h2 className="display mt-6 max-w-3xl text-5xl leading-[.9] md:text-7xl">Make room for<br /><em className="text-[#d9c6a4]">better living.</em></h2></div><ContactForm compact inquiryType="design-build" /></div></section></main>;
}

export function InteriorsPage() {
  return (
    <main>
      <PageHero
        label="KNC studio / 08"
        title={<>The finishing<br /><em className="text-[#c97352]">touch.</em></>}
        copy="Interiors and furniture selected with restraint, warmth, and a close eye for the details that make a home feel lived in."
        image="/images/hero-dubai-villa.jpg"
      />
      <section className="bg-[#dfe2dc] px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1380px] gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="card-thumb aspect-[16/10] max-h-[420px] w-full">
              <img
                src="/images/interior-detail.jpg"
                alt="Warm contemporary interior with considered details"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <SectionLabel>Interior direction</SectionLabel>
            <h2 className="display mt-6 text-5xl leading-[.92]">A home should feel <em className="text-[#c97352]">collected.</em></h2>
            <p className="mt-7 text-sm leading-7 text-[#202635]/65">From one statement piece to a complete furnishing plan, we create a visual language that is personal, practical, and quietly distinctive.</p>
          </div>
        </div>
      </section>
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro label="What we can shape" title={<>A complete point<br /><em className="text-[#c97352]">of view.</em></>} copy="For new homes, refreshes, and investment properties that need to work harder." />
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {['Furniture curation', 'Custom joinery and lighting', 'Art, objects, and styling'].map((item, index) => (
              <div key={item} className="border-t border-[#202635]/20 pt-5">
                <span className="font-mono text-[10px] text-[#c97352]">0{index + 1}</span>
                <h3 className="mt-12 font-serif text-3xl">{item}</h3>
                <p className="mt-4 text-sm leading-6 text-[#202635]/60">A considered layer of the process, tailored to the architecture, use, and feeling of your space.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#c6d0c9] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1380px] gap-10 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <SectionLabel>Talk to the studio</SectionLabel>
            <h2 className="display mt-6 text-5xl leading-[.9] md:text-7xl">Bring us<br /><em className="text-[#c97352]">the room.</em></h2>
          </div>
          <ContactForm compact inquiryType="interiors" />
        </div>
      </section>
    </main>
  );
}

export function AreasPage() {
  const [open, setOpen] = useState<string | null>('palm-jumeirah');
  return (
    <main>
      <PageHero
        label="Dubai, by neighbourhood"
        title={<>Find the place<br />that feels like <em className="text-[#c97352]">you.</em></>}
        copy="The city is not one experience. We help you understand the rhythm, texture, and opportunity of each address."
        image="/images/creek-waterfront.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="grid gap-14 md:grid-cols-[.6fr_1.4fr] md:gap-24">
            <div>
              <SectionLabel>Area notes</SectionLabel>
              <p className="mt-6 max-w-xs text-sm leading-6 text-[#202635]/60">A local read on the communities our clients return to, again and again.</p>
            </div>
            <div>
              {areas.map((area) => (
                <div key={area.id} id={area.id} className="border-t border-[#202635]/18">
                  <button
                    onClick={() => setOpen(open === area.id ? null : area.id)}
                    className="flex w-full items-center justify-between py-6 text-left"
                    data-testid={`button-area-toggle-${area.id}`}
                  >
                    <span className="font-serif text-3xl md:text-4xl">{area.name}</span>
                    <ChevronDown size={18} className={`text-[#c97352] transition-transform ${open === area.id ? 'rotate-180' : ''}`} />
                  </button>
                  {open === area.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid gap-6 overflow-hidden pb-8 md:grid-cols-[.8fr_1fr] md:gap-10"
                    >
                      <div className="card-thumb aspect-[16/10] max-h-[300px] w-full">
                        <img
                          src={area.image}
                          alt={area.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                          data-testid={`img-area-detail-${area.id}`}
                        />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352]">{area.descriptor}</p>
                        <p className="mt-5 max-w-sm text-sm leading-7 text-[#202635]/65">{area.detail}</p>
                        <Link
                          href={`/properties#${area.id}`}
                          className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] line-link"
                          data-testid={`link-area-properties-${area.id}`}
                        >
                          See available homes <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function ContactPage() {
  return (
    <main>
      <PageHero
        label="Start a conversation"
        title={<>A good move<br />starts with a <em className="text-[#c97352]">hello.</em></>}
        copy="Tell us a little about what you're looking for. We'll come back with a thoughtful next step."
        image="/images/hero-dubai-villa.jpg"
      />
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1380px] gap-14 md:grid-cols-[.7fr_1.3fr] md:gap-24">
          <div>
            <SectionLabel>Reach us directly</SectionLabel>
            <a href={`tel:${CONTACT.phoneHref}`} className="mt-7 block font-serif text-3xl text-[#202635] hover:text-[#c97352]" data-testid="link-contact-page-phone">{CONTACT.phoneDisplay}</a>
            <a href={`mailto:${CONTACT.email}`} className="mt-2 block font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/60 hover:text-[#c97352]" data-testid="link-contact-page-email">{CONTACT.email}</a>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] line-link" data-testid="link-contact-page-whatsapp">WhatsApp us</a>
            <div className="mt-10 border-t border-[#202635]/15 pt-5">
              <p className="eyebrow text-[#202635]/45">Studio hours</p>
              <p className="mt-4 text-sm leading-6 text-[#202635]/60">{CONTACT.studioHours}</p>
            </div>
            <div className="mt-8 border-t border-[#202635]/15 pt-5">
              <p className="eyebrow text-[#c97352]">Dubai Office</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-[#202635]/60">
                <Globe2 size={15} className="text-[#c97352]" /> {CONTACT.dubaiAddress}
              </p>
            </div>
            <div className="mt-8 border-t border-[#202635]/15 pt-5">
              <p className="eyebrow text-[#c97352]">India Office</p>
              <p className="mt-4 text-sm leading-6 text-[#202635]/60">{CONTACT.indiaAddress}</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}