import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUp, ArrowUpRight, ChevronDown, Menu, Phone, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT } from '@/lib/contact-info';
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

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" data-testid="link-brand-home">
      <span className={`grid h-9 w-9 place-items-center border ${inverse ? 'border-[#d9c6a4]/55 text-[#ead8b8]' : 'border-[#c97352]/60 text-[#c97352]'} transition-colors group-hover:bg-[#c97352] group-hover:text-[#f5f0e6]`}>
        <span className="font-serif text-lg leading-none">K</span>
      </span>
      <span className={`leading-none ${inverse ? 'text-[#f5f0e6]' : 'text-[#202635]'}`}>
        <span className="block font-sans text-[11px] font-semibold tracking-[.27em]">KNC</span>
        <span className="mt-1 block font-mono text-[9px] tracking-[.2em] opacity-70">HORIZON REALTOR</span>
      </span>
    </Link>
  );
}

export function Navbar() {
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
      <header className={`fixed inset-x-0 top-0 z-40 px-5 transition-all duration-500 md:px-10 ${inverse ? 'bg-transparent text-[#f5f0e6]' : 'border-b border-[#d8cdbc]/80 bg-[#f5f0e6]/95 text-[#202635] backdrop-blur-md'} ${scrolled ? 'py-3' : 'py-5'}`}>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6">
          <BrandMark inverse={inverse} />
          <nav ref={navRef} className="hidden items-center gap-5 lg:flex xl:gap-7" aria-label="Primary navigation">
            <Link href="/" className="line-link font-mono text-[10px] uppercase tracking-[.14em] opacity-85 hover:opacity-100" data-testid="link-nav-home">Home</Link>
            
            {/* PROPERTIES */}
            <div className="relative" onMouseEnter={() => setDropdown('properties')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'properties' ? null : 'properties')} aria-haspopup="true" className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'properties'}>Properties <ChevronDown size={12} className={dropdown === 'properties' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
              {dropdown === 'properties' && <div className="absolute left-0 top-full w-48 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{inStock(propertyItems).map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
            </div>

            {/* OFF-PLAN */}
            <div className="relative" onMouseEnter={() => setDropdown('offplan')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'offplan' ? null : 'offplan')} aria-haspopup="true" className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'offplan'}>Off-Plan <ChevronDown size={12} className={dropdown === 'offplan' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
              {dropdown === 'offplan' && <div className="absolute left-0 top-full w-52 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{inStock(offPlanItems).map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
            </div>

            {/* DEVELOPERS */}
            <Link href="/developers" className="line-link font-mono text-[10px] uppercase tracking-[.14em] opacity-85 hover:opacity-100" data-testid="link-nav-developers">Developers</Link>

            {/* COMMUNITIES */}
            <Link href="/communities" className="line-link font-mono text-[10px] uppercase tracking-[.14em] opacity-85 hover:opacity-100" data-testid="link-nav-communities">Communities</Link>

            {/* ABOUT */}
            <div className="relative" onMouseEnter={() => setDropdown('about')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'about' ? null : 'about')} aria-haspopup="true" className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'about'}>About <ChevronDown size={12} className={dropdown === 'about' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
              {dropdown === 'about' && <div className="absolute left-0 top-full w-48 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{aboutItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
            </div>

            {/* INSIGHTS */}
            <div className="relative" onMouseEnter={() => setDropdown('insights')} onMouseLeave={() => setDropdown(null)}>
              <button type="button" onClick={() => setDropdown(dropdown === 'insights' ? null : 'insights')} aria-haspopup="true" className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'insights'}>Insights <ChevronDown size={12} className={dropdown === 'insights' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
              {dropdown === 'insights' && <div className="absolute left-0 top-full w-48 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{insightsItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
            </div>

            {/* CONTACT CTA */}
            <button onClick={goContact} className={`group flex items-center gap-2 border px-4 py-2 font-mono text-[10px] uppercase tracking-[.14em] transition-colors ${inverse ? 'border-[#ead8b8]/60 hover:bg-[#ead8b8] hover:text-[#202635]' : 'border-[#202635]/35 hover:bg-[#202635] hover:text-[#f5f0e6]'}`} data-testid="button-nav-contact">
              Contact <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </nav>
          <button ref={menuButtonRef} className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => open ? closeMenu() : setOpen(true)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
      {/* Rendered outside the header: its backdrop-blur would otherwise trap these fixed layers inside the header box. */}
      <div className={`mobile-menu-backdrop fixed inset-0 z-50 bg-[#202635]/30 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`} onClick={closeMenu} aria-hidden="true" />
      <div className={`mobile-menu-panel fixed inset-y-0 right-0 z-[60] h-[100dvh] w-[85vw] max-w-[380px] overflow-x-hidden overflow-y-auto border-l border-[#d8cdbc]/80 bg-[#f5f0e6] text-[#202635] shadow-2xl transition-[opacity,transform,visibility] duration-300 lg:hidden ${open ? 'visible translate-x-0 opacity-100' : 'invisible pointer-events-none translate-x-full opacity-0'}`} aria-hidden={!open}>
        <div className="flex items-center justify-between border-b border-[#202635]/10 px-4 py-3">
          <p className="eyebrow text-[#c97352]">Navigation</p>
          <button type="button" onClick={closeMenu} className="grid h-9 w-9 place-items-center border border-[#202635]/15" aria-label="Close menu"><X size={16} /></button>
        </div>
        <nav className="flex min-h-[calc(100dvh-4.5rem)] flex-col gap-1 p-3" aria-label="Mobile navigation">
          <Link href="/" onClick={closeMenu} className="rounded-sm px-3 py-2 font-serif text-[1.2rem] leading-none transition-colors hover:bg-[#e9e4da]" data-testid="link-mobile-home">Home</Link>
          
          {/* PROPERTIES ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'properties' ? null : 'properties')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'properties'}>Properties <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'properties' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'properties' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{inStock(propertyItems).map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>

          {/* OFF-PLAN ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'offplan' ? null : 'offplan')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'offplan'}>Off-Plan <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'offplan' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'offplan' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{inStock(offPlanItems).map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>

          {/* DEVELOPERS */}
          <Link href="/developers" onClick={closeMenu} className="mt-2 block border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" data-testid="link-mobile-developers">Developers</Link>

          {/* COMMUNITIES */}
          <Link href="/communities" onClick={closeMenu} className="mt-2 block border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" data-testid="link-mobile-communities">Communities</Link>

          {/* ABOUT ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'about' ? null : 'about')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'about'}>About <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'about' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'about' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{aboutItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>

          {/* INSIGHTS ACCORDION */}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'insights' ? null : 'insights')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'insights'}>Insights <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'insights' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'insights' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{insightsItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>

          {/* CONTACT & WHATSAPP */}
          <button onClick={goContact} className="mt-4 flex min-h-10 w-full items-center justify-between border border-[#202635]/30 px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.12em]" data-testid="button-mobile-contact">Contact us <ArrowUpRight size={13} /></button>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 flex min-h-10 items-center justify-between border-t border-[#202635]/10 px-3 pt-3 text-sm" data-testid="link-mobile-whatsapp"><span className="flex items-center gap-2"><FaWhatsapp size={18} className="text-[#55735f]" /> WhatsApp us</span><ArrowUpRight size={13} /></a>
          <div className="mt-3 flex gap-3 border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.58rem] uppercase tracking-[.1em] text-[#202635]/55"><Link href="/terms-and-conditions" onClick={closeMenu} data-testid="link-mobile-terms">Terms & Conditions</Link><Link href="/privacy-policy" onClick={closeMenu} data-testid="link-mobile-privacy">Privacy Policy</Link></div>
        </nav>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#202635] px-5 py-16 text-[#f5f0e6] md:px-10 md:py-20">
      <div className="mx-auto max-w-[1280px]">

        {/* Main Footer Grid: 2-up links on phones, 4-up on tablets, full 5 columns on desktop */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-[#f5f0e6]/15 pb-14 md:grid-cols-4 md:gap-y-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_1.1fr] lg:gap-8">

          {/* Brand & Introduction */}
          <div className="col-span-full lg:col-span-1">
            <BrandMark inverse />
            <p className="mt-6 max-w-sm font-serif text-2xl leading-snug text-[#d9c6a4] md:text-3xl">
              A more considered way to move through Dubai.
            </p>
            <p className="mt-4 max-w-sm text-xs leading-5 text-[#f5f0e6]/55">
              Independent property advisory for considered decisions across Dubai and the UAE.
            </p>
          </div>

          {/* Properties & Off-Plan */}
          <div>
            <p className="eyebrow text-[#c97352]">Properties</p>
            <div className="mt-4 flex flex-col items-start gap-2.5 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">
              <Link href="/properties/sale" className="line-link hover:text-[#f5f0e6]">For Sale</Link>
              <Link href="/properties/rent" className="line-link hover:text-[#f5f0e6]">For Rent</Link>
              <Link href="/off-plan" className="line-link hover:text-[#f5f0e6]">Off-Plan</Link>
              <Link href="/properties" className="line-link hover:text-[#f5f0e6]">All Properties</Link>
              <div className="my-1 border-t border-[#f5f0e6]/10 w-full" />
              <p className="eyebrow text-[#c97352]">Off-Plan</p>
              <Link href="/off-plan/new-launches" className="line-link hover:text-[#f5f0e6]">New Launches</Link>
              <Link href="/off-plan/apartments" className="line-link hover:text-[#f5f0e6]">Apartments</Link>
              <Link href="/off-plan/villas-townhouses" className="line-link hover:text-[#f5f0e6]">Villas & Townhouses</Link>
              <Link href="/off-plan/developers" className="line-link hover:text-[#f5f0e6]">By Developer</Link>
            </div>
          </div>

          {/* Developers & Communities */}
          <div>
            <p className="eyebrow text-[#c97352]">Explore</p>
            <div className="mt-4 flex flex-col items-start gap-2.5 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">
              <Link href="/developers" className="line-link hover:text-[#f5f0e6]">Developers</Link>
              <Link href="/communities" className="line-link hover:text-[#f5f0e6]">Communities</Link>
              <div className="my-1 border-t border-[#f5f0e6]/10 w-full" />
              <p className="eyebrow text-[#c97352]">About</p>
              <Link href="/about" className="line-link hover:text-[#f5f0e6]">About KNC</Link>
              <Link href="/about/approach" className="line-link hover:text-[#f5f0e6]">Our Approach</Link>
              <Link href="/about/india-office" className="line-link hover:text-[#f5f0e6]">India Office</Link>
            </div>
          </div>

          {/* Insights & Offices: separate grid cells below lg, one stacked column on desktop */}
          <div className="contents lg:block">
            <div>
              <p className="eyebrow text-[#c97352]">Insights</p>
              <div className="mt-4 flex flex-col items-start gap-2.5 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">
                <Link href="/blog" className="line-link hover:text-[#f5f0e6]">Blog</Link>
                <Link href="/market-insights" className="line-link hover:text-[#f5f0e6]">Market Insights</Link>
                <Link href="/gallery" className="line-link hover:text-[#f5f0e6]">Gallery</Link>
                <Link href="/contact" className="line-link hover:text-[#f5f0e6]">Contact Us</Link>
              </div>
            </div>

            <div className="lg:mt-6">
              <p className="eyebrow text-[#c97352]">Offices</p>
              <div className="mt-3 space-y-3 text-xs text-[#f5f0e6]/60">
                <div>
                  <p className="font-serif text-sm text-[#f5f0e6]">Dubai</p>
                  <p className="text-[11px] text-[#f5f0e6]/50">Dubai, UAE</p>
                </div>
                <div>
                  <p className="font-serif text-sm text-[#f5f0e6]">India</p>
                  <p className="text-[11px] text-[#f5f0e6]/50">DLF Phase 1, Gurugram</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Informed & Direct Contact */}
          <div className="col-span-full lg:col-span-1">
            <p className="eyebrow text-[#c97352]">Stay Informed</p>
            <p className="mt-3 text-xs leading-5 text-[#f5f0e6]/60">
              Receive curated notes on prime Dubai residential & investment opportunities.
            </p>
            <div className="mt-2">
              <NewsletterForm />
            </div>

            <div className="mt-6 space-y-2.5">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="flex items-center gap-2 font-serif text-lg text-[#f5f0e6] transition-colors hover:text-[#d9c6a4]"
                data-testid="link-footer-phone"
              >
                <Phone size={14} />
                {CONTACT.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#d9c6a4] transition-colors hover:text-white"
                data-testid="link-footer-whatsapp"
              >
                <FaWhatsapp size={14} className="text-[#25D366]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 flex flex-col items-start gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/50">
              <Link href="/terms-and-conditions" className="line-link hover:text-[#f5f0e6]">Terms & Conditions</Link>
              <Link href="/privacy-policy" className="line-link hover:text-[#f5f0e6]">Privacy Policy</Link>
            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-3 pt-7 font-mono text-[10px] uppercase leading-5 tracking-[.14em] text-[#f5f0e6]/40 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
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
    <div className="grain min-h-[100dvh] overflow-x-hidden">

      <Navbar />

      {children}

      <Footer />

      {/* Floating WhatsApp Action Button - Icon Only, Fixed Bottom Right */}
      <a
        href={`https://wa.me/${CONTACT.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full md:bottom-6 md:right-6 md:h-14 md:w-14 bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-[0_12px_28px_rgba(37,211,102,0.5)] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
        aria-label="Chat with KNC Horizon property advisor on WhatsApp"
        title="Chat with our Dubai property advisor on WhatsApp"
        data-testid="floating-whatsapp-btn"
      >
        <div className="relative flex items-center justify-center">
          <FaWhatsapp className="h-6 w-6 transition-transform duration-300 group-hover:scale-105 md:h-7 md:w-7" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100"></span>
          </span>
        </div>
      </a>

      {/* Back to top button */}
      {showTop && (
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-30 grid h-11 w-11 place-items-center md:bottom-6 md:left-6 md:h-12 md:w-12 rounded-full bg-[#202635] text-[#f5f0e6] shadow-lg transition-transform hover:scale-105"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp size={16} />
        </button>
      )}

    </div>
  );
}
