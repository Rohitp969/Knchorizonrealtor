import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, MapPin, Send } from 'lucide-react';
import { Link } from 'wouter';
import { areas, properties, services, type Area, type Property, type Service, faqs } from '@/lib/site-data';
import { apiFetch, type RemoteProperty } from '@/lib/api';

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.65, 0.2, 1] as const } },
};

export function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return <p className={`eyebrow ${light ? 'text-[#d9c6a4]' : 'text-[#c97352]'}`}>{children}</p>;
}

export function SectionIntro({ label, title, copy, light = false, children }: { label: string; title: ReactNode; copy?: string; light?: boolean; children?: ReactNode }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <SectionLabel light={light}>{label}</SectionLabel>
        <h2 className={`display mt-5 text-5xl leading-[.95] md:text-7xl ${light ? 'text-[#f5f0e6]' : 'text-[#202635]'}`}>{title}</h2>
      </div>
      <div className={`max-w-sm text-sm leading-7 ${light ? 'text-[#f5f0e6]/65' : 'text-[#202635]/65'}`}>{copy}</div>
      {children}
    </motion.div>
  );
}

export function PropertyCard({ property, featured = false }: { property: Property; featured?: boolean }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      className={`group flex flex-col ${featured ? 'md:col-span-2' : ''}`}
      data-testid={`card-property-${property.id}`}
    >
      <Link
        href={`/properties/${property.slug ?? property.id}`}
        className="group flex h-full flex-col border border-[#202635]/12 bg-[#fcfaf6] p-3 transition-all duration-300 hover:border-[#c97352]/50 hover:shadow-lg sm:p-3.5"
        data-testid={`link-property-${property.id}`}
      >
        <div className={`mobile-card-image image-reveal relative w-full overflow-hidden rounded-sm bg-[#202635]/10 ${featured ? 'h-[260px] md:h-[320px]' : 'h-[190px] sm:h-[210px] md:h-[220px]'}`}>
          <img
            src={property.image}
            alt={`${property.title}, ${property.location}`}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = '/images/creek-waterfront.jpg'; }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            data-testid={`img-property-${property.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202635]/50 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-35" />
          {property.note && (
            <span className="absolute left-3 top-3 border border-[#f5f0e6]/30 bg-[#202635]/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#f5f0e6] backdrop-blur-xs">
              {property.note}
            </span>
          )}
          <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-[#f5f0e6] text-[#202635] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1">
            <ArrowRight size={14} />
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between pt-3.5">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[.12em] text-[#202635]/55">
              <span className="font-semibold text-[#c97352]">{property.type}</span>
              <span className="flex items-center gap-1"><MapPin size={10} className="text-[#c97352]" /> {property.location}</span>
            </div>

            <h3 className="mt-2 font-serif text-2xl leading-tight text-[#202635] transition-colors group-hover:text-[#c97352]">
              {property.title}
            </h3>

            <p className="mt-1.5 text-xs text-[#202635]/65">
              {property.details}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#202635]/10 pt-3">
            <span className="font-mono text-xs font-semibold text-[#202635]">
              {property.price}
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[.13em] text-[#c97352] group-hover:underline">
              View details <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function remotePropertyCard(item: RemoteProperty): Property {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    location: item.location,
    type: item.type,
    price: `${item.currency || 'AED'} ${new Intl.NumberFormat('en-AE').format(item.price)}`,
    details: `${item.bedrooms} beds · ${item.bathrooms} baths · ${new Intl.NumberFormat('en-AE').format(item.size)} sq ft`,
    image: item.images?.[0] || '/images/creek-waterfront.jpg',
    note: item.status,
  };
}

export function FeaturedProperties() {
  const [items, setItems] = useState<Property[]>(properties);

  useEffect(() => {
    let active = true;
    apiFetch<{ properties: RemoteProperty[] }>('/public/properties?featured=true&limit=4')
      .then((data) => {
        if (!active || !data?.properties || data.properties.length === 0) return;
        const mapped = data.properties.map(remotePropertyCard);
        if (mapped.length >= 4) {
          setItems(mapped.slice(0, 4));
        } else {
          const merged = [...mapped];
          for (const fallback of properties) {
            if (!merged.some((m) => m.slug === fallback.slug || m.title === fallback.title)) {
              merged.push(fallback);
            }
            if (merged.length >= 4) break;
          }
          setItems(merged.slice(0, 4));
        }
      })
      .catch(() => {
        // Keep static fallback
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.slice(0, 4).map((property) => (
        <PropertyCard key={property.id || property.slug} property={property} featured={false} />
      ))}
    </div>
  );
}

export function ServiceRow({ service }: { service: Service }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} className="group grid grid-cols-[42px_1fr_auto] items-start gap-4 border-t border-[#202635]/15 py-7 md:grid-cols-[80px_1fr_1.1fr_auto] md:gap-8 md:py-9" data-testid={`row-service-${service.id}`}>
      <span className="font-mono text-[10px] text-[#c97352]">{service.index}</span>
      <h3 className="font-serif text-3xl leading-none text-[#202635] md:text-4xl">{service.title}</h3>
      <p className="hidden max-w-xs text-sm leading-6 text-[#202635]/60 md:block">{service.description}</p>
      <Link href={`/services#${service.id}`} className="mt-1 grid h-9 w-9 place-items-center rounded-full border border-[#202635]/25 transition-colors group-hover:border-[#c97352] group-hover:bg-[#c97352] group-hover:text-[#f5f0e6]" aria-label={`Read more about ${service.title}`} data-testid={`link-service-${service.id}`}><ArrowRight size={15} /></Link>
    </motion.div>
  );
}

