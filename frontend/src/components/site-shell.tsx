import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUp, ArrowUpRight, ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube, FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { SOCIAL } from '@/lib/contact-info';
import { useContact } from '@/lib/site-settings';
import { NewsletterForm } from '@/components/blocks';
import { apiFetch } from '@/lib/api';
import { categoryOf, projectSegment, isNewLaunchProject, type SearchRow } from '@/lib/property-search';
import type { Project } from '@/lib/api';

type NavItem = { label: string; href: string; needs?: 'sale' | 'rent' | 'commercial' | 'newLaunch' | 'apartments' | 'villas' };

const propertyItems: NavItem[] = [
  { label: 'For Sale', href: '/properties/sale', needs: 'sale' },
  { label: 'For Rent', href: '/properties/rent', needs: 'rent' },
  { label: 'Commercial', href: '/properties/commercial', needs: 'commercial' },
  { label: 'All Properties', href: '/properties' },
];

const offPlanItems: NavItem[] = [
  { label: 'New Launches', href: '/off-plan/new-launches', needs: 'newLaunch' },
  { label: 'Apartments', href: '/off-plan/apartments', needs: 'apartments' },
  { label: 'Villas & Townhouses', href: '/off-plan/villas-townhouses', needs: 'villas' },
  { label: 'By Developer', href: '/off-plan/developers' },
  { label: 'All Off-Plan', href: '/off-plan' },
];

/*
 * A menu entry that would open an empty page is worse than no entry, so the ones that depend
 * on stock are hidden until something is published behind them. Everything is optimistic
 * until the two calls answer, so the menu never flickers items away on a slow connection.
 */
function useStockedNav() {
  const [stock, setStock] = useState<Record<string, boolean>>({});
  useEffect(() => {
    let live = true;
    Promise.all([
      apiFetch<{ listings: SearchRow[] }>('/public/property-filters').catch(() => ({ listings: [] as SearchRow[] })),
      apiFetch<{ projects: Project[] }>('/public/projects').catch(() => ({ projects: [] as Project[] })),
    ]).then(([rows, projects]) => {
      if (!live) return;
      const listings = rows.listings ?? [];
      const list = projects.projects ?? [];
      if (!listings.length && !list.length) return; // both calls failed: leave everything shown
      setStock({
        sale: listings.some((row) => row.mode === 'buy'),
        rent: listings.some((row) => row.mode === 'rent'),
        commercial: listings.some((row) => row.mode !== 'offplan' && categoryOf(row.type) === 'Commercial'),
        newLaunch: list.some(isNewLaunchProject),
        apartments: list.some((project) => projectSegment(project) === 'apartments'),
        villas: list.some((project) => projectSegment(project) === 'villas'),
      });
    });
    return () => { live = false; };
  }, []);
  return (items: NavItem[]) => items.filter((item) => !item.needs || stock[item.needs] !== false);
}

const aboutItems = [
  { label: 'About KNC', href: '/about' },
  { label: 'Our Approach', href: '/about/approach' },
  { label: 'India Office', href: '/about/india-office' },
];

const insightsItems = [
  { label: 'Blog', href: '/blog' },
  { label: 'Market Insights', href: '/market-insights' },
  { label: 'Gallery', href: '/gallery' },
];

/*
 * The KNC Horizon Realtor logo (public/brand). Both colourways stay mounted so the header can
 * cross-fade from the ivory logo over the hero photo to the navy one once it turns solid.
 * Between 1024px and 1279px the full desktop menu leaves no room for the wordmark, so the
 * header shows the KNC emblem alone there.
 */
const EMBLEM_ONLY = '(min-width: 1024px) and (max-width: 1279.98px)';

export function BrandMark({ inverse = false, stacked = false }: { inverse?: boolean; stacked?: boolean }) {
  const kind = stacked ? 'stacked' : 'horizontal';
  const size = stacked ? 'h-24 w-auto' : 'h-8 w-auto sm:h-9 lg:h-10 xl:h-9 2xl:h-10';
  const logo = (tone: '' | '-light', className: string) => (
    <picture>
      {!stacked && <source media={EMBLEM_ONLY} srcSet={`/brand/knc-logo-emblem${tone}.svg`} />}
      <img src={`/brand/knc-logo-${kind}${tone}.svg`} alt="" className={`${size} transition-opacity duration-500 ${className}`} />
    </picture>
  );
  return (
    <Link href="/" className="relative inline-flex shrink-0 items-center transition-opacity hover:opacity-85" aria-label="KNC Horizon Realtor home" data-testid="link-brand-home">
      {logo('', inverse ? 'opacity-0' : 'opacity-100')}
      {logo('-light', `absolute left-0 top-0 ${inverse ? 'opacity-100' : 'opacity-0'}`)}
    </Link>
  );
}

