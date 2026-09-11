import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowUp, ArrowUpRight, ChevronDown, Menu, Phone, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { CONTACT } from '@/lib/contact-info';


const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

const propertyItems = [
  { label: 'All Properties', href: '/properties' },
  { label: 'Residential', href: '/properties/residential' },
  { label: 'Commercial', href: '/properties/commercial' },
  { label: 'Investment', href: '/properties/investment' },
  { label: 'Off-Plan', href: '/properties/off-plan' },
];

const projectItems = [
  { label: 'All Projects', href: '/projects' },
  { label: 'Featured Projects', href: '/projects/featured' },
  { label: 'New Launches', href: '/projects/new-launches' },
  { label: 'Off-Plan Projects', href: '/projects/off-plan' },
];

const serviceItems = [
  { label: 'Property Sales & Advisory', href: '/services#sales' },
  { label: 'Property Buying Advisory', href: '/services#buying' },
  { label: 'Investment Advisory', href: '/services#investment' },
  { label: 'Off-Plan Property', href: '/properties/off-plan' },
  { label: 'Property Management', href: '/services#management' },
  { label: 'Design & Build', href: '/design-build' },
  { label: 'Interior & Furniture', href: '/interiors' },
];

const exploreItems = [
  { label: 'Areas', href: '/areas' },
  { label: 'Blog / Insights', href: '/blog' },
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
        <span className="mt-1 block font-mono text-[8px] tracking-[.2em] opacity-70">HORIZON REALTOR</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<'properties' | 'projects' | 'services' | 'explore' | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<'properties' | 'projects' | 'services' | 'explore' | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isHome = location === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${inverse ? 'bg-transparent text-[#f5f0e6]' : 'border-b border-[#d8cdbc]/80 bg-[#f5f0e6]/95 text-[#202635] backdrop-blur-md'} ${scrolled ? 'py-3' : 'py-5'}`}>
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-5 md:px-10">
        <BrandMark inverse={inverse} />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="line-link font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" data-testid={`link-nav-${item.label.toLowerCase()}`}>{item.label}</Link>
          ))}
          <div className="relative" onMouseLeave={() => setDropdown(null)}>
            <button type="button" onClick={() => setDropdown(dropdown === 'properties' ? null : 'properties')} className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'properties'}>Properties <ChevronDown size={12} className={dropdown === 'properties' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
            {dropdown === 'properties' && <div className="absolute right-0 top-full w-52 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{propertyItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
          </div>
          <div className="relative" onMouseLeave={() => setDropdown(null)}>
            <button type="button" onClick={() => setDropdown(dropdown === 'projects' ? null : 'projects')} className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'projects'}>Projects <ChevronDown size={12} className={dropdown === 'projects' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
            {dropdown === 'projects' && <div className="absolute right-0 top-full w-52 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{projectItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
          </div>
          <Link href="/developers" className="line-link font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100">Developers</Link>
          <div className="relative" onMouseLeave={() => setDropdown(null)}>
            <button type="button" onClick={() => setDropdown(dropdown === 'services' ? null : 'services')} className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'services'}>Services <ChevronDown size={12} className={dropdown === 'services' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
            {dropdown === 'services' && <div className="absolute right-0 top-full w-56 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{serviceItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
          </div>
          <div className="relative" onMouseLeave={() => setDropdown(null)}>
            <button type="button" onClick={() => setDropdown(dropdown === 'explore' ? null : 'explore')} className="line-link flex items-center gap-1 font-mono text-[10px] uppercase tracking-[.16em] opacity-85 hover:opacity-100" aria-expanded={dropdown === 'explore'}>Explore <ChevronDown size={12} className={dropdown === 'explore' ? 'rotate-180 transition-transform' : 'transition-transform'} /></button>
            {dropdown === 'explore' && <div className="absolute right-0 top-full w-48 border border-[#d8cdbc] bg-[#f5f0e6] p-2 text-[#202635] shadow-xl">{exploreItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setDropdown(null)} className="block px-3 py-2.5 font-mono text-[10px] uppercase tracking-[.12em] hover:bg-[#e9e4da]">{item.label}</Link>)}</div>}
          </div>
          <button onClick={goContact} className={`group flex items-center gap-2 border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[.14em] transition-colors ${inverse ? 'border-[#ead8b8]/60 hover:bg-[#ead8b8] hover:text-[#202635]' : 'border-[#202635]/35 hover:bg-[#202635] hover:text-[#f5f0e6]'}`} data-testid="button-nav-contact">
            Contact us <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </nav>
        <button ref={menuButtonRef} className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => open ? closeMenu() : setOpen(true)} aria-label={open ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      <div className={`mobile-menu-backdrop fixed inset-0 z-40 bg-[#202635]/12 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden ${open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'}`} onClick={closeMenu} aria-hidden="true" />
      <div className={`mobile-menu-panel fixed inset-y-0 right-0 z-50 h-[100dvh] w-[82vw] max-w-[380px] overflow-x-hidden overflow-y-auto border-l border-[#d8cdbc]/80 bg-[#f5f0e6] text-[#202635] shadow-2xl transition-[opacity,transform,visibility] duration-300 lg:hidden lg:max-w-[440px] ${open ? 'visible translate-x-0 opacity-100' : 'invisible pointer-events-none translate-x-full opacity-0'}`} aria-hidden={!open}>
        <div className="flex items-center justify-between border-b border-[#202635]/10 px-4 py-3">
          <p className="eyebrow text-[#c97352]">Navigation</p>
          <button type="button" onClick={closeMenu} className="grid h-9 w-9 place-items-center border border-[#202635]/15" aria-label="Close menu"><X size={16} /></button>
        </div>
        <nav className="flex min-h-[calc(100dvh-4.5rem)] flex-col gap-1 p-3" aria-label="Mobile navigation">
          {navItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="rounded-sm px-3 py-1 font-serif text-[1.15rem] leading-none transition-colors hover:bg-[#e9e4da]" data-testid={`link-mobile-${item.label.toLowerCase()}`}>{item.label}</Link>)}
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'properties' ? null : 'properties')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'properties'}>Properties <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'properties' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'properties' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{propertyItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'projects' ? null : 'projects')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'projects'}>Projects <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'projects' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'projects' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{projectItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>
          <Link href="/developers" onClick={closeMenu} className="mt-2 block border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]">Developers</Link>
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'services' ? null : 'services')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'services'}>Services <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'services' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'services' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{serviceItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]">{item.label}</Link>)}</div></div>
          <button type="button" onClick={() => setMobileAccordion(mobileAccordion === 'explore' ? null : 'explore')} className="mt-2 flex w-full items-center justify-between border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.68rem] uppercase tracking-[.12em] text-[#c97352]" aria-expanded={mobileAccordion === 'explore'}>Explore <ChevronDown size={14} className={`transition-transform ${mobileAccordion === 'explore' ? 'rotate-180' : ''}`} /></button>
          <div className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ${mobileAccordion === 'explore' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="min-h-0 border-l border-[#c97352]/35 pl-2">{exploreItems.map((item) => <Link key={item.href} href={item.href} onClick={closeMenu} className="block rounded-sm px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.1em] transition-colors hover:bg-[#e9e4da]" data-testid={`link-mobile-explore-${item.label.toLowerCase()}`}>{item.label}</Link>)}</div></div>
          <button onClick={goContact} className="mt-2 flex min-h-10 w-full items-center justify-between border border-[#202635]/30 px-3 py-2 font-mono text-[.64rem] uppercase tracking-[.12em]" data-testid="button-mobile-contact">Contact us <ArrowUpRight size={13} /></button>
          <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 flex min-h-10 items-center justify-between border-t border-[#202635]/10 px-3 pt-3 text-sm" data-testid="link-mobile-whatsapp"><span className="flex items-center gap-2"><FaWhatsapp size={18} className="text-[#55735f]" /> WhatsApp us</span><ArrowUpRight size={13} /></a>
          <div className="mt-2 flex gap-3 border-t border-[#202635]/10 px-3 pt-3 font-mono text-[.58rem] uppercase tracking-[.1em] text-[#202635]/55"><Link href="/terms-and-conditions" onClick={closeMenu} data-testid="link-mobile-terms">Terms & Conditions</Link><Link href="/privacy-policy" onClick={closeMenu} data-testid="link-mobile-privacy">Privacy Policy</Link></div>
        </nav>
      </div>
    </header>
  );
}

