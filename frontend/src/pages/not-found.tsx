import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';

import { SectionLabel } from '@/components/blocks';
import { usePageMeta } from '@/lib/seo';

const suggestions = [
  { label: 'Properties', href: '/properties' },
  { label: 'Off-plan', href: '/off-plan' },
  { label: 'Communities', href: '/communities' },
  { label: 'Developers', href: '/developers' },
  { label: 'Insights', href: '/blog' },
];

export default function NotFound() {
  usePageMeta('Page not found', 'The page you were looking for is no longer here. Browse Dubai properties, off-plan releases and communities with KNC Horizon Realtor.');

  return (
    <main className="bg-[#f5f0e6]">
      <section className="flex min-h-[70svh] items-center px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto w-full max-w-[1280px]">
          <SectionLabel>Error 404</SectionLabel>

          <h1 className="page-title mt-5 max-w-3xl text-[#202635]">
            This page has moved on.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#202635]/70">
            The page you were looking for is no longer here. These are the places most
            people are heading instead.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary" data-testid="link-404-home">
              Back to home <ArrowUpRight size={14} />
            </Link>
            <Link href="/contact" className="btn btn-secondary" data-testid="link-404-contact">
              Talk to an advisor <ArrowUpRight size={14} />
            </Link>
          </div>

          <nav aria-label="Suggested pages" className="mt-12 border-t border-[#202635]/15 pt-6">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {suggestions.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="line-link font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </main>
  );
}
