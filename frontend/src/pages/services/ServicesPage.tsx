import { ArrowUpRight, Check } from 'lucide-react';
import { Link } from 'wouter';
import { FaqSection, PageHero, SectionIntro, SectionBreak, SectionLabel, ServiceRow, cardGrid } from '@/components/blocks';
import { services, specialistServices } from '@/lib/site-data';
import { responsiveImage, CARD_SIZES } from '@/lib/cloudinary-image';

export function ServicesPage() {
  return (
    <main className="overflow-x-clip">
      {/* HERO */}
      <PageHero
        label="Our Advisory Services"
        title={
          <>
            Advice for
            <SectionBreak />
            <em className="text-[#9f7a47]">every direction.</em>
          </>
        }
        copy="Buying, selling, renting, or investing — the route is different for everyone. The standard of care should not be."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577271/knc-horizon/hero/dubai-skyline-golf-course.jpg"
      />

      {/* CORE ADVISORY SERVICES */}
      <section className="bg-[#f2ede4] site-section">
        <div className="site-container">
          <SectionIntro
            label="Advisory Practices"
            title={
              <>
                More than a
                <SectionBreak />
                property <em className="text-[#9f7a47]">transaction.</em>
              </>
            }
            copy="Our role is to make the important parts clearer, and the complicated parts feel structured and held."
          />

          <div className="mt-12">
            {services.map((service) => (
              <div id={service.id} key={service.id}>
                <ServiceRow service={service} />
                <p className="max-w-2xl pb-6 pl-4 text-sm leading-6 text-[#2b3242]/60 md:hidden">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIST PRACTICES (DESIGN & BUILD / INTERIORS) */}
      <section className="bg-[#efeae2] site-section">
        <div className="site-container">
          <SectionIntro
            label="Specialist Practices"
            title={
              <>
                Design & interior
                <SectionBreak />
                <em className="text-[#9f7a47]">coordination.</em>
              </>
            }
            copy="Beyond advisory, we support clients with dedicated design, procurement, and furnishing coordination for their Dubai residences."
          />

          <div className={`mt-12 ${cardGrid(specialistServices.length)}`}>
            {specialistServices.map((specialist) => (
              <div
                key={specialist.id}
                className="card-editorial group flex h-full flex-col justify-between p-5"
              >
                <div>
                  <div className="card-media mb-6">
                    <img
                      {...responsiveImage(specialist.image, [480, 800, 1200])}
                      sizes={CARD_SIZES}
                      alt={specialist.title}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                    Specialist Practice
                  </span>
                  <h3 className="block-title mt-2 text-[#2b3242]">
                    {specialist.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
                    {specialist.description}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#2b3242]/10">
                  <Link
                    href={specialist.href}
                    className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#9f7a47] line-link"
                  >
                    Learn more
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN EXPECT */}
      <section className="bg-[#ebe4d7] site-section">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <SectionLabel>What you can expect</SectionLabel>
            <h2 className="section-title mt-6">
              No noise.
              <SectionBreak />
              <em className="text-[#9f7a47]">Just movement.</em>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#2b3242]/70">
              Clear commitments that guide every conversation, recommendation, and transaction we oversee.
            </p>
          </div>
          <div className="grid gap-5">
            {[
              'A dedicated senior point of contact',
              'Clear, timely communication without pushiness',
              'Independent market perspective and valuation context',
              'End-to-end care through conveyancing and completion',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 border-b border-[#2b3242]/20 pb-4 text-sm font-medium text-[#2b3242]"
              >
                <Check size={16} className="shrink-0 text-[#9f7a47]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQS */}
      <FaqSection compact />
    </main>
  );
}