export function AreaCard({ area, index }: { area: Area; index: number }) {
  return (
    <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} transition={{ delay: index * .08 }} className="group w-full" data-testid={`card-area-${area.id}`}>
      <Link href={`/areas#${area.id}`} className="block" data-testid={`link-area-${area.id}`}>
        <div className="relative h-[200px] sm:h-[220px] md:h-[230px] w-full overflow-hidden rounded-sm bg-[#202635]">
          <img src={area.image} alt={area.name} loading="lazy" className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-105" data-testid={`img-area-${area.id}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202635]/85 via-[#202635]/20 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 text-[#f5f0e6]">
            <p className="font-mono text-[9px] uppercase tracking-[.15em] text-[#d9c6a4]">0{index + 1} / Dubai</p>
            <h3 className="mt-2 font-serif text-3xl leading-none">{area.name}</h3>
            <p className="mt-1.5 text-xs text-[#f5f0e6]/75">{area.descriptor}</p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function ContactForm({ compact = false, propertySlug, projectSlug, inquiryType = 'contact' }: { compact?: boolean; propertySlug?: string; projectSlug?: string; inquiryType?: string }) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', interest: '', budget: '', propertyType: '', location: '', message: '' });
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const cleanedForm = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), interest: form.interest.trim(), message: form.message.trim() };
    if (!cleanedForm.name || !cleanedForm.phone || !cleanedForm.email || !cleanedForm.interest || !cleanedForm.message) {
      setError('Please complete your name, phone, email, requirement, and message.');
      setSubmitting(false);
      return;
    }
    try {
      await apiFetch('/inquiries', { method: 'POST', body: JSON.stringify({ ...cleanedForm, propertySlug, inquiryType, projectSlug }) });
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  if (sent) return <div className="border border-[#c97352]/40 bg-[#c97352]/10 p-7 md:p-10" data-testid="status-contact-success"><Check className="text-[#c97352]" size={26} /><h3 className="display mt-6 text-4xl text-[#202635]">We'll be in touch shortly.</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#202635]/60">Thank you, {form.name || 'there'}. A member of our advisory team will reach out to understand what you're looking for.</p><button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', interest: '', budget: '', propertyType: '', location: '', message: '' }); }} className="mt-7 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] line-link" data-testid="button-contact-reset">Send another enquiry</button></div>;
  return (
    <form onSubmit={submit} className={`grid gap-5 ${compact ? '' : 'md:grid-cols-2 md:gap-x-7'}`} data-testid="form-contact">
      <label className="block"><span className="eyebrow text-[#202635]/45">Your name</span><input required value={form.name} onChange={update('name')} className="mt-3 w-full border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="Full name" data-testid="input-contact-name" /></label>
      <label className="block"><span className="eyebrow text-[#202635]/45">Email address</span><input required type="email" value={form.email} onChange={update('email')} className="mt-3 w-full border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="you@email.com" data-testid="input-contact-email" /></label>
      <label className="block"><span className="eyebrow text-[#202635]/45">Phone number</span><input required value={form.phone} onChange={update('phone')} className="mt-3 w-full border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="+971" data-testid="input-contact-phone" /></label>
      <label className="block relative"><span className="eyebrow text-[#202635]/45">I'm looking to</span><select required value={form.interest} onChange={update('interest')} className="mt-3 w-full appearance-none border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none focus:border-[#c97352]" data-testid="select-contact-interest"><option value="">Select an option</option><option>Buy a property</option><option>Sell a property</option><option>Rent a home</option><option>Explore an investment</option><option>Off-plan enquiry</option><option>General advisory</option></select><ChevronDown size={15} className="pointer-events-none absolute bottom-3 right-1 text-[#202635]/50" /></label>
      {!compact && (
        <>
          <label className="block relative"><span className="eyebrow text-[#202635]/45">Budget (optional)</span><select value={form.budget} onChange={update('budget')} className="mt-3 w-full appearance-none border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none focus:border-[#c97352]"><option value="">Select budget range</option><option>Under AED 1M</option><option>AED 1M – 3M</option><option>AED 3M – 7M</option><option>AED 7M – 15M</option><option>AED 15M+</option></select><ChevronDown size={15} className="pointer-events-none absolute bottom-3 right-1 text-[#202635]/50" /></label>
          <label className="block relative"><span className="eyebrow text-[#202635]/45">Property type (optional)</span><select value={form.propertyType} onChange={update('propertyType')} className="mt-3 w-full appearance-none border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none focus:border-[#c97352]"><option value="">Select type</option><option>Apartment</option><option>Villa</option><option>Penthouse</option><option>Townhouse</option><option>Commercial</option><option>Off-Plan</option></select><ChevronDown size={15} className="pointer-events-none absolute bottom-3 right-1 text-[#202635]/50" /></label>
          <label className="block"><span className="eyebrow text-[#202635]/45">Preferred location (optional)</span><input value={form.location} onChange={update('location')} className="mt-3 w-full border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="e.g. Dubai Marina, Downtown…" /></label>
        </>
      )}
      <label className={`block ${compact ? '' : 'md:col-span-2'}`}><span className="eyebrow text-[#202635]/45">A little about your plans</span><textarea required value={form.message} onChange={update('message')} rows={3} className="mt-3 w-full resize-none border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="Tell us what would make this move feel right." data-testid="textarea-contact-message" /></label>
      {error && <p className={`text-sm text-[#c97352] ${compact ? '' : 'md:col-span-2'}`} role="alert">{error}</p>}
      <button disabled={submitting} type="submit" className={`group mt-3 flex w-fit items-center gap-3 bg-[#202635] px-6 py-4 font-mono text-[10px] uppercase tracking-[.15em] text-[#f5f0e6] transition-colors hover:bg-[#c97352] disabled:cursor-wait disabled:opacity-60 ${compact ? '' : 'md:col-span-2'}`} data-testid="button-contact-submit">{submitting ? 'Sending…' : 'Send enquiry'} <Send size={14} className="transition-transform group-hover:translate-x-1" /></button>
    </form>
  );
}

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('sending');
    try { await apiFetch('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }); setState('success'); }
    catch { setState('error'); }
  }
  return <form onSubmit={submit} className="mt-7 flex max-w-md border-b border-[#f5f0e6]/30" data-testid="form-newsletter">
    <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#f5f0e6] outline-none placeholder:text-[#f5f0e6]/40" aria-label="Email address" />
    <button disabled={state === 'sending'} className="flex items-center gap-2 py-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#d9c6a4] hover:text-[#f5f0e6]">{state === 'success' ? 'Joined' : state === 'sending' ? 'Joining…' : 'Subscribe'} <Send size={13} /></button>
    {state === 'error' && <span className="sr-only">Please enter a valid email and try again.</span>}
  </form>;
}

