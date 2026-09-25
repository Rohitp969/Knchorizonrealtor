import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, MapPin, Send } from 'lucide-react';
import { Link } from 'wouter';
import { areas, defaultPosts, defaultProjects, properties, services, type Area, type Property, type Service, faqs } from '@/lib/site-data';
import { apiFetch, type Post, type Project, type RemoteProperty } from '@/lib/api';
import { useSiteSettings } from '@/lib/site-settings';
import { PhoneInput, type PhoneChange } from '@/components/phone-input';

export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.65, 0.2, 1] as const } },
};

/*
 * Hero reveal. The eyebrow, heading, standfirst and buttons arrive in sequence instead of as
 * one block, which reads as composed rather than as a page that popped in. Shorter and
 * shallower than fadeUp: this is the first thing a visitor sees, so it has to settle quickly.
 * MotionConfig in App.tsx drops all of it for anyone who asks for reduced motion.
 */
export const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const heroItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.65, 0.2, 1] as const } },
};

/*
 * Repeated-card grids.
 * One card width for the whole site, so every card image is the same size wherever it
 * appears. A single result keeps that width rather than stretching across the page, which
 * is what made a one-result search look broken.
 */
export function cardGrid(_count: number) {
  // One card width for the whole site: three to a row on desktop, two on tablets, one on a
  // phone, whatever the result count is. A short row leaves its last column empty rather
  // than widening the cards to fill it, so a photograph is never a different size in one
  // section than it is in the next.
  return 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3';
}

export function SectionLabel({ children, light = false }: { children: string; light?: boolean }) {
  return <p className={`eyebrow ${light ? 'text-[#d9c6a4]' : 'text-[#c97352]'}`}>{children}</p>;
}

/*
 * Section heading block: the eyebrow and heading on the left, the standfirst on the right.
 * A section's "view all" link belongs in `action`, so it sits directly under the standfirst
 * and shares its left edge. Passed as a third element beside the two columns instead, it
 * took width from the standfirst and the two no longer lined up with anything.
 */
