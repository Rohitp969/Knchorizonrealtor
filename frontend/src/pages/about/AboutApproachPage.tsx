import { ArrowRight, Building2, Compass, Landmark, ShieldCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'wouter';
import { PageHero, SectionIntro, SectionBreak, SectionLabel } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';

/* ============================================================
   OUR APPROACH PAGE
============================================================ */
export function AboutApproachPage() {
  const contact = useContact();
  const pillars = [
    {
      icon: Compass,
      title: 'Discovery & Requirement Scoping',
      description: 'We begin by understanding the lifestyle horizons, investment benchmarks, and holding timelines that matter to you. Real advisory begins with listening, not pushing inventory.',
    },
    {
      icon: ShieldCheck,
      title: 'Independent Due Diligence',
      description: 'Every project and title deed is cross-referenced against Dubai Land Department records, developer construction milestones, service charge models, and historical resale velocity.',
    },
    {
      icon: Landmark,
      title: 'Structured Acquisition & Terms',
      description: 'Whether buying directly from a master developer or negotiating private resales, we protect your interests through transparent conveyancing, escrow verification, and milestone alignment.',
    },
    {
      icon: Building2,
      title: 'Handover & Ongoing Asset Care',
      description: 'Our engagement continues through professional snagging inspections, key handover, utility registrations, and seamless transition to tenant leasing or interior styling coordination.',
    },
  ];

  return (
    <main className="overflow-x-clip">
      <PageHero
        label="Our Advisory Method"
        title={
          <>
            Calm is not passive.
            <SectionBreak />
            <em className="text-[#9f7a47]">It is prepared.</em>
          </>
        }
        copy="A disciplined, transparent advisory practice shaped around the reality of Dubai real estate. No pressure, no developer bias — just considered guidance at every turn."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/al-fahidi-wind-towers.jpg"
      />

      {/* CORE PHILOSOPHY */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <SectionLabel>Core Philosophy</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#2b3242]">
            The standard of care should match the magnitude of the{' '}
            <em className="text-[#9f7a47]">decision.</em>
          </h2>

          <div className="body-copy measure mt-10 space-y-6 text-[#2b3242]/75">
            <p>
              In a fast-moving market like Dubai, speed is often confused with competence. We take the contrary view: that the best property moves are made with deliberation, contextual analysis, and an honest reading of both upside and downside.
            </p>
            <p>
              KNC Horizon Realtor was built to provide clients with a trusted, independent sounding board. We maintain direct relationships with Dubai’s leading master developers, yet our allegiance remains exclusively with the client we advise.
            </p>
          </div>
        </div>
      </section>

      {/* ADVISORY PILLARS */}
      <section className="bg-[#f2ede4] site-section">
        <div className="site-container">
          <SectionIntro
            label="Structured Process"
            title={
              <>
                Four phases of
                <SectionBreak />
                <em className="text-[#9f7a47]">considered advisory.</em>
              </>
            }
            copy="From initial consultation through to post-handover asset management, our process ensures total clarity and legal security."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-[#2b3242]/15 bg-[#faf7f1] p-6 shadow-xs transition-shadow hover:shadow-md sm:p-7"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-[#2b3242] text-[#d9c6a4]">
                    <Icon size={22} />
                  </div>
                  <h3 className="block-title mt-6 text-[#2b3242]">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[#2b3242]/65">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONVERSATION STRIP */}
      <section className="bg-[#2b3242] site-section text-[#faf7f1]">
        <div className="site-container text-center">
          <SectionLabel>Connect With An Advisor</SectionLabel>

          <h2 className="section-title mt-6">
            Start with an honest{' '}
            <em className="text-[#d9c6a4]">conversation.</em>
          </h2>

          <p className="body-copy measure mx-auto mt-6 text-[#faf7f1]/70">
            No sales pitches. Just a thoughtful discussion on your Dubai property plans, community options, and investment goals.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="btn btn-sand"
            >
              Contact Us <ArrowRight size={15} />
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