export function FaqSection({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className={`${compact ? 'bg-[#e9e4da]' : 'bg-[#dfe2dc]'} px-5 py-20 md:px-10 md:py-28`}>
      <div className="mx-auto grid max-w-[1380px] gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-24">
        <div><SectionLabel>Questions, answered</SectionLabel><h2 className="display mt-6 text-5xl leading-[.92] md:text-7xl">A clearer<br /><em className="text-[#c97352]">first step.</em></h2><p className="mt-7 max-w-sm text-sm leading-7 text-[#202635]/60">A few useful details before we start a conversation about your next move.</p></div>
        <div className="border-t border-[#202635]/20">
          {faqs.map((faq) => <div key={faq.question} className="border-b border-[#202635]/20"><button type="button" onClick={() => setOpen(open === faq.question ? null : faq.question)} className="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={open === faq.question}><span className="font-serif text-2xl md:text-3xl">{faq.question}</span><ChevronDown size={18} className={`shrink-0 text-[#c97352] transition-transform ${open === faq.question ? 'rotate-180' : ''}`} /></button>{open === faq.question && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="max-w-2xl overflow-hidden pb-6 text-sm leading-7 text-[#202635]/65">{faq.answer}</motion.p>}</div>)}
        </div>
      </div>
    </section>
  );
}

export function PageHero({ label, title, copy, image, children }: { label: string; title: ReactNode; copy: string; image?: string; children?: ReactNode }) {
  return (
    <section className={`page-hero relative flex min-h-[48vh] md:min-h-[55vh] items-end overflow-hidden px-5 pb-12 pt-28 md:px-10 md:pb-16 md:pt-36 ${image ? 'bg-[#202635]' : 'bg-[#dfe2dc]'}`}>
      {image && <><img src={image} alt="" className="page-hero-image absolute inset-0 h-full w-full object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-[#202635]/90 via-[#202635]/20 to-[#202635]/35" /></>}
      <div className="relative z-10 mx-auto w-full max-w-[1380px]">
        <SectionLabel light={!!image}>{label}</SectionLabel>
        <h1 className={`display mt-5 max-w-5xl text-5xl leading-[.9] sm:text-6xl md:text-7xl lg:text-8xl ${image ? 'text-[#f5f0e6]' : 'text-[#202635]'}`}>{title}</h1>
        <p className={`mt-5 max-w-lg text-sm md:text-base leading-relaxed ${image ? 'text-[#f5f0e6]/70' : 'text-[#202635]/65'}`}>{copy}</p>
        {children}
      </div>
    </section>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <div className="border border-[#c97352]/30 bg-[#c97352]/10 p-7 text-sm text-[#202635]/70" role="alert">We couldn’t load this section. {message}</div>;
}