// export function Footer() {
//   return (
//     <footer className="bg-[#202635] px-5 py-14 text-[#f5f0e6] md:px-10 md:py-20">
//       <div className="mx-auto max-w-[1380px]">
//         <div className="grid gap-12 border-b border-[#f5f0e6]/15 pb-14 md:grid-cols-[1.35fr_.7fr_.85fr_.9fr] md:gap-8">
//           <div>
//             <BrandMark inverse />
//             <p className="mt-9 max-w-sm font-serif text-3xl leading-[1.05] text-[#d9c6a4] md:text-4xl">A more considered way to move through Dubai.</p>
//           </div>
//           <div>
//             <p className="eyebrow text-[#c97352]">Explore</p>
//             <div className="mt-5 flex flex-col items-start gap-3 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">
//               <Link href="/properties" className="line-link hover:text-[#f5f0e6]">Properties</Link>
//               <Link href="/projects" className="line-link hover:text-[#f5f0e6]">Projects</Link>
//               <Link href="/services" className="line-link hover:text-[#f5f0e6]">Services</Link>
//               <Link href="/areas" className="line-link hover:text-[#f5f0e6]">Dubai Areas</Link>
//               <Link href="/blog" className="line-link hover:text-[#f5f0e6]" data-testid="link-footer-blog">Blog</Link>
//               <Link href="/gallery" className="line-link hover:text-[#f5f0e6]">Gallery</Link>
//               <Link href="/contact" className="line-link hover:text-[#f5f0e6]" data-testid="link-footer-contact">Contact</Link>
//             </div>
//           </div>
//           <div>
//             <p className="eyebrow text-[#c97352]">Speak with us</p>
//             <a href={`tel:${CONTACT.phoneHref}`} className="mt-5 flex items-center gap-2 font-serif text-2xl text-[#f5f0e6] hover:text-[#d9c6a4]" data-testid="link-footer-phone"><Phone size={16} /> {CONTACT.phoneDisplay}</a>
//             <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[.14em] text-[#d9c6a4] line-link" data-testid="link-footer-whatsapp">WhatsApp us</a>
//           </div>
//           <div>
//             <p className="eyebrow text-[#c97352]">Services</p>
//             <div className="mt-5 flex flex-col items-start gap-3 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">
//               <Link href="/services#sales" className="line-link hover:text-[#f5f0e6]">Property sales & advisory</Link>
//               <Link href="/design-build" className="line-link hover:text-[#f5f0e6]">Design & Build</Link>
//               <Link href="/interiors" className="line-link hover:text-[#f5f0e6]">Interior & Furniture</Link>
//               <Link href="/services#management" className="line-link hover:text-[#f5f0e6]">Property management</Link>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col justify-between gap-3 pt-7 font-mono text-[9px] uppercase tracking-[.14em] text-[#f5f0e6]/40 md:flex-row">
//           <span data-testid="text-footer-copyright">© 2026 KNC Horizon Realtor · Dubai, UAE | India Office: {CONTACT.indiaAddress}</span>
//           <span>Private property advisory</span>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export function SiteShell({ children }: { children: ReactNode }) {
//   const [showTop, setShowTop] = useState(false);
//   useEffect(() => {
//     const onScroll = () => setShowTop(window.scrollY > 500);
//     window.addEventListener('scroll', onScroll, { passive: true });
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);
//   return <div className="grain min-h-[100dvh] overflow-x-hidden"><Navbar />{children}<Footer /><a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="fixed bottom-5 left-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#55735f] text-white shadow-lg transition-transform hover:scale-105" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><FaWhatsapp size={23} /></a>{showTop && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#202635] text-[#f5f0e6] shadow-lg" aria-label="Scroll to top"><ArrowUp size={16} /></button>}</div>;
// }


