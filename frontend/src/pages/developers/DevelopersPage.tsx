import { useEffect, useState } from 'react';
import { ArrowUpRight, ExternalLink, Globe } from 'lucide-react';
import { Link } from 'wouter';
import { apiFetch, type Developer } from '@/lib/api';
import { PageHero, SectionLabel, cardGrid } from '@/components/blocks';
import { defaultDevelopers } from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';
import { useContact } from '@/lib/site-settings';
import { optimizedImage } from '@/lib/cloudinary-image';
import { LoadingState } from '@/pages/shared/listing-helpers';

export function DevelopersPage() {
  const contact = useContact();
  const [developers, setDevelopers] = useState<Developer[]>(defaultDevelopers as unknown as Developer[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  usePageMeta(
    'Dubai Developers',
    'Explore established developers shaping residential, investment and mixed-use communities across Dubai.'
  );

  useEffect(() => {
    let active = true;
    apiFetch<{ developers: Developer[] }>('/developers')
      .then((data) => {
        if (!active) return;
        if (data?.developers && data.developers.length > 0) {
          setDevelopers(data.developers);
        }
      })
      .catch((reason) => {
        if (!active) return;
        // Keep verified defaults on network fallback
        setError(reason instanceof Error ? reason.message : 'Unable to refresh developer list.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#faf7f1]">
      <PageHero
        label="Dubai developers"
        title={
          <>
            Names behind<br />
            <em className="text-[#9f7a47]">Dubai's next chapter.</em>
          </>
        }
        copy="Explore established developers shaping residential, investment and mixed-use communities across Dubai."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577269/knc-horizon/hero/downtown-skyline-cranes.jpg"
      />

      {/* Main Developers Listing Section */}
      <section className="site-section">
        <div className="site-container">
          <div className="mb-12 flex flex-col justify-between gap-4 border-b border-[#2b3242]/12 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-[#9f7a47]">Selected Profiles</p>
              <h2 className="section-title mt-6 text-[#2b3242]">Established master builders</h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[.13em] text-[#2b3242]/60 sm:pb-2">
              {developers.length} verified developer profiles
            </p>
          </div>

          {loading && developers.length === 0 ? (
            <LoadingState />
          ) : (
            <div className={cardGrid(developers.length)}>
              {developers.map((dev) => {
                const websiteUrl = dev.officialWebsite || dev.website || '';
                return (
                  <article
                    key={dev.id || dev.slug}
                    className="card-editorial group justify-between p-5"
                    data-testid={`card-developer-${dev.slug}`}
                  >
                    <div>
                      {/* Logo / Header Visual Treatment */}
                      <div className="mb-5 flex min-h-[3.25rem] w-full items-center justify-between gap-3 border-b border-[#2b3242]/10 pb-4">
                        {dev.logo ? (
                          <div className="h-10 max-w-[140px] opacity-85 mix-blend-multiply">
                            <img
                              src={optimizedImage(dev.logo, 320)}
                              alt={`${dev.name} official logo`}
                              loading="lazy"
                              className="h-full w-full object-contain object-left"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#2b3242]/5 font-serif text-lg font-medium text-[#2b3242]">
                            {dev.name.charAt(0)}
                          </div>
                        )}
                        {dev.featured && (
                          <span className="border border-[#9f7a47]/30 bg-[#8f6d3f]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[.14em] text-[#9f7a47]">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Name & Short Description */}
                      <h3 className="card-title line-clamp-2 text-[#2b3242] transition-colors group-hover:text-[#9f7a47]">
                        {dev.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#2b3242]/65">
                        {dev.shortDescription || dev.description}
                      </p>

                      {/* Verified Areas */}
                      {dev.areas && dev.areas.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-[#2b3242]/10 pt-3">
                          {dev.areas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="bg-[#2b3242]/5 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#2b3242]/60"
                            >
                              {area}
                            </span>
                          ))}
                          {dev.areas.length > 3 && (
                            <span className="font-mono text-[11px] text-[#2b3242]/60 self-center">
                              +{dev.areas.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions & Official Website */}
                    <div className="mt-5 flex flex-col items-start gap-3 border-t border-[#2b3242]/12 pt-4">
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.12em] text-[#2b3242]/65 hover:text-[#9f7a47] transition-colors"
                          aria-label={`Visit official website for ${dev.name}`}
                        >
                          <Globe size={11} className="text-[#9f7a47]" />
                          <span>Official website</span>
                          <ExternalLink size={10} className="opacity-70" />
                        </a>
                      )}

                      <Link
                        href={`/developers/${dev.slug}`}
                        className="btn btn-primary w-full"
                        data-testid={`btn-view-developer-${dev.slug}`}
                      >
                        View developer <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Professional Advisory CTA Section */}
      <section className="bg-[#efeae2] site-section border-t border-[#2b3242]/12">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div>
            <SectionLabel>Developer Advisory</SectionLabel>
            <h2 className="section-title mt-6 text-[#2b3242]">
              Looking for the <em className="text-[#9f7a47]">right developer?</em>
            </h2>
            <p className="body-copy measure mt-6 text-[#2b3242]/70">
              Every developer in Dubai brings distinct architectural standards, community masterplans, and delivery horizons. Our independent advisory helps you compare opportunities objectively based on your investment goals and lifestyle criteria.
            </p>
          </div>
          <div className="btn-row lg:justify-end">
            <Link href="/contact" className="btn btn-primary">
              Speak with an advisor <ArrowUpRight size={14} />
            </Link>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Chat on WhatsApp <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
