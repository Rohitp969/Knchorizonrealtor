
import { motion } from 'framer-motion';
import { ArrowUpRight, Compass, Eye, HandHeart, Headset } from 'lucide-react';
import { Link } from 'wouter';

import {
  AreaCard,
  ContactForm,
  FaqSection,
  FeaturedProjects,
  FeaturedProperties,
  LatestInsights,
  SectionIntro,
  SectionLabel,
  ServiceRow,
  fadeUp,
} from '@/components/blocks';
import { PropertySearch } from '@/components/property-search';

import { areas, defaultDevelopers, services, specialistServices } from '@/lib/site-data';
import { CONTACT } from '@/lib/contact-info';

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* =========================================================
          HERO
          Compact editorial hero: one left column (headline → copy → CTAs) with the
          search bar directly under it. Photo anchoring lives in index.css.
      ========================================================= */}
      <section
        className="
          home-hero relative flex flex-col overflow-hidden
          bg-[#202635] text-[#f5f0e6]
          min-h-[26rem]
          px-5 pb-6 pt-20
          sm:min-h-[32rem] sm:pb-10 sm:pt-24
          md:min-h-[620px] md:px-10 md:pb-12 md:pt-28
          lg:min-h-[660px] lg:max-h-[720px] lg:pb-12
        "
      >
        <div className="home-hero-media">
          {/* CC0 public domain: Rupak Chatterjee, via Wikimedia Commons (File:Dubai UAE Landscape.jpg) */}
          <img
            src="/images/hero-dubai-sunset.jpg"
            alt="The Dubai skyline and the Burj Khalifa silhouetted against a golden sunset across the water"
            className="hero-image h-full w-full object-cover"
            fetchPriority="high"
            data-testid="img-hero"
          />
        </div>

        {/* Readability. Phones: full-width column, so the scrim runs top-to-bottom.
            Tablet and up: deeper on the left behind the text, leaving the Burj clear. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,21,35,.78)_0%,rgba(16,21,35,.44)_46%,rgba(16,21,35,.86)_100%)] md:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(100deg,rgba(16,21,35,.9)_0%,rgba(16,21,35,.74)_24%,rgba(16,21,35,.4)_48%,rgba(16,21,35,.1)_70%,rgba(16,21,35,0)_88%)] md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141a2b]/55 via-transparent to-[#141a2b]/45" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="relative flex flex-1 items-center"
          >
            <div className="w-full max-w-[34rem] md:max-w-[46rem]">
              <h1 className="hero-title">
                Find your <em className="text-[#d9c6a4]">horizon</em> in Dubai.
              </h1>

              <p className="mt-3 max-w-md text-[.8125rem] leading-relaxed text-[#f5f0e6]/75 sm:mt-4 sm:text-base">
                Discover exceptional properties and trusted real estate
                opportunities across Dubai and the UAE.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                <Link href="/properties" className="btn btn-sand" data-testid="link-hero-properties">
                  Explore properties <ArrowUpRight size={14} />
                </Link>
                <Link href="/contact" className="btn btn-outline-light" data-testid="link-hero-contact">
                  Contact us <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Vertical rail: on the content column's right edge, centred against the headline */}
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center lg:flex">
              {/* The rail lands on the brightest part of the photo, so it carries its own falloff */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -right-10 w-40 bg-[radial-gradient(ellipse_at_center,rgba(20,26,43,.34)_0%,rgba(20,26,43,.18)_46%,rgba(20,26,43,0)_76%)]"
              />
              <div className="relative flex flex-col items-center gap-4">
                <span aria-hidden="true" className="h-10 w-px bg-[#f5f0e6]/35" />
                <p className="eyebrow whitespace-nowrap text-[#f5f0e6]/80 [writing-mode:vertical-rl]">
                  Property advisory · Dubai, UAE
                </p>
                <span aria-hidden="true" className="h-10 w-px bg-[#f5f0e6]/35" />
              </div>
            </div>
          </motion.div>

          <div className="mt-auto pt-4 sm:pt-6 md:pt-8">
            <PropertySearch />
          </div>
        </div>
      </section>

      {/* =========================================================
          THE PROPERTY EDIT
          Same background as the section above, so it opens with a
          divider instead of a second full block of padding.
      ========================================================= */}
      <section
        className="home-flush-top bg-[#f5f0e6] px-5 pb-20 md:px-10 md:pb-28"
      >
        <div className="mx-auto max-w-[1280px] border-t border-[#202635]/12 pt-14 sm:pt-16 md:pt-20">

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between xl:gap-12">
            <SectionIntro
              className="xl:flex-1"
              label="The Property Edit"
              title={
                <>
                  Properties with
                  <br />
                  <em className="text-[#c97352]">
                    a point of view.
                  </em>
                </>
              }
              copy="A curated selection of distinctive homes, spaces and investment opportunities in Dubai."
            />

            <Link
              href="/properties"
              className="
                mb-1
                hidden
                shrink-0
                items-center gap-2
                whitespace-nowrap
                font-mono text-[10px]
                uppercase tracking-[.14em]
                text-[#c97352]
                transition-colors
                hover:text-[#202635]
                xl:flex
              "
              data-testid="link-home-properties"
            >
              View all properties
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-10 md:mt-14">
            <FeaturedProperties />
          </div>

          <Link
            href="/properties"
            className="
              mt-8
              inline-flex items-center gap-2
              font-mono text-[10px]
              uppercase tracking-[.14em]
              text-[#c97352]
              line-link
              xl:hidden
            "
            data-testid="link-home-properties-mobile"
          >
            View all properties
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* =========================================================
          THE KNC APPROACH / INTRODUCTION
      ========================================================= */}
      <section
        id="introduction"
        className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="flex flex-col items-start"
          >
            <SectionLabel>
              The KNC Approach
            </SectionLabel>

            <h2
              className="section-title mt-6 max-w-4xl text-[#202635]"
            >
              Your trusted real estate partner in{' '}
              <em className="text-[#c97352]">Dubai.</em>
            </h2>

            <p className="mt-8 max-w-3xl text-base leading-relaxed text-[#202635]/75 sm:leading-8">
              KNC Horizon Realtor connects discerning clients with exceptional residential and commercial real estate opportunities across Dubai and the UAE. Our approach combines grounded local market intelligence, high-touch professional advisory, and a dedication to helping every client secure the right property with absolute confidence.
            </p>

            <div className="mt-8 flex w-full flex-col items-start gap-5 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/about"
                className="
                  inline-flex w-full items-center justify-between gap-3
                  bg-[#202635]
                  px-6 py-3.5
                  font-mono text-[10px]
                  uppercase tracking-[.14em]
                  text-[#f5f0e6]
                  transition-colors
                  hover:bg-[#c97352]
                  sm:w-auto sm:justify-start
                "
                data-testid="link-home-about"
              >
                Discover our story
                <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/properties"
                className="
                  font-mono text-[10px]
                  uppercase tracking-[.14em]
                  text-[#c97352]
                  line-link
                "
              >
                Browse property portfolio
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          FEATURED OFF-PLAN
      ========================================================= */}
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Off-plan in Dubai"
            title={<>New developments<br /><em className="text-[#c97352]">worth an early look.</em></>}
            copy="Launches and off-plan releases from established Dubai developers, with payment plans and handover timelines set out clearly."
          />

          <div className="mt-12">
            <FeaturedProjects />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/off-plan" className="btn btn-primary" data-testid="link-home-offplan">
              Explore off-plan <ArrowUpRight size={14} />
            </Link>
            <Link href="/off-plan/new-launches" className="btn btn-secondary" data-testid="link-home-new-launches">
              New launches <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          AREAS
          Swipeable row on phones, 2-up on tablets, 3-up on desktop
          (six areas divide evenly, so no half-empty last row)
      ========================================================= */}
      <section
        className="overflow-hidden bg-[#dfe2dc] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Dubai Communities"
            title={
              <>
                Know the feeling
                <br />
                of each{' '}
                <em className="text-[#c97352]">
                  address.
                </em>
              </>
            }
            copy="From island mornings to the city’s next horizon, a sense of place changes everything."
          />

          {/* One card per row on phones: the old peek carousel left a card cut off at the edge. */}
          <div
            className="
              mt-10
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              md:mt-14
              lg:grid-cols-3
            "
          >
            {areas.map((area, i) => (
              <AreaCard
                key={area.id}
                area={area}
                index={i}
                className="w-full"
              />
            ))}
          </div>

          <Link
            href="/areas"
            className="
              mt-8
              inline-flex
              items-center gap-2
              font-mono text-[10px]
              uppercase tracking-[.14em]
              text-[#c97352]
              line-link
            "
            data-testid="link-home-areas"
          >
            Read our area notes
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* =========================================================
          DEVELOPERS
      ========================================================= */}
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Developers"
            title={<>The names behind<br /><em className="text-[#c97352]">Dubai&rsquo;s landmarks.</em></>}
            copy="Profiles of the developers building across Dubai&rsquo;s principal communities, each with their own project history and official site."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {defaultDevelopers.slice(0, 8).map((developer) => (
              <Link
                key={developer.slug}
                href={`/developers/${developer.slug}`}
                className="card-editorial group p-5"
                data-testid={`link-home-developer-${developer.slug}`}
              >
                <span className="grid h-10 w-10 place-items-center border border-[#202635]/15 font-serif text-lg text-[#202635]">
                  {developer.name.charAt(0)}
                </span>
                <h3 className="card-title mt-4 line-clamp-1 transition-colors group-hover:text-[#c97352]">{developer.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#202635]/60">{developer.shortDescription}</p>
                <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] group-hover:underline">
                  View profile
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/developers" className="btn btn-primary" data-testid="link-home-developers">
              All developers <ArrowUpRight size={14} />
            </Link>
            <Link href="/off-plan/developers" className="btn btn-secondary">
              Browse projects by developer <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          SERVICES
      ========================================================= */}
      <section
        className="bg-[#e9e4da] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Advisory Services"
            title={
              <>
                The right advice,
                <br />
                <em className="text-[#c97352]">
                  at the right moment.
                </em>
              </>
            }
            copy="Property decisions have a pace of their own. Our role is to bring perspective, momentum, and discretion to every one."
          />

          <div className="mt-10 md:mt-16">
            {services.map((service) => (
              <ServiceRow
                key={service.id}
                service={service}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SPECIALIST SERVICES
          Two services, so a two-column grid (no empty third column)
      ========================================================= */}
      <section
        className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Specialist Design & Living Solutions"
            title={
              <>
                Spaces with
                <br />
                <em className="text-[#c97352]">
                  a point of view.
                </em>
              </>
            }
            copy="When the right property is only the beginning, our design and interiors team helps you carry the idea through."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
            {specialistServices.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="card-editorial group flex h-full flex-col justify-between p-6"
                data-testid={`link-specialist-${service.id}`}
              >
                <div>
                  <div className="card-media">
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-105
                      "
                    />
                  </div>

                  <p
                    className="
                      mt-4
                      font-mono text-[10px]
                      uppercase tracking-[.14em]
                      text-[#c97352]
                    "
                  >
                    KNC Studio
                  </p>

                  <h3 className="block-title mt-2 text-[#202635] transition-colors group-hover:text-[#c97352]">
                    {service.title}
                  </h3>

                  <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#202635]/65">
                    {service.description}
                  </p>
                </div>

                <span
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] group-hover:underline"
                >
                  Explore service
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY KNC
      ========================================================= */}
      <section
        className="bg-[#202635] px-5 py-20 md:px-10 md:py-28 text-[#f5f0e6]"
      >
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Why KNC Horizon"
            title={
              <>
                A clear head in
                <br />
                <em className="text-[#d9c6a4]">
                  a fast city.
                </em>
              </>
            }
            copy="Our best work happens in the space between the numbers — in the listening, editing, and follow-through."
            light
          />

          <div
            className="
              mt-10
              grid
              gap-px
              border-y
              border-[#f5f0e6]/15
              bg-[#f5f0e6]/15
              sm:grid-cols-2
              md:mt-14
              lg:grid-cols-4
            "
          >
            {[
              {
                icon: Compass,
                title: 'Dubai market expertise',
                copy: 'A close reading of the city, its communities, and the opportunities that are worth your attention.',
              },
              {
                icon: Eye,
                title: 'Trusted and transparent service',
                copy: 'Clear advice, honest context, and no pressure — so every decision feels informed.',
              },
              {
                icon: HandHeart,
                title: 'Personalized property solutions',
                copy: 'A thoughtful search shaped around your life, goals, and the way you want to move forward.',
              },
              {
                icon: Headset,
                title: 'Professional client support',
                copy: 'One accountable point of contact from the first conversation through to completion.',
              },
            ].map(
              ({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="
                    bg-[#202635]
                    py-7
                    sm:p-6
                    md:p-8
                  "
                >
                  <Icon
                    size={22}
                    className="text-[#c97352]"
                  />

                  <h3 className="block-title mt-5 md:mt-10">
                    {title}
                  </h3>

                  <p className="mt-3 max-w-xs text-sm leading-6 text-[#f5f0e6]/60 md:mt-4">
                    {copy}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          INVESTMENT
      ========================================================= */}
      <section className="w-full bg-[#c6d0c9] px-5 py-20 md:px-10 md:py-28">
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1280px]
            items-center
            gap-10
            md:gap-12
            lg:grid-cols-[0.95fr_1.05fr]
            lg:gap-16
            xl:gap-24
          "
        >
          {/* IMAGE */}
          <div
            className="
              relative
              aspect-[4/3]
              w-full
              overflow-hidden
              rounded-sm
              shadow-sm
              sm:aspect-[16/9]
              lg:aspect-[5/4]
            "
          >
            <img
              src="/images/interior-detail.jpg"
              alt="Warm stone and brass details in a Dubai interior"
              loading="lazy"
              className="
                block
                h-full
                w-full
                object-cover
                object-center
              "
              data-testid="img-investment"
            />

            <div className="absolute inset-0 bg-[#202635]/8" />
          </div>

          {/* CONTENT */}
          <div className="w-full min-w-0 max-w-[570px]">
            <SectionLabel>
              Strategic Investment
            </SectionLabel>

            <h2
              className="section-title mt-4 max-w-[560px] text-[#202635]"
            >
              Invest
              <br />
              <em className="text-[#c97352]">
                in Dubai.
              </em>
            </h2>

            <p
              className="
                mt-6
                max-w-[520px]
                text-sm
                leading-6
                text-[#202635]/65
                sm:text-base
                sm:leading-7
              "
            >
              Explore opportunities in one of the world’s most dynamic real
              estate markets. We bring local perspective to residential
              investments, off-plan opportunities, high-growth locations,
              and luxury properties.
            </p>

            {/* INVESTMENT POINTS */}
            <div
              className="
                mt-6
                grid
                max-w-[520px]
                grid-cols-1
                gap-x-8
                gap-y-3
                border-t
                border-[#202635]/20
                pt-4
                font-mono
                text-[10px]
                uppercase
                tracking-[.1em]
                text-[#202635]/70
                min-[420px]:grid-cols-2
              "
            >
              <span>Residential investments</span>
              <span>Off-plan opportunities</span>
              <span>High-growth locations</span>
              <span>Luxury properties</span>
            </div>

            {/* CTA */}
            <Link
              href="/services#investment"
              className="
                mt-7
                inline-flex
                items-center
                gap-3
                font-mono
                text-[10px]
                uppercase
                tracking-[.14em]
                text-[#c97352]
                line-link
              "
              data-testid="link-home-investment"
            >
              Talk to our property advisor
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          MARKET & INSIGHTS
      ========================================================= */}
      <section className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1280px]">
          <SectionIntro
            label="Insights"
            title={<>Notes on the<br /><em className="text-[#c97352]">Dubai market.</em></>}
            copy="Perspective on buying, renting and investing in Dubai from our advisory desk."
          />

          <div className="mt-12">
            <LatestInsights />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/blog" className="btn btn-primary" data-testid="link-home-blog">
              Read the journal <ArrowUpRight size={14} />
            </Link>
            <Link href="/market-insights" className="btn btn-secondary" data-testid="link-home-market-insights">
              Market insights <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================= */}
      <FaqSection />

      {/* =========================================================
          CTA IMAGE
          min-height (not a fixed height) so the buttons are never
          cut off when the copy wraps on small screens
      ========================================================= */}
      <section
        className="mobile-cta-section relative min-h-[360px] overflow-hidden bg-[#202635] px-5 py-20 md:px-10 md:py-28 text-[#f5f0e6] sm:min-h-[400px] md:min-h-[440px]"
      >
        <img
          src="/images/creek-waterfront.jpg"
          alt="Dubai Creek waterfront at blue hour"
          loading="lazy"
          className="
            absolute inset-0
            h-full w-full
            object-cover
            opacity-45
          "
          data-testid="img-cta"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#202635]/95 via-[#202635]/55 to-[#202635]/40" />

        <div
          className="
            relative
            z-10
            mx-auto
            flex
            max-w-[1280px]
            flex-col
            justify-between
            gap-10
            lg:flex-row
            lg:items-end
            lg:gap-16
          "
        >
          <div>
            <SectionLabel light>
              Private Advisory
            </SectionLabel>

            <h2
              className="section-title mt-6 max-w-3xl"
            >
              Let’s find your
              <br />
              <em className="text-[#d9c6a4]">
                next property.
              </em>
            </h2>

            <p
              className="
                mt-8
                max-w-2xl
                text-sm
                leading-7
                text-white/70
                sm:text-base
              "
            >
              A considered approach to Dubai property, helping you discover
              the right opportunity and move forward with clarity and confidence.
            </p>
          </div>

          <div
            className="
              flex
              flex-col
              items-stretch
              gap-4
              sm:flex-row
              sm:items-center
              sm:gap-8
              lg:shrink-0
              lg:flex-col
              lg:items-end
              lg:gap-4
            "
          >
            <Link
              href="/contact"
              className="group flex items-center justify-between gap-4 whitespace-nowrap border border-[#f5f0e6]/45 px-5 py-4 font-mono text-[10px] uppercase tracking-[.14em] transition-colors hover:bg-[#f5f0e6] hover:text-[#202635]"
              data-testid="link-home-cta-contact"
            >
              Contact us

              <ArrowUpRight
                size={15}
                className="
                  transition-transform
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </Link>

            <a
              href={`tel:${CONTACT.phoneHref}`}
              className="group flex items-center gap-3 whitespace-nowrap py-1 font-mono text-[10px] uppercase tracking-[.14em] text-[#f5f0e6]/80 transition-colors hover:text-[#d9c6a4]"
              data-testid="link-home-cta-call"
            >
              Call {CONTACT.phoneDisplay}

              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT
      ========================================================= */}
      <section
        id="contact"
        className="bg-[#f5f0e6] px-5 py-20 md:px-10 md:py-28"
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1280px]
            gap-12
            md:gap-14
            lg:grid-cols-[.8fr_1.2fr]
            lg:gap-20
          "
        >
          <div>
            <SectionLabel>
              Start a Conversation
            </SectionLabel>

            <h2
              className="section-title mt-5 text-[#202635]"
            >
              Tell us where
              <br />
              <em className="text-[#c97352]">
                you’re headed.
              </em>
            </h2>

            <p className="mt-6 max-w-sm text-sm leading-6 text-[#202635]/60">
              No hard sell. Just a first conversation about what a good move
              looks like for you.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8 lg:flex-col lg:items-start lg:gap-4">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635] line-link"
                data-testid="link-contact-phone"
              >
                {CONTACT.phoneDisplay}
              </a>

              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] line-link"
                data-testid="link-contact-whatsapp"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

    </main>
  );
}