export function SectionIntro({ label, title, copy, action, light = false, children, className = '' }: { label: string; title: ReactNode; copy?: string; action?: ReactNode; light?: boolean; children?: ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} className={`flex w-full flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-16 ${className}`}>
      <div className="max-w-2xl">
        <SectionLabel light={light}>{label}</SectionLabel>
        <h2 className={`section-title mt-6 ${light ? 'text-[#f5f0e6]' : 'text-[#202635]'}`}>{title}</h2>
      </div>
      {(copy || action) && (
        <div className="measure-narrow text-sm lg:w-[27.5rem] lg:max-w-none lg:shrink-0 lg:pb-1">
          {copy && <p className={`leading-7 ${light ? 'text-[#f5f0e6]/65' : 'text-[#202635]/65'}`}>{copy}</p>}
          {action && <div className="mt-5">{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function PropertyCard({ property, featured = false, className = '' }: { property: Property; featured?: boolean; className?: string }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      className={`group flex flex-col ${featured ? 'md:col-span-2' : ''} ${className}`}
      data-testid={`card-property-${property.id}`}
    >
      <Link
        href={`/properties/${property.slug ?? property.id}`}
        className="card-editorial group flex h-full flex-col p-5"
        data-testid={`link-property-${property.id}`}
      >
        <div className={`mobile-card-image image-reveal card-media ${featured ? 'card-media-wide' : ''}`}>
          <img
            src={property.image}
            alt={`${property.title}, ${property.location}`}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = '/images/dubai-skyline-from-sea.jpg'; }}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            data-testid={`img-property-${property.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202635]/50 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-35" />
          {property.note && (
            <span className="absolute left-3 top-3 border border-[#f5f0e6]/30 bg-[#202635]/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.12em] text-[#f5f0e6] backdrop-blur-xs">
              {property.note}
            </span>
          )}
          <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-[#f5f0e6] text-[#202635] opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1">
            <ArrowRight size={14} />
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between pt-4">
          <div>
            <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-[.12em] text-[#202635]/55">
              <span className="shrink-0 font-semibold text-[#c97352]">{property.type}</span>
              <span className="flex min-w-0 items-center gap-1"><MapPin size={10} className="shrink-0 text-[#c97352]" /> <span className="truncate">{property.location}</span></span>
            </div>

            <h3 className="card-title mt-2 line-clamp-2 text-[#202635] transition-colors group-hover:text-[#c97352]">
              {property.title}
            </h3>

            <p className="mt-2 line-clamp-1 text-sm leading-6 text-[#202635]/65">
              {property.details}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#202635]/12 pt-4">
            <span className="whitespace-nowrap font-sans text-sm font-semibold text-[#202635]">
              {property.price}
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] group-hover:underline">
              View property <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function remotePropertyCard(item: RemoteProperty, currency: string): Property {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    location: item.location,
    type: item.type,
    price: `${item.currency || currency} ${new Intl.NumberFormat('en-AE').format(item.price)}`,
    details: `${item.bedrooms} beds · ${item.bathrooms} baths · ${new Intl.NumberFormat('en-AE').format(item.size)} sq ft`,
    image: item.images?.[0] || '/images/dubai-skyline-from-sea.jpg',
    note: item.status,
  };
}

export function FeaturedProperties() {
  const { defaultCurrency } = useSiteSettings();
  const [items, setItems] = useState<Property[]>(properties);

  useEffect(() => {
    let active = true;
    apiFetch<{ properties: RemoteProperty[] }>('/public/properties?featured=true&limit=6')
      .then((data) => {
        if (!active || !data?.properties || data.properties.length === 0) return;
        const mapped = data.properties.map((item) => remotePropertyCard(item, defaultCurrency));
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
  }, [defaultCurrency]);

  // One card per column on desktop, two on tablets, one on phones.
  const shown = items.slice(0, 3);
  return (
    <div className={cardGrid(shown.length)}>
      {shown.map((property) => (
        <PropertyCard key={property.id || property.slug} property={property} featured={false} />
      ))}
    </div>
  );
}


export const aed = (value: number, currency = 'AED') => `${currency} ${new Intl.NumberFormat('en-AE').format(value)}`;
const FALLBACK_IMAGE = '/images/dubai-skyline-from-sea.jpg';

/* One project card used by the home page, /projects, /off-plan and their filters. */
export function ProjectCard({ project }: { project: Project }) {
  const { defaultCurrency } = useSiteSettings();
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} className="h-full">
    <Link
      href={`/projects/${project.slug}`}
      className="card-editorial group flex h-full flex-col justify-between p-5"
      data-testid={`card-project-${project.slug}`}
    >
      <div>
        <div className="card-media image-reveal">
          <img
            src={project.image || FALLBACK_IMAGE}
            alt={`${project.title} by ${project.developer}, ${project.location}`}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 border border-[#f5f0e6]/30 bg-[#202635]/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.12em] text-[#f5f0e6] backdrop-blur-xs">
            {project.status || 'Off-Plan'}
          </span>
        </div>
        <p className="eyebrow mt-4 line-clamp-1 text-[#c97352]">{project.developer} · {project.location}</p>
        <h3 className="card-title mt-2 line-clamp-2">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#202635]/65">{project.description}</p>
      </div>
      <div className="mt-5 border-t border-[#202635]/12 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[.13em] text-[#202635]/65">
          <span>From {aed(project.startingPrice, defaultCurrency)}</span>
          <span>Handover {project.handover}</span>
        </div>
        <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] group-hover:underline">
          View project <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
    </motion.div>
  );
}

/* One post card used by the home page and /blog. */
export function PostCard({ post }: { post: Post }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} className="h-full">
    <Link
      key={post.id}
      href={`/blog/${post.slug}`}
      className="card-editorial group flex h-full flex-col justify-between p-5"
      data-testid={`card-post-${post.slug}`}
    >
      <div>
        <div className="card-media image-reveal">
          <img
            src={post.image || FALLBACK_IMAGE}
            alt={post.title}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }}
            className="transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <p className="eyebrow mt-4 line-clamp-1 text-[#c97352]">{post.category} · {post.author}</p>
        <h3 className="card-title mt-2 line-clamp-2">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#202635]/60">{post.excerpt}</p>
      </div>
      <div className="mt-5 border-t border-[#202635]/12 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[.13em] text-[#202635]/45">
          {new Date(post.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
        </p>
        <span className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] group-hover:underline">
          Read note <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
    </motion.div>
  );
}

/* Home: featured off-plan projects, live when the API answers and the existing edit otherwise. */
export function FeaturedProjects() {
  const [items, setItems] = useState<Project[]>(defaultProjects as unknown as Project[]);

  /*
   * Featured first, then the rest of the published projects until the row of three is full.
   * Only two projects are flagged featured today, which left the row a card short beside the
   * property row above it. Everything shown here is a real published project; marking a third
   * one featured simply changes which three appear.
   */
  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<{ projects: Project[] }>('/public/projects?featured=true').catch(() => ({ projects: [] as Project[] })),
      apiFetch<{ projects: Project[] }>('/public/projects').catch(() => ({ projects: [] as Project[] })),
    ]).then(([featured, all]) => {
      if (!active) return;
      const picked = [...(featured.projects ?? [])];
      for (const project of all.projects ?? []) {
        if (picked.length >= 3) break;
        if (!picked.some((p) => (p.slug ?? p.id) === (project.slug ?? project.id))) picked.push(project);
      }
      if (picked.length) setItems(picked);
    });
    return () => { active = false; };
  }, []);

  const shown = items.slice(0, 3);
  if (!shown.length) return null;
  return (
    <div className={cardGrid(shown.length)}>
      {shown.map((project) => <ProjectCard key={project.id || project.slug} project={project} />)}
    </div>
  );
}

/* Home: the three most recent notes. */
export function LatestInsights() {
  const [items, setItems] = useState<Post[]>(defaultPosts as unknown as Post[]);

  useEffect(() => {
    let active = true;
    apiFetch<{ posts: Post[] }>('/public/blog')
      .then((data) => { if (active && data?.posts?.length) setItems(data.posts); })
      .catch(() => { /* keep the existing notes */ });
    return () => { active = false; };
  }, []);

  const shown = items.slice(0, 3);
  if (!shown.length) return null;
  return (
    <div className={cardGrid(shown.length)}>
      {shown.map((post) => <PostCard key={post.id || post.slug} post={post} />)}
    </div>
  );
}

export function ServiceRow({ service }: { service: Service }) {
  const targetHref = service.href || `/services#${service.id}`;
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} className="group grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[#202635]/15 py-6 md:grid-cols-[1.1fr_1.4fr_auto] md:gap-8 md:py-8" data-testid={`row-service-${service.id}`}>
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#c97352]">Advisory Practice</span>
        <Link href={targetHref} className="block mt-1">
          <h3 className="block-title text-[#202635] transition-colors group-hover:text-[#c97352]">{service.title}</h3>
        </Link>
      </div>
      <p className="hidden measure-narrow text-sm leading-6 text-[#202635]/65 md:block">{service.description}</p>
      <Link href={targetHref} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#202635]/25 transition-all group-hover:border-[#c97352] group-hover:bg-[#c97352] group-hover:text-[#f5f0e6]" aria-label={`Explore ${service.title}`} data-testid={`link-service-${service.id}`}><ArrowRight size={15} /></Link>
    </motion.div>
  );
}

export function AreaCard({ area, index, className = 'w-full' }: { area: Area; index: number; className?: string }) {
  return (
    <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} transition={{ delay: index * .08 }} className={`group ${className}`} data-testid={`card-area-${area.id}`}>
      <Link href={`/communities/${area.id}`} className="card-editorial group block p-5" data-testid={`link-area-${area.id}`}>
        <div className="card-media bg-[#202635]">
          <img src={area.image} alt={area.name} loading="lazy" className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-105" data-testid={`img-area-${area.id}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#202635]/85 via-[#202635]/20 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 text-[#f5f0e6]">
            <p className="font-mono text-[10px] uppercase tracking-[.15em] text-[#d9c6a4]">Dubai · Community</p>
            <h3 className="card-title mt-2">{area.name}</h3>
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
  const [phoneValid, setPhoneValid] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const update = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [key]: event.target.value });
  const updatePhone = (change: PhoneChange) => {
    setForm((current) => ({ ...current, phone: change.value }));
    setPhoneValid(change.valid);
  };
  const phoneFieldId = `contact-phone-${inquiryType}${propertySlug ? `-${propertySlug}` : ''}${projectSlug ? `-${projectSlug}` : ''}`;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    setSubmitting(true);
    setError('');
    const cleanedForm = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), interest: form.interest.trim(), message: form.message.trim() };
    if (!cleanedForm.name || !cleanedForm.phone || !cleanedForm.email || !cleanedForm.interest || !cleanedForm.message) {
      setError('Please complete your name, phone, email, requirement, and message.');
      setSubmitting(false);
      return;
    }
    if (!phoneValid) {
      setError('Please check your phone number: it does not match the selected country.');
      setSubmitting(false);
      document.getElementById(phoneFieldId)?.focus();
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
  if (sent) return <div className="rounded-sm border border-[#c97352]/40 bg-[#c97352]/10 p-6 sm:p-8 md:p-10" data-testid="status-contact-success"><Check className="text-[#c97352]" size={26} /><h3 className="block-title mt-6 text-[#202635]">We'll be in touch shortly.</h3><p className="measure-narrow mt-3 text-sm leading-6 text-[#202635]/60">Thank you, {form.name || 'there'}. A member of our advisory team will reach out to understand what you're looking for.</p><button onClick={() => { setSent(false); setAttempted(false); setPhoneValid(false); setForm({ name: '', email: '', phone: '', interest: '', budget: '', propertyType: '', location: '', message: '' }); }} className="mt-7 font-mono text-[10px] uppercase tracking-[.13em] text-[#c97352] line-link" data-testid="button-contact-reset">Send another enquiry</button></div>;
  return (
    <form onSubmit={submit} className={`grid gap-5 ${compact ? '' : 'md:grid-cols-2 md:gap-x-7'}`} data-testid="form-contact">
      <label className="block"><span className="eyebrow text-[#202635]/45">Your name</span><input required value={form.name} onChange={update('name')} className="mt-3 w-full border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="Full name" data-testid="input-contact-name" /></label>
      <label className="block"><span className="eyebrow text-[#202635]/45">Email address</span><input required type="email" value={form.email} onChange={update('email')} className="mt-3 w-full border-b border-[#202635]/25 bg-transparent py-3 text-base outline-none transition-colors placeholder:text-[#202635]/30 focus:border-[#c97352]" placeholder="you@email.com" data-testid="input-contact-email" /></label>
      <div className="block"><label htmlFor={phoneFieldId} className="eyebrow text-[#202635]/45">Phone number</label><PhoneInput id={phoneFieldId} value={form.phone} onChange={updatePhone} defaultCountry={inquiryType === 'india-office' ? 'IN' : 'AE'} required showError={attempted} testId="input-contact-phone" /></div>
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
      <button disabled={submitting} type="submit" className={`btn btn-primary group mt-3 w-full sm:w-fit disabled:cursor-wait disabled:opacity-60 ${compact ? '' : 'md:col-span-2'}`} data-testid="button-contact-submit">{submitting ? 'Sending…' : 'Send enquiry'} <Send size={14} className="transition-transform group-hover:translate-x-1" /></button>
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
  return <form onSubmit={submit} className="flex max-w-md border-b border-[#f5f0e6]/30" data-testid="form-newsletter">
    <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#f5f0e6] outline-none placeholder:text-[#f5f0e6]/40" aria-label="Email address" />
    <button disabled={state === 'sending'} className="flex items-center gap-2 py-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#d9c6a4] hover:text-[#f5f0e6]">{state === 'success' ? 'Joined' : state === 'sending' ? 'Joining…' : 'Subscribe'} <Send size={13} /></button>
    {state === 'error' && <span className="sr-only">Please enter a valid email and try again.</span>}
  </form>;
}

// export function FaqSection({ compact = false }: { compact?: boolean }) {
//   const [open, setOpen] = useState<string | null>(null);
//   return (
//     <section className={`${compact ? 'bg-[#e9e4da]' : 'bg-[#dfe2dc]'} site-section`}>
//       <div className="site-container grid gap-12 md:grid-cols-[.7fr_1.3fr] md:gap-24">
//         <div><SectionLabel>Questions, answered</SectionLabel><h2 className="section-title mt-6">A clearer<br /><em className="text-[#c97352]">first step.</em></h2><p className="mt-7 max-w-sm text-sm leading-7 text-[#202635]/60">A few useful details before we start a conversation about your next move.</p></div>
//         <div className="border-t border-[#202635]/20">
//           {faqs.map((faq) => <div key={faq.question} className="border-b border-[#202635]/20"><button type="button" onClick={() => setOpen(open === faq.question ? null : faq.question)} className="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={open === faq.question}><span className="font-serif text-2xl md:text-3xl">{faq.question}</span><ChevronDown size={18} className={`shrink-0 text-[#c97352] transition-transform ${open === faq.question ? 'rotate-180' : ''}`} /></button>{open === faq.question && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="max-w-2xl overflow-hidden pb-6 text-sm leading-7 text-[#202635]/65">{faq.answer}</motion.p>}</div>)}
//         </div>
//       </div>
//     </section>
//   );
// }


export function FaqSection({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section
      className={`${ compact ? 'bg-[#e9e4da]' : 'bg-[#dfe2dc]' } site-section`}
    >
      <div className="site-container grid gap-10 md:gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 xl:gap-28">

        {/* LEFT CONTENT */}
        <div className="lg:pt-2">
          <SectionLabel>
            Before you enquire
          </SectionLabel>

          <h2 className="section-title mt-6 max-w-xl">
            Your Dubai
            <br />
            <em className="text-[#c97352]">
              property questions.
            </em>
          </h2>

          <p className="body-copy measure-narrow mt-6 text-[#202635]/60">
            A few useful answers about finding, buying and exploring
            property opportunities with KNC Horizon Realtor.
          </p>
        </div>

        {/* FAQ LIST */}
        <div className="border-t border-[#202635]/15">
          {faqs.map((faq) => {
            const isOpen = open === faq.question;

            return (
              <div
                key={faq.question}
                className="border-b border-[#202635]/15"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpen(isOpen ? null : faq.question)
                  }
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                  aria-expanded={isOpen}
                >
                  <span className="block-title max-w-[90%] text-[#202635] transition-colors group-hover:text-[#c97352]">
                    {faq.question}
                  </span>

                  <span
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#202635]/15
                      transition-all
                      duration-300
                      group-hover:border-[#c97352]/50
                    "
                  >
                    <ChevronDown
                      size={17}
                      className={`text-[#c97352] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="measure pb-7 pr-6 text-sm leading-7 text-[#202635]/65 sm:pr-10">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export function PageHero({ label, title, copy, image, children }: { label: string; title: ReactNode; copy: string; image?: string; children?: ReactNode }) {
  return (
    <section className={`page-hero site-gutter relative flex items-end overflow-hidden pb-12 pt-28 md:pb-16 md:pt-36 ${image ? 'bg-[#202635]' : 'bg-[#dfe2dc]'}`}>
      {image && <><img src={image} alt="" loading="eager" fetchPriority="high" className="page-hero-image absolute inset-0 h-full w-full object-cover object-center opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-[#202635]/90 via-[#202635]/20 to-[#202635]/35" /></>}
      <div className="site-container relative z-10">
        <SectionLabel light={!!image}>{label}</SectionLabel>
        <h1 className={`page-title mt-5 max-w-4xl ${image ? 'text-[#f5f0e6]' : 'text-[#202635]'}`}>{title}</h1>
        <p className={`measure mt-5 text-sm leading-relaxed sm:text-base ${image ? 'text-[#f5f0e6]/70' : 'text-[#202635]/65'}`}>{copy}</p>
        {children}
      </div>
    </section>
  );
}

export function ErrorState({ message }: { message: string }) {
  return <div className="border border-[#c97352]/30 bg-[#c97352]/10 p-7 text-sm text-[#202635]/70" role="alert">We couldn’t load this section. {message}</div>;
}
