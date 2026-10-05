import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUp, ArrowUpRight, ChevronDown, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube, FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { SOCIAL } from '@/lib/contact-info';
import { useContact } from '@/lib/site-settings';
import { BRAND_LOGO, BRAND_MARK } from '@/lib/brand';
import { optimizedImage } from '@/lib/cloudinary-image';
import { NewsletterForm } from '@/components/blocks';
import { apiFetch } from '@/lib/api';
import { categoryOf, projectSegments, isNewLaunchProject, type SearchRow } from '@/lib/property-search';
import type { Project } from '@/lib/api';

type NavItem = { label: string; href: string; needs?: 'sale' | 'rent' | 'residential' | 'commercial' | 'newLaunch' | 'apartments' | 'villas' };

/* The three short promises in the top bar, left of centre on laptop and desktop screens. */
const TOP_BAR_PROMISES = ['Exclusive Properties', 'Trusted Advisory', 'Your Dubai Real Estate Partner'];

const propertyItems: NavItem[] = [
  { label: 'For Sale', href: '/properties/sale', needs: 'sale' },
  { label: 'For Rent', href: '/properties/rent', needs: 'rent' },
  { label: 'Residential', href: '/properties/residential', needs: 'residential' },
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
// One lookup per page load, shared by the menu and the footer.
let stockPromise: Promise<Record<string, boolean>> | null = null;

function loadStock() {
  stockPromise ??= Promise.all([
    apiFetch<{ listings: SearchRow[] }>('/public/property-filters').catch(() => ({ listings: [] as SearchRow[] })),
    apiFetch<{ projects: Project[] }>('/public/projects').catch(() => ({ projects: [] as Project[] })),
  ]).then(([rows, projects]): Record<string, boolean> => {
    const listings = rows.listings ?? [];
    const list = projects.projects ?? [];
    if (!listings.length && !list.length) return {}; // both calls failed: leave everything shown
    return {
      sale: listings.some((row) => row.mode === 'buy'),
      rent: listings.some((row) => row.mode === 'rent'),
      residential: listings.some((row) => row.mode !== 'offplan' && categoryOf(row.type) === 'Residential'),
      commercial: listings.some((row) => row.mode !== 'offplan' && categoryOf(row.type) === 'Commercial'),
      newLaunch: list.some(isNewLaunchProject),
      apartments: list.some((project) => projectSegments(project).apartments),
      villas: list.some((project) => projectSegments(project).villas),
    };
  });
  return stockPromise;
}

function useStockedNav() {
  const [stock, setStock] = useState<Record<string, boolean>>({});
  useEffect(() => {
    let live = true;
    loadStock().then((next) => { if (live) setStock(next); });
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
 * The logo, linked home.
 * `large` (footer): the full golden emblem, 96px tall, where there is room for its wordmark.
 * Otherwise (header): the emblem's own arrangement, kept legible at menu-bar height: the KNC
 * mark with the skyline on top (28px on phones, 34px from tablets up) and the name set in type
 * under it, centred, in the emblem's manner: bold caps, then REALTOR letter-spaced between two
 * hairlines that fill the width of the name above, as on the emblem itself. `inverse`
 * is the header over the dark home hero, where the type turns light gold; on the ivory header
 * it is the site's gold. The owner wants the stacked form, not the name beside the mark.
 * Intrinsic sizes are declared so the browser reserves the boxes before the images arrive.
 */
export function BrandMark({ inverse = false, large = false }: { inverse?: boolean; large?: boolean }) {
  if (large) {
    return (
      <Link href="/" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-85" aria-label="KNC Horizon Realtor home" data-testid="link-brand-home">
        <img src={optimizedImage(BRAND_LOGO.src, 640)} alt="" width={BRAND_LOGO.width} height={BRAND_LOGO.height} className="h-24 w-auto" />
      </Link>
    );
  }
  return (
    <Link href="/" className="inline-flex shrink-0 flex-col items-center gap-[3px] transition-opacity hover:opacity-85" aria-label="KNC Horizon Realtor home" data-testid="link-brand-home">
      <img src={optimizedImage(BRAND_MARK.src, 480)} alt="" width={BRAND_MARK.width} height={BRAND_MARK.height} className="h-7 w-auto md:h-[34px]" />
      <span className={`flex flex-col items-stretch leading-none transition-colors duration-500 ${inverse ? 'text-[#e9d3a3]' : 'text-[#9f7a47]'}`} aria-hidden="true">
        <span className="whitespace-nowrap text-center text-[10px] font-bold uppercase tracking-[.14em] md:text-[11px]">KNC Horizon</span>
        {/* The hairlines take whatever width the name above leaves beside REALTOR. */}
        <span className="mt-[5px] flex items-center gap-1.5">
          <span className="h-px flex-1 bg-current opacity-60" />
          <span className="whitespace-nowrap font-mono text-[6.5px] uppercase tracking-[.4em] opacity-85 md:text-[7.5px]">Realtor</span>
          <span className="h-px flex-1 bg-current opacity-60" />
        </span>
      </span>
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
      {/*
       * The header is two rows. Its total height is --header-h (index.css); the home hero,
       * the page hero and the in-page anchors leave that much room, so change both together.
       */}
      <header className="fixed inset-x-0 top-0 z-40">
        {/*
         * TOP BAR (laptop and desktop): where we are and what we promise on the left, the
         * phone number and Contact on the right, so a visitor can call without scrolling.
         * Always navy, so it reads on the dark home hero and on the ivory inner pages alike.
         */}
        <div className="site-gutter hidden bg-[#2b3242] text-[#faf7f1] lg:block" data-testid="top-bar">
          <div className="site-container flex h-9 items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-3 text-[12px] tracking-[.02em]">
              <span className="flex max-w-[280px] items-center gap-1.5 truncate font-medium" data-testid="top-bar-location"><MapPin size={13} className="shrink-0 text-[#d9c6a4]" aria-hidden="true" /> {contact.dubaiAddress}</span>
              <span className="h-3.5 w-px shrink-0 bg-[#faf7f1]/25" aria-hidden="true" />
              <p className="truncate text-[#faf7f1]/75" data-testid="top-bar-promises">
                {TOP_BAR_PROMISES.map((text, index) => <span key={text}>{index > 0 && <span className="mx-2.5 text-[#faf7f1]/30" aria-hidden="true">|</span>}{text}</span>)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <a href={`tel:${contact.phoneHref}`} className="flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold tracking-[.02em] transition-colors hover:text-[#ead8b8]" data-testid="link-nav-phone">
                <Phone size={14} className="text-[#d9c6a4]" aria-hidden="true" /> {contact.phoneDisplay}
              </a>
              <span className="h-3.5 w-px bg-[#faf7f1]/25" aria-hidden="true" />
              <button onClick={goContact} className="btn group min-h-7 gap-1.5 bg-[#ead8b8] px-3.5 py-1.5 text-[10.5px] text-[#2b3242] hover:bg-[#faf7f1]" data-testid="button-nav-contact">
                Contact us <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MENU ROW: logo on the left, the menu centred; on phone and tablet the menu button. */}
        <div className={`site-gutter transition-all duration-500 ${inverse ? 'bg-transparent text-[#faf7f1]' : 'border-b border-[#e6dccb]/80 bg-[#faf7f1]/95 text-[#2b3242] shadow-[0_12px_30px_-26px_rgba(43,50,66,0.45)] backdrop-blur-md'} ${scrolled ? 'py-1.5' : 'py-2'}`}>
        <div className="site-container flex items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:justify-items-start">
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
          </nav>
          {/* Third column, empty: keeps the menu on the centre line of the row. */}
          <div className="hidden lg:block" aria-hidden="true" />
          <button ref={menuButtonRef} className="-mr-2 grid h-11 w-11 place-items-center lg:hidden" onClick={() => open ? closeMenu() : setOpen(true)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        {/*
         * PHONE BAR (phone and tablet): under the logo row, the number that dials on tap and
         * Contact, in one slim pill. Translucent ivory on the dark home hero, soft grey on
         * the ivory header after scrolling and on inner pages.
         */}
        <div className={`site-container mt-1.5 flex h-9 items-center justify-between gap-2 rounded-full border pl-1 pr-1 lg:hidden ${inverse ? 'border-[#faf7f1]/15 bg-[#faf7f1]/10' : 'border-[#2b3242]/10 bg-[#2b3242]/[.05]'}`} data-testid="mobile-phone-bar">
          <a href={`tel:${contact.phoneHref}`} className="flex min-h-8 items-center gap-2 whitespace-nowrap pl-2.5 pr-2 text-[13px] font-medium tracking-[.02em]" data-testid="link-mobile-phone">
            <Phone size={14} className={inverse ? 'text-[#d9c6a4]' : 'text-[#9f7a47]'} aria-hidden="true" /> {contact.phoneDisplay}
          </a>
          <button onClick={goContact} className={`btn min-h-7 gap-1.5 px-3.5 py-1.5 text-[10.5px] ${inverse ? 'bg-[#ead8b8] text-[#2b3242] hover:bg-[#faf7f1]' : 'bg-[#2b3242] text-[#faf7f1] hover:bg-[#8f6d3f]'}`} data-testid="button-mobile-bar-contact">
            Contact us <ArrowUpRight size={12} />
          </button>
        </div>
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
          <a href={`tel:${contact.phoneHref}`} className="mt-2 flex min-h-11 items-center justify-between border-t border-[#2b3242]/10 px-3 pt-3 text-sm" data-testid="link-mobile-menu-phone"><span className="flex items-center gap-2"><Phone size={16} className="text-[#9f7a47]" aria-hidden="true" /> {contact.phoneDisplay}</span><ArrowUpRight size={13} /></a>
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
  // The same rule as the menu: no link to a page that has nothing on it yet.
  const inStock = useStockedNav();
  const footerProperties = inStock(propertyItems.filter((item) => item.needs === 'sale' || item.needs === 'rent'));
  const footerOffPlan = inStock(offPlanItems.filter((item) => item.needs));
  return (
    <footer className="site-section border-t border-[#d9c6a4]/20 bg-[#262d3b] text-[#faf7f1]">
      <div className="site-container">

        {/* Main Footer Grid: 2-up links on phones, 4-up on tablets, full 5 columns on desktop */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 border-b border-[#faf7f1]/15 pb-14 md:grid-cols-4 lg:grid-cols-[1.25fr_0.85fr_0.85fr_0.85fr_1.2fr] lg:gap-x-10 lg:gap-y-0">

          {/* Brand & Introduction */}
          <div className="col-span-full lg:col-span-1">
            <BrandMark inverse />
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
              {footerProperties.map((item) => (
                <Link key={item.href} href={item.href} className="line-link hover:text-[#faf7f1]">{item.label}</Link>
              ))}
              <Link href="/off-plan" className="line-link hover:text-[#faf7f1]">Off-Plan</Link>
              <Link href="/properties" className="line-link hover:text-[#faf7f1]">All Properties</Link>
              <div className="my-1 border-t border-[#faf7f1]/10 w-full" />
              <p className="eyebrow text-[#9f7a47]">Off-Plan</p>
              {footerOffPlan.map((item) => (
                <Link key={item.href} href={item.href} className="line-link hover:text-[#faf7f1]">{item.label}</Link>
              ))}
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