export function Footer() {
  return (
    <footer className="bg-[#202635] px-5 py-16 text-[#f5f0e6] md:px-10 md:py-20">
      <div className="mx-auto max-w-[1380px]">

        {/* Main Footer */}
        <div className="grid gap-12 border-b border-[#f5f0e6]/15 pb-14 md:grid-cols-[1.3fr_.8fr_.9fr_.9fr] md:gap-10">

          {/* Brand */}
          <div>
            <BrandMark inverse />

            <p className="mt-8 max-w-sm font-serif text-3xl leading-[1.05] text-[#d9c6a4] md:text-4xl">
              A more considered way to move through Dubai.
            </p>

            <p className="mt-6 max-w-sm text-sm leading-6 text-[#f5f0e6]/55">
              Independent property advisory for considered decisions across
              Dubai and the UAE.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="eyebrow text-[#c97352]">
              Explore
            </p>

            <div className="mt-5 flex flex-col items-start gap-3 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">

              <Link
                href="/properties"
                className="line-link hover:text-[#f5f0e6]"
              >
                Properties
              </Link>

              <Link
                href="/projects"
                className="line-link hover:text-[#f5f0e6]"
              >
                Projects
              </Link>

              <Link
                href="/developers"
                className="line-link hover:text-[#f5f0e6]"
              >
                Developers
              </Link>

              <Link
                href="/services"
                className="line-link hover:text-[#f5f0e6]"
              >
                Services
              </Link>

              <Link
                href="/areas"
                className="line-link hover:text-[#f5f0e6]"
              >
                Dubai Areas
              </Link>

              <Link
                href="/blog"
                className="line-link hover:text-[#f5f0e6]"
              >
                Blog / Insights
              </Link>

              <Link
                href="/gallery"
                className="line-link hover:text-[#f5f0e6]"
              >
                Gallery
              </Link>

              <Link
                href="/contact"
                className="line-link hover:text-[#f5f0e6]"
              >
                Contact
              </Link>

            </div>
          </div>

          {/* Offices */}
          <div>
            <p className="eyebrow text-[#c97352]">
              Our offices
            </p>

            <div className="mt-5 space-y-7">

              {/* Dubai */}
              <div>
                <p className="font-serif text-xl text-[#f5f0e6]">
                  Dubai
                </p>

                <p className="mt-2 text-sm leading-6 text-[#f5f0e6]/55">
                  Dubai, UAE
                </p>
              </div>

              {/* India */}
              <div>
                <p className="font-serif text-xl text-[#f5f0e6]">
                  India
                </p>

                <p className="mt-2 text-sm leading-6 text-[#f5f0e6]/55">
                  DLF Phase 1,
                  <br />
                  Gurugram, Haryana, India
                </p>
              </div>

            </div>

            {/* Phone */}
            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="mt-7 flex items-center gap-2 font-serif text-xl text-[#f5f0e6] transition-colors hover:text-[#d9c6a4]"
              data-testid="link-footer-phone"
            >
              <Phone size={15} />
              {CONTACT.phoneDisplay}
            </a>

          </div>

          {/* Connect + Legal */}
          <div>
            <p className="eyebrow text-[#c97352]">
              Connect
            </p>

            <div className="mt-5 flex flex-col items-start gap-3 font-mono text-[10px] uppercase tracking-[.13em] text-[#f5f0e6]/70">

              <Link
                href="/contact"
                className="line-link hover:text-[#f5f0e6]"
              >
                Contact Us
              </Link>

              <Link
                href="/terms"
                className="line-link hover:text-[#f5f0e6]"
              >
                Terms & Conditions
              </Link>

              <Link
                href="/privacy"
                className="line-link hover:text-[#f5f0e6]"
              >
                Privacy Policy
              </Link>

            </div>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-4 pt-7 font-mono text-[9px] uppercase tracking-[.14em] text-[#f5f0e6]/40 md:flex-row md:items-center md:justify-between">

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

  return (
    <div className="grain min-h-[100dvh] overflow-x-hidden">

      <Navbar />

      {children}

      <Footer />

      {/* Back to top button */}
      {showTop && (
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-[#202635] text-[#f5f0e6] shadow-lg transition-transform hover:scale-105"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp size={16} />
        </button>
      )}

    </div>
  );
}