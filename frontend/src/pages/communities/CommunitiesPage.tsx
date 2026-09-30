import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { ContactForm, PageHero, SectionLabel, cardGrid, SectionBreak } from '@/components/blocks';
import { areas } from '@/lib/site-data';
import { useContact } from '@/lib/site-settings';
import { optimizedImage } from '@/lib/cloudinary-image';
import { apiFetch, type Project, type RemoteProperty } from '@/lib/api';

export function AreasPage() {
  const contact = useContact();
  // Live stock per community, so a card says what is actually behind it before it is opened.
  const [counts, setCounts] = useState<Record<string, { properties: number; projects: number }>>({});
  useEffect(() => {
    let live = true;
    Promise.all([
      apiFetch<{ properties: RemoteProperty[] }>('/public/properties?limit=50').catch(() => ({ properties: [] as RemoteProperty[] })),
      apiFetch<{ projects: Project[] }>('/public/projects').catch(() => ({ projects: [] as Project[] })),
    ]).then(([p, j]) => {
      if (!live) return;
      const next: Record<string, { properties: number; projects: number }> = {};
      for (const area of areas) {
        const is = (value: string) => value.trim().toLowerCase() === area.name.toLowerCase();
        next[area.id] = {
          properties: (p.properties ?? []).filter((item) => is(item.community ?? '') || (item.location ?? '').split(',').some(is)).length,
          projects: (j.projects ?? []).filter((item) => is(item.location ?? '')).length,
        };
      }
      setCounts(next);
    });
    return () => { live = false; };
  }, []);


  return (
    <main className="overflow-x-clip">
      <PageHero
        label="Dubai, by neighbourhood"
        title={
          <>
            Find the place
            <SectionBreak />
            that feels like <em className="text-[#9f7a47]">you.</em>
          </>
        }
        copy="Dubai is a city of very different neighbourhoods. We help you understand each location, its character, and the property opportunities it offers."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577274/knc-horizon/hero/marina-resort-greens.jpg"
      />

      {/* AREA NOTES */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">

          <div className="max-w-3xl">
            <SectionLabel>Area notes</SectionLabel>

            <h2 className="section-title mt-6 text-[#2b3242]">
              Understand Dubai
              <SectionBreak />
              <em className="text-[#9f7a47]">by address.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#2b3242]/65">
              From waterfront communities and established villa
              neighbourhoods to new districts shaped by Dubai&apos;s continued
              growth, every address offers a different way of living and
              investing.
            </p>
          </div>

          {/* AREA GRID — one card per community, identical media ratio and CTA */}
          <div className={`mt-12 ${cardGrid(areas.length)}`}>
            {areas.map((area) => (
              <article
                key={area.id}
                id={area.id}
                className="card-editorial group scroll-mt-[calc(var(--header-h)+1rem)] p-5"
                data-testid={`card-community-${area.id}`}
              >
                <div className="card-media image-reveal">
                  <img
                    src={optimizedImage(area.image, 800)}
                    alt={`${area.name}, Dubai`}
                    loading="lazy"
                    className="transition-transform duration-700 group-hover:scale-[1.03]"
                    data-testid={`img-area-detail-${area.id}`}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="eyebrow text-[#9f7a47]">{area.descriptor}</p>
                  {counts[area.id] && (
                    <p className="font-mono text-[11px] uppercase tracking-[.13em] text-[#2b3242]/65" data-testid={`text-area-count-${area.id}`}>
                      {counts[area.id].properties + counts[area.id].projects === 0
                        ? 'By request'
                        : [
                            counts[area.id].properties && `${counts[area.id].properties} ${counts[area.id].properties === 1 ? 'property' : 'properties'}`,
                            counts[area.id].projects && `${counts[area.id].projects} off-plan`,
                          ].filter(Boolean).join(' \u00b7 ')}
                    </p>
                  )}
                </div>
                <h3 className="card-title mt-2">{area.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#2b3242]/65">{area.detail}</p>

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#2b3242]/12 pt-4">
                  <Link
                    href={`/communities/${area.id}`}
                    className="line-link inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]"
                    data-testid={`link-area-properties-${area.id}`}
                  >
                    View community <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href="/contact"
                    className="line-link font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/65"
                  >
                    Ask an advisor
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* LOCAL PERSPECTIVE */}
          <div className="measure mt-14 border-t border-[#2b3242]/20 pt-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#9f7a47]">
              Local perspective
            </span>

            <p className="body-copy measure mt-3 text-[#2b3242]/70">
              Choosing a Dubai property starts with choosing the right
              location. If you are unsure which community fits your
              requirements, speak with our property advisory team before
              narrowing down the options.
            </p>
          </div>
        </div>
      </section>

      {/* AREA ADVISORY CTA */}
      <section className="bg-[#ebe4d7] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

          <div className="flex flex-col">
            <SectionLabel>Need a local view?</SectionLabel>

            <h2 className="section-title mt-6 text-[#2b3242]">
              Start with the{" "}
              <em className="text-[#9f7a47]">right area.</em>
            </h2>

            <p className="body-copy measure mt-6 text-[#2b3242]/65">
              Tell us what you are looking for and our property advisory team
              can help you compare locations, property types, and suitable
              opportunities.
            </p>

            <p className="measure-narrow mt-4 text-sm leading-7 text-[#2b3242]/60">
              Share your requirements and we&apos;ll help you understand which
              Dubai locations may fit your plans, and what is realistic in each
              of them.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 border-t border-[#2b3242]/20 pt-6 lg:mt-auto">
              <p className="eyebrow text-[#9f7a47]">Or speak to an advisor</p>
              <a
                href={`tel:${contact.phoneHref}`}
                className="block-title text-[#2b3242] transition-colors hover:text-[#9f7a47]"
              >
                {contact.phoneDisplay}
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="line-link font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="w-full rounded-2xl bg-[#faf7f1] p-5 shadow-sm sm:p-8">
            <ContactForm compact inquiryType="area-advisory" />
          </div>

        </div>
      </section>
    </main>
  );
}

/* ============================================================
   COMMUNITIES PAGE (ALIAS OF AREAS WITH SPECIALIZED TITLE)
============================================================ */
export const CommunitiesPage = AreasPage;
