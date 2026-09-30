import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Coins, Globe2, Landmark, ShieldCheck, TrendingUp } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'wouter';
import { PageHero, SectionIntro, SectionBreak, SectionLabel } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';
import { apiFetch } from '@/lib/api';

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
            <SectionBreak />
            <em className="text-[#9f7a47]">grounded in fact.</em>
          </>
        }
        copy="Independent regulatory context, rental yield mechanics, and macroeconomic foundations for informed property decisions across Dubai."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/sheikh-zayed-road-aerial.jpg"
      />

      {/* CORE MARKET PILLARS */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <SectionIntro
            label="Market Fundamentals"
            title={
              <>
                The structural pillars of
                <SectionBreak />
                <em className="text-[#9f7a47]">Dubai real estate.</em>
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
                  className="flex h-full flex-col rounded-2xl border border-[#2b3242]/15 bg-[#f2ede4] p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-[#2b3242] text-[#d9c6a4]">
                      <Icon size={22} />
                    </div>
                    <h3 className="block-title mt-6 text-[#2b3242]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#2b3242]/70">
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
      <section className="bg-[#efeae2] site-section">
        <div className="site-container">
          <SectionLabel>Global Comparison</SectionLabel>

          <h2 className="section-title mt-6 text-[#2b3242]">
            Why global capital{' '}
            <em className="text-[#9f7a47]">chooses Dubai.</em>
          </h2>

          <div className="mt-10 overflow-x-auto rounded-sm border border-[#2b3242]/15 bg-[#faf7f1] shadow-xs">
            <table className="w-full text-left font-sans text-sm text-[#2b3242]">
              <thead>
                <tr className="border-b border-[#2b3242]/15 bg-[#2b3242] font-mono text-[11px] uppercase tracking-[0.14em] text-[#faf7f1]">
                  <th className="p-4 sm:p-5">Indicator</th>
                  <th className="p-4 sm:p-5 text-[#d9c6a4]">Dubai</th>
                  <th className="p-4 sm:p-5">London</th>
                  <th className="p-4 sm:p-5">New York</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b3242]/10">
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Annual Property Tax</td>
                  <td className="p-4 font-mono font-bold text-[#9f7a47] sm:p-5">0%</td>
                  <td className="p-4 sm:p-5">Council Tax & Band Rates</td>
                  <td className="p-4 sm:p-5">Approx. 1.2% – 2.0%</td>
                </tr>
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Capital Gains Tax</td>
                  <td className="p-4 font-mono font-bold text-[#9f7a47] sm:p-5">0%</td>
                  <td className="p-4 sm:p-5">Up to 24%</td>
                  <td className="p-4 sm:p-5">Up to 20% + State Tax</td>
                </tr>
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Gross Rental Yields</td>
                  <td className="p-4 font-mono font-bold text-[#9f7a47] sm:p-5">6.0% – 9.0%</td>
                  <td className="p-4 sm:p-5">2.5% – 4.0%</td>
                  <td className="p-4 sm:p-5">3.0% – 4.5%</td>
                </tr>
                <tr>
                  <td className="p-4 font-serif text-base sm:p-5">Investor Residency Visa</td>
                  <td className="p-4 font-mono font-bold text-[#9f7a47] sm:p-5">10-Year Golden Visa</td>
                  <td className="p-4 sm:p-5">Not Applicable</td>
                  <td className="p-4 sm:p-5">EB-5 ($800k+ USD)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ADVISORY BRIEFING CTA */}
      <section className="bg-[#2b3242] site-section text-[#faf7f1]">
        <div className="site-container text-center">
          <SectionLabel>Private Research Briefing</SectionLabel>

          <h2 className="section-title mt-6">
            Request a bespoke{' '}
            <em className="text-[#d9c6a4]">market analysis.</em>
          </h2>

          <p className="body-copy measure mx-auto mt-6 text-[#faf7f1]/70">
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