export function Navbar() {
  const contact = useContact();
  const inStock = useStockedNav();
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<'properties' | 'offplan' | 'about' | 'insights' | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<'properties' | 'offplan' | 'about' | 'insights' | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const isHome = location === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Desktop dropdowns close on Escape or a click outside the nav
  useEffect(() => {
    if (!dropdown) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setDropdown(null);
    };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setDropdown(null); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dropdown]);

  // Route changes close any open menu
  useEffect(() => { setDropdown(null); }, [location]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setMobileAccordion(null);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  };

  const inverse = isHome && !scrolled && !open;
  const goContact = () => {
    closeMenu();
    setLocation('/contact');
  };

  return (
    <>
      <header className={`site-gutter fixed inset-x-0 top-0 z-40 transition-all duration-500 ${inverse ? 'bg-transparent text-[#faf7f1]' : 'border-b border-[#e6dccb]/80 bg-[#faf7f1]/95 text-[#2b3242] shadow-[0_12px_30px_-26px_rgba(43,50,66,0.45)] backdrop-blur-md'} ${scrolled ? 'py-3' : 'py-4 md:py-5'}`}>
        <div className="site-container flex items-center justify-between gap-6">
          <BrandMark inverse={inverse} />
          <nav ref={navRef} className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Primary navigation">
            <Link href="/" className="line-link flex items-center whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" data-testid="link-nav-home">Home</Link>
            
            {/* PROPERTIES */}
            <div className="relative py-3 -my-3" onMouseEnter={() => setDropdown('properties')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'properties' ? null : 'properties')} aria-haspopup="true" className="line-link flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'properties'}>Properties <ChevronDown size={12} aria-hidden="true" className={dropdown === 'properties' ? '-mt-px rotate-180 transition-transform' : '-mt-px transition-transform'} /></button>
              {dropdown === 'properties' && <div className="nav-dropdown absolute left-0 top-full w-56 border border-[#e6dccb] bg-[#fffdf8] p-2 text-[#2b3242]">{inStock(propertyItems).map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[#f2ede4] hover:text-[#80623a]">{item.label}</Link>)}</div>}
            </div>

            {/* OFF-PLAN */}
            <div className="relative py-3 -my-3" onMouseEnter={() => setDropdown('offplan')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'offplan' ? null : 'offplan')} aria-haspopup="true" className="line-link flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'offplan'}>Off-Plan <ChevronDown size={12} aria-hidden="true" className={dropdown === 'offplan' ? '-mt-px rotate-180 transition-transform' : '-mt-px transition-transform'} /></button>
              {dropdown === 'offplan' && <div className="nav-dropdown absolute left-0 top-full w-60 border border-[#e6dccb] bg-[#fffdf8] p-2 text-[#2b3242]">{inStock(offPlanItems).map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[#f2ede4] hover:text-[#80623a]">{item.label}</Link>)}</div>}
            </div>

            {/* DEVELOPERS */}
            <Link href="/developers" className="line-link flex items-center whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" data-testid="link-nav-developers">Developers</Link>

            {/* COMMUNITIES */}
            <Link href="/communities" className="line-link flex items-center whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" data-testid="link-nav-communities">Communities</Link>

            {/* ABOUT */}
            <div className="relative py-3 -my-3" onMouseEnter={() => setDropdown('about')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'about' ? null : 'about')} aria-haspopup="true" className="line-link flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'about'}>About <ChevronDown size={12} aria-hidden="true" className={dropdown === 'about' ? '-mt-px rotate-180 transition-transform' : '-mt-px transition-transform'} /></button>
              {dropdown === 'about' && <div className="nav-dropdown absolute left-0 top-full w-56 border border-[#e6dccb] bg-[#fffdf8] p-2 text-[#2b3242]">{aboutItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[#f2ede4] hover:text-[#80623a]">{item.label}</Link>)}</div>}
            </div>

            {/* INSIGHTS */}
            <div className="relative py-3 -my-3" onMouseEnter={() => setDropdown('insights')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'insights' ? null : 'insights')} aria-haspopup="true" className="line-link flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium uppercase leading-none tracking-[.06em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'insights'}>Insights <ChevronDown size={12} aria-hidden="true" className={dropdown === 'insights' ? '-mt-px rotate-180 transition-transform' : '-mt-px transition-transform'} /></button>
              {dropdown === 'insights' && <div className="nav-dropdown absolute left-0 top-full w-56 border border-[#e6dccb] bg-[#fffdf8] p-2 text-[#2b3242]">{insightsItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[#f2ede4] hover:text-[#80623a]">{item.label}</Link>)}</div>}
            </div>

            {/* CONTACT CTA */}
            <button onClick={goContact} className={`btn group ml-1 min-h-9 gap-2 border px-4 py-2.5 ${inverse ? 'border-[#ead8b8]/60 text-[#faf7f1] hover:bg-[#ead8b8] hover:text-[#2b3242]' : 'border-[#2b3242]/35 text-[#2b3242] hover:bg-[#2b3242] hover:text-[#faf7f1]'}`} data-testid="button-nav-contact">
              Contact us <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </nav>
          <button ref={menuButtonRef} className="-mr-2 grid h-11 w-11 place-items-center lg:hidden" onClick={() => open ? closeMenu() : setOpen(true)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      {/* Rendered outside the header: its backdrop-blur would otherwise trap these fixed layers inside the header box. */}
      <div className={`mobile-menu-backdrop fixed inset-0 z-50 bg-[#2b3242]/30 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`} onClick={closeMenu} aria-hidden="true" />
      <div className={`mobile-menu-panel fixed inset-y-0 right-0 z-[60] h-[100dvh] w-[85vw] max-w-[380px] overflow-x-hidden overflow-y-auto border-l border-[#e6dccb]/80 bg-[#faf7f1] text-[#2b3242] shadow-2xl transition-[opacity,transform,visibility] duration-300 lg:hidden ${open ? 'visible translate-x-0 opacity-100' : 'invisible pointer-events-none translate-x-full opacity-0'}`} aria-hidden={!open}>
        <div className="flex items-center justify-between border-b border-[#2b3242]/10 px-4 py-3">
          <p className="eyebrow text-[#9f7a47]">Navigation</p>
          <button type="button" onClick={closeMenu} className="grid h-9 w-9 place-items-center rounded-full border border-[#2b3242]/15" aria-label="Close menu"><X size={16} /></button>
        </div>
        <nav className="flex min-h-[calc(100dvh-4.5rem)] flex-col gap-1 p-3" aria-label="Mobile navigation">
          <Link href="/" onClick={closeMenu} className="block px-3 pb-1 pt-2 text-[15px] font-medium text-[#2b3242]" data-testid="link-mobile-home">Home</Link>
          
          {/* PROPERTIES ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'properties' ? null : 'properties')} className="mt-2 flex w-full items-center justify-between border-t border-[#2b3242]/10 px-3 pt-3 text-[15px] font-medium text-[#2b3242]" aria-expanded={mobileAccordion === 'properties'}>Properties <ChevronDown size={14} className={`text-[#9f7a47] transition-transform ${mobileAccordion === 'properties' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'properties' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#9f7a47]/35 pl-2">{inStock(propertyItems).map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-[14px] text-[#2b3242]/80 transition-colors hover:bg-[#f2ede4] hover:text-[#2b3242]">{item.label}</Link>)}</div></div>

          {/* OFF-PLAN ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'offplan' ? null : 'offplan')} className="mt-2 flex w-full items-center justify-between border-t border-[#2b3242]/10 px-3 pt-3 text-[15px] font-medium text-[#2b3242]" aria-expanded={mobileAccordion === 'offplan'}>Off-Plan <ChevronDown size={14} className={`text-[#9f7a47] transition-transform ${mobileAccordion === 'offplan' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'offplan' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#9f7a47]/35 pl-2">{inStock(offPlanItems).map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-[14px] text-[#2b3242]/80 transition-colors hover:bg-[#f2ede4] hover:text-[#2b3242]">{item.label}</Link>)}</div></div>

          {/* DEVELOPERS */}
          <Link href="/developers" onClick={closeMenu} className="mt-2 block border-t border-[#2b3242]/10 px-3 pt-3 text-[15px] font-medium text-[#2b3242]" data-testid="link-mobile-developers">Developers</Link>

          {/* COMMUNITIES */}
          <Link href="/communities" onClick={closeMenu} className="mt-2 block border-t border-[#2b3242]/10 px-3 pt-3 text-[15px] font-medium text-[#2b3242]" data-testid="link-mobile-communities">Communities</Link>

          {/* ABOUT ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'about' ? null : 'about')} className="mt-2 flex w-full items-center justify-between border-t border-[#2b3242]/10 px-3 pt-3 text-[15px] font-medium text-[#2b3242]" aria-expanded={mobileAccordion === 'about'}>About <ChevronDown size={14} className={`text-[#9f7a47] transition-transform ${mobileAccordion === 'about' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'about' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#9f7a47]/35 pl-2">{aboutItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-[14px] text-[#2b3242]/80 transition-colors hover:bg-[#f2ede4] hover:text-[#2b3242]">{item.label}</Link>)}</div></div>

          {/* INSIGHTS ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'insights' ? null : 'insights')} className="mt-2 flex w-full items-center justify-between border-t border-[#2b3242]/10 px-3 pt-3 text-[15px] font-medium text-[#2b3242]" aria-expanded={mobileAccordion === 'insights'}>Insights <ChevronDown size={14} className={`text-[#9f7a47] transition-transform ${mobileAccordion === 'insights' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'insights' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#9f7a47]/35 pl-2">{insightsItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-[14px] text-[#2b3242]/80 transition-colors hover:bg-[#f2ede4] hover:text-[#2b3242]">{item.label}</Link>)}</div></div>

          {/* CONTACT & WHATSAPP */}
          <button onClick={goContact} className="mt-auto flex min-h-12 w-full items-center justify-between rounded-full bg-[#2b3242] px-5 py-2 text-[13px] font-semibold uppercase tracking-[.08em] text-[#faf7f1] transition-colors hover:bg-[#8f6d3f]" data-testid="button-mobile-contact">Contact us <ArrowUpRight size={13} /></button>
          <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="mt-2 flex min-h-11 items-center justify-between border-t border-[#2b3242]/10 px-3 pt-3 text-sm" data-testid="link-mobile-whatsapp"><span className="flex items-center gap-2"><FaWhatsapp size={18} className="text-[#55735f]" /> WhatsApp us</span><ArrowUpRight size={13} /></a>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#2b3242]/10 px-3 pb-2 pt-3 font-mono text-[11px] uppercase tracking-[.1em] text-[#2b3242]/65"><Link href="/terms-and-conditions" onClick={closeMenu} data-testid="link-mobile-terms">Terms & Conditions</Link><Link href="/privacy-policy" onClick={closeMenu} data-testid="link-mobile-privacy">Privacy Policy</Link></div>
        </nav>
      </div>
    </>
  );
}

/*
 * Social links. WhatsApp and email always appear because they are built from the numbers in
 * contact-info; the rest only appear once a profile URL is filled in there, so the footer
 * never shows an icon that leads nowhere.
 */
function SocialLinks() {
  const contact = useContact();
  const links = [
    { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${contact.whatsapp}`, icon: <FaWhatsapp size={15} /> },
    { key: 'instagram', label: 'Instagram', href: SOCIAL.instagram, icon: <FaInstagram size={15} /> },
    { key: 'facebook', label: 'Facebook', href: SOCIAL.facebook, icon: <FaFacebookF size={14} /> },
    { key: 'linkedin', label: 'LinkedIn', href: SOCIAL.linkedin, icon: <FaLinkedinIn size={14} /> },
    { key: 'youtube', label: 'YouTube', href: SOCIAL.youtube, icon: <FaYoutube size={15} /> },
    { key: 'x', label: 'X', href: SOCIAL.x, icon: <FaXTwitter size={14} /> },
    { key: 'tiktok', label: 'TikTok', href: SOCIAL.tiktok, icon: <FaTiktok size={14} /> },
  ].filter((link) => Boolean(link.href));

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="footer-social">
      {links.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target={link.href.startsWith('http') ? '_blank' : undefined}
          rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
          aria-label={link.label}
          title={link.label}
          data-testid={`link-social-${link.key}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-[#faf7f1]/20 text-[#faf7f1]/75 transition-colors hover:border-[#d9c6a4] hover:bg-[#d9c6a4] hover:text-[#2b3242]"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

export function Footer() {
  const contact = useContact();
  return (
    <footer className="site-section border-t border-[#d9c6a4]/20 bg-[#262d3b] text-[#faf7f1]">
      <div className="site-container">

        {/* Main Footer Grid: 2-up links on phones, 4-up on tablets, full 5 columns on desktop */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-[#faf7f1]/15 pb-14 md:grid-cols-4 lg:grid-cols-[1.25fr_0.85fr_0.85fr_0.85fr_1.2fr] lg:gap-x-10 lg:gap-y-0">

          {/* Brand & Introduction */}
          <div className="col-span-full lg:col-span-1">
            <BrandMark inverse stacked />
            <p className="block-title mt-7 max-w-sm text-[#d9c6a4]">
              A more considered way to move through Dubai.
            </p>
            <p className="mt-4 max-w-sm text-xs leading-5 text-[#faf7f1]/55">
              Independent property advisory for considered decisions across Dubai and the UAE.
            </p>
          </div>

          {/* Properties & Off-Plan */}
          <div>
            <p className="eyebrow text-[#9f7a47]">Properties</p>
            <div className="mt-4 flex flex-col items-start gap-2.5 font-mono text-[11px] uppercase tracking-[.13em] text-[#faf7f1]/70">
              <Link href="/properties/sale" className="line-link hover:text-[#faf7f1]">For Sale</Link>
              <Link href="/properties/rent" className="line-link hover:text-[#faf7f1]">For Rent</Link>
              <Link href="/off-plan" className="line-link hover:text-[#faf7f1]">Off-Plan</Link>
              <Link href="/properties" className="line-link hover:text-[#faf7f1]">All Properties</Link>
              <div className="my-1 border-t border-[#faf7f1]/10 w-full" />
              <p className="eyebrow text-[#9f7a47]">Off-Plan</p>
              <Link href="/off-plan/new-launches" className="line-link hover:text-[#faf7f1]">New Launches</Link>
              <Link href="/off-plan/apartments" className="line-link hover:text-[#faf7f1]">Apartments</Link>
              <Link href="/off-plan/villas-townhouses" className="line-link hover:text-[#faf7f1]">Villas & Townhouses</Link>
              <Link href="/off-plan/developers" className="line-link hover:text-[#faf7f1]">By Developer</Link>
            </div>
          </div>

          {/* Developers & Communities */}
          <div>
            <p className="eyebrow text-[#9f7a47]">Explore</p>
            <div className="mt-4 flex flex-col items-start gap-2.5 font-mono text-[11px] uppercase tracking-[.13em] text-[#faf7f1]/70">
              <Link href="/developers" className="line-link hover:text-[#faf7f1]">Developers</Link>
              <Link href="/communities" className="line-link hover:text-[#faf7f1]">Communities</Link>
              <div className="my-1 border-t border-[#faf7f1]/10 w-full" />
              <p className="eyebrow text-[#9f7a47]">About</p>
              <Link href="/about" className="line-link hover:text-[#faf7f1]">About KNC</Link>
              <Link href="/about/approach" className="line-link hover:text-[#faf7f1]">Our Approach</Link>
              <Link href="/about/india-office" className="line-link hover:text-[#faf7f1]">India Office</Link>
            </div>
          </div>

          {/* Insights & Offices: separate grid cells below lg, one stacked column on desktop */}
          <div className="contents lg:block">
            <div>
              <p className="eyebrow text-[#9f7a47]">Insights</p>
              <div className="mt-4 flex flex-col items-start gap-2.5 font-mono text-[11px] uppercase tracking-[.13em] text-[#faf7f1]/70">
                <Link href="/blog" className="line-link hover:text-[#faf7f1]">Blog</Link>
                <Link href="/market-insights" className="line-link hover:text-[#faf7f1]">Market Insights</Link>
                <Link href="/gallery" className="line-link hover:text-[#faf7f1]">Gallery</Link>
                <Link href="/contact" className="line-link hover:text-[#faf7f1]">Contact Us</Link>
              </div>
            </div>

            <div className="lg:mt-6">
              <p className="eyebrow text-[#9f7a47]">Offices</p>
              <div className="mt-3 space-y-3 text-xs text-[#faf7f1]/60">
                <div>
                  <p className="font-serif text-sm text-[#faf7f1]">Dubai</p>
                  <p className="text-[11px] text-[#faf7f1]/50">Dubai, UAE</p>
                </div>
                <div>
                  <p className="font-serif text-sm text-[#faf7f1]">India</p>
                  <p className="text-[11px] text-[#faf7f1]/50">DLF Phase 1, Gurugram</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Informed & Direct Contact */}
          <div className="col-span-full lg:col-span-1">
            <p className="eyebrow text-[#9f7a47]">Stay Informed</p>
            <p className="mt-3 text-xs leading-5 text-[#faf7f1]/60">
              Receive curated notes on prime Dubai residential & investment opportunities.
            </p>
            <div className="mt-5">
              <NewsletterForm />
            </div>

            <div className="mt-8 border-t border-[#faf7f1]/15 pt-6">
              <p className="eyebrow text-[#9f7a47]">Speak to an advisor</p>
              <a
                href={`tel:${contact.phoneHref}`}
                className="block-title mt-3 flex items-center gap-2.5 text-[#faf7f1] transition-colors hover:text-[#d9c6a4]"
                data-testid="link-footer-phone"
              >
                <Phone size={17} className="shrink-0 text-[#d9c6a4]" />
                {contact.phoneDisplay}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="mt-2.5 inline-flex items-center gap-2 text-xs text-[#faf7f1]/65 transition-colors hover:text-[#d9c6a4]"
                data-testid="link-footer-email"
              >
                <Mail size={13} className="shrink-0 text-[#d9c6a4]/70" />
                {contact.email}
              </a>
              <p className="mt-2 text-[11px] leading-5 text-[#faf7f1]/45">{contact.studioHours}</p>

              <div className="mt-5">
                <SocialLinks />
              </div>
            </div>

            <div className="mt-6 flex flex-col items-start gap-2 font-mono text-[11px] uppercase tracking-[.13em] text-[#faf7f1]/50">
              <Link href="/terms-and-conditions" className="line-link hover:text-[#faf7f1]">Terms & Conditions</Link>
              <Link href="/privacy-policy" className="line-link hover:text-[#faf7f1]">Privacy Policy</Link>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-2.5 pt-8 font-mono text-[11px] uppercase leading-5 tracking-[.14em] text-[#faf7f1]/40 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <span data-testid="text-footer-copyright">
            © 2026 KNC Horizon Realtor · Dubai, UAE
          </span>
          <span>
            India Office: DLF Phase 1, Gurugram, Haryana, India
          </span>
          <span>
            Private property advisory
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const contact = useContact();
  const [location] = useLocation();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (location === '/admin' || location.startsWith('/admin/')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] overflow-x-clip">

      <Navbar />

      {children}

      <Footer />

      {/*
       * The floating actions, bottom-right on every route: WhatsApp always, back-to-top once
       * the page has scrolled. One column, so the two share a centre line and cannot overlap
       * however their sizes differ. It sits clear of the page gutter and of the safe area on
       * phones, so it never covers a card, a price or a form field.
       */}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-center gap-3 md:bottom-6 md:right-6">
        {showTop && (
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="grid h-11 w-11 place-items-center rounded-full bg-[#2b3242] text-[#faf7f1] shadow-[0_10px_24px_-10px_rgba(43,50,66,0.5)] ring-1 ring-[#faf7f1]/20 transition-colors hover:bg-[#8f6d3f] md:h-12 md:w-12"
            aria-label="Scroll to top"
            title="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        )}

        <a
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1fa855] text-[#fffdf8] shadow-[0_10px_24px_-10px_rgba(43,50,66,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1b934b] hover:shadow-[0_14px_28px_-12px_rgba(43,50,66,0.55)] focus:outline-none focus:ring-4 focus:ring-[#1fa855]/25 md:h-14 md:w-14"
          aria-label="Chat with KNC Horizon property advisor on WhatsApp"
          title="Chat with our Dubai property advisor on WhatsApp"
          data-testid="floating-whatsapp-btn"
        >
          <FaWhatsapp className="h-6 w-6 md:h-7 md:w-7" />
        </a>
      </div>

    </div>
  );
}
