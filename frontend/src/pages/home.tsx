
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
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
  cardGrid,
  fadeUp,
  heroItem,
  heroStagger,
} from '@/components/blocks';
import { PropertySearch } from '@/components/property-search';

import { areas, defaultDevelopers, services, specialistServices } from '@/lib/site-data';
import { useContact } from '@/lib/site-settings';

export default function Home() {
  const contact = useContact();

  /*
   * Hero parallax. The photograph drifts down a little slower than the page, which gives the
   * hero depth without ever moving on its own. The travel is small (24px over the first 600px
   * of scroll) and the layer carries a matching 5% scale so the drift stays inside the crop
   * and never uncovers an edge. Disabled outright for reduced motion.
   */
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroDrift = useTransform(scrollY, [0, 600], [0, 24]);

  return (
    <main className="overflow-x-hidden">

      {/* =========================================================
          HERO
          Compact editorial hero: one left column (headline → copy → CTAs) with the
          search bar directly under it. Photo anchoring lives in index.css.
      ========================================================= */}
      <section
        className="
          home-hero site-gutter relative flex flex-col overflow-hidden
          bg-[#202635] text-[#f5f0e6]
          pb-6 pt-28
          sm:pb-10 sm:pt-28
          md:pb-12 md:pt-32
        "
      >
        <motion.div
          className="home-hero-media"
          style={reduceMotion ? undefined : { y: heroDrift, scale: 1.05 }}
        >
          {/* CC0 public domain: Rupak Chatterjee, via Wikimedia Commons (File:Dubai UAE Landscape.jpg) */}
          <img
            src="/images/hero-dubai-sunset.jpg"
            alt="The Dubai skyline and the Burj Khalifa silhouetted against a golden sunset across the water"
            className="hero-image h-full w-full object-cover"
            fetchPriority="high"
            data-testid="img-hero"
          />
        </motion.div>

        {/* Readability. Phones: full-width column, so the scrim runs top-to-bottom.
            Tablet and up: deeper on the left behind the text, leaving the Burj clear. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,21,35,.78)_0%,rgba(16,21,35,.44)_46%,rgba(16,21,35,.86)_100%)] md:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(100deg,rgba(16,21,35,.9)_0%,rgba(16,21,35,.74)_24%,rgba(16,21,35,.4)_48%,rgba(16,21,35,.1)_70%,rgba(16,21,35,0)_88%)] md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141a2b]/55 via-transparent to-[#141a2b]/45" />

        <div className="relative z-10 site-container flex flex-1 flex-col">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroStagger}
            /* Anchored to the top, not centred: centring split the leftover height in two and
               pushed the headline a further 62px down, and that drift grew on taller screens.
               Top-aligned, the gap under the navbar is the same on every laptop. */
            className="relative flex flex-1 items-start"
          >
            <div className="w-full max-w-[34rem] md:max-w-[46rem]">
              <motion.h1 variants={heroItem} className="hero-title">
                Find your <em className="text-[#d9c6a4]">horizon</em> in Dubai.
              </motion.h1>

              <motion.p variants={heroItem} className="mt-3 max-w-md text-[.8125rem] leading-relaxed text-[#f5f0e6]/75 sm:mt-4 sm:text-base">
                Discover exceptional properties and trusted real estate
                opportunities across Dubai and the UAE.
              </motion.p>

              <motion.div variants={heroItem} className="btn-row mt-5">
                <Link href="/properties" className="btn btn-sand" data-testid="link-hero-properties">
                  Explore properties <ArrowUpRight size={14} />
                </Link>
                <Link href="/contact" className="btn btn-outline-light" data-testid="link-hero-contact">
                  Contact us <ArrowUpRight size={14} />
                </Link>
              </motion.div>
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

          <motion.div variants={heroItem} className="pt-4 sm:pt-6 md:pt-8">
            <PropertySearch />
          </motion.div>

          {/* Takes an equal share of the leftover height with the block above, so the search
              bar keeps the same breathing room above and below it at any window height rather
              than the gap under the buttons absorbing all of it. */}
          <div aria-hidden="true" className="flex-1" />
        </div>
      </section>

      {/* =========================================================
          THE PROPERTY EDIT
          The hero above is dark, so the colour change is the divider: this section opens on
          the same block of padding as every other one. It used to run flush to the hero with
          a hairline rule, which was written for a cream section sitting on cream — against
          the dark hero the rule was invisible and the heading sat 53px higher than the
          heading of every section below it.
      ========================================================= */}
      <section
        className="site-section bg-[#f5f0e6]"
      >
        <div className="site-container">

          <SectionIntro
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
            action={
              <Link
                href="/properties"
                className="line-link inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352] transition-colors hover:text-[#202635]"
                data-testid="link-home-properties"
              >
                View all properties
                <ArrowUpRight size={14} />
              </Link>
            }
          />

          <div className="mt-12">
            <FeaturedProperties />
          </div>
        </div>
      </section>

      {/* =========================================================
          THE KNC APPROACH / INTRODUCTION
      ========================================================= */}
      <section
        id="introduction"
        className="bg-[#e9e4da] site-section"
      >
        <div className="site-container">
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

            <p className="body-copy measure mt-8 text-[#202635]/75">
              KNC Horizon Realtor connects discerning clients with exceptional residential and commercial real estate opportunities across Dubai and the UAE. Our approach combines grounded local market intelligence, high-touch professional advisory, and a dedication to helping every client secure the right property with absolute confidence.
            </p>

            <div className="btn-row mt-10">
              <Link href="/about" className="btn btn-primary" data-testid="link-home-about">
                Discover our story <ArrowUpRight size={14} />
              </Link>
              <Link href="/properties" className="btn btn-secondary">
                Browse property portfolio <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================
          FEATURED OFF-PLAN
      ========================================================= */}
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionIntro
            label="Off-plan in Dubai"
            title={<>New developments<br /><em className="text-[#c97352]">worth an early look.</em></>}
            copy="Launches and off-plan releases from established Dubai developers, with payment plans and handover timelines set out clearly."
          />

          <div className="mt-12">
            <FeaturedProjects />
          </div>

          <div className="btn-row mt-10">
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
        className="overflow-hidden bg-[#dfe2dc] site-section"
      >
        <div className="site-container">
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
              mt-12
              grid
              grid-cols-1
              gap-6
              sm:grid-cols-2
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
            className="line-link mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
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
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionIntro
            label="Developers"
            title={<>The names behind<br /><em className="text-[#c97352]">Dubai&rsquo;s landmarks.</em></>}
            copy="Profiles of the developers building across Dubai&rsquo;s principal communities, each with their own project history and official site."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="btn-row mt-10">
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
        className="bg-[#e9e4da] site-section"
      >
        <div className="site-container">
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

          <div className="mt-12">
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
        className="bg-[#f5f0e6] site-section"
      >
        <div className="site-container">
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

          <div className={`mt-12 ${cardGrid(specialistServices.length)}`}>
            {specialistServices.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="card-editorial group flex h-full flex-col justify-between p-5"
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
        className="bg-[#202635] site-section text-[#f5f0e6]"
      >
        <div className="site-container">
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
              mt-12
              grid
              gap-px
              border-y
              border-[#f5f0e6]/15
              bg-[#f5f0e6]/15
              sm:grid-cols-2
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
      <section className="w-full bg-[#c6d0c9] site-section">
        <div
          className="
            site-container
            grid
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
          <div className="measure w-full min-w-0">
            <SectionLabel>
              Strategic Investment
            </SectionLabel>

            <h2
              className="section-title mt-6 text-[#202635]"
            >
              Invest
              <br />
              <em className="text-[#c97352]">
                in Dubai.
              </em>
            </h2>

            <p
              className="body-copy mt-6 text-[#202635]/65"
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
              className="line-link mt-8 inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.14em] text-[#c97352]"
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
      <section className="bg-[#f5f0e6] site-section">
        <div className="site-container">
          <SectionIntro
            label="Insights"
            title={<>Notes on the<br /><em className="text-[#c97352]">Dubai market.</em></>}
            copy="Perspective on buying, renting and investing in Dubai from our advisory desk."
          />

          <div className="mt-12">
            <LatestInsights />
          </div>

          <div className="btn-row mt-10">
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
        className="site-section relative min-h-[22rem] overflow-hidden bg-[#202635] text-[#f5f0e6] sm:min-h-[24rem] md:min-h-[27rem]"
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
            site-container
            relative
            z-10
            flex
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
              className="body-copy measure mt-8 text-white/70"
            >
              A considered approach to Dubai property, helping you discover
              the right opportunity and move forward with clarity and confidence.
            </p>
          </div>

          <div
            className="btn-row lg:shrink-0 lg:flex-col lg:items-stretch"
          >
            <Link
              href="/contact"
              className="btn btn-sand group"
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
              href={`tel:${contact.phoneHref}`}
              className="btn btn-outline-light group"
              data-testid="link-home-cta-call"
            >
              Call {contact.phoneDisplay}

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
        className="bg-[#f5f0e6] site-section"
      >
        <div
          className="
            site-container
            grid
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
              className="section-title mt-6 text-[#202635]"
            >
              Tell us where
              <br />
              <em className="text-[#c97352]">
                you’re headed.
              </em>
            </h2>

            <p className="measure-narrow mt-6 text-sm leading-7 text-[#202635]/60">
              No hard sell. Just a first conversation about what a good move
              looks like for you.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8 lg:flex-col lg:items-start lg:gap-4">
              <a
                href={`tel:${contact.phoneHref}`}
                className="font-mono text-[10px] uppercase tracking-[.14em] text-[#202635] line-link"
                data-testid="link-contact-phone"
              >
                {contact.phoneDisplay}
              </a>

              <a
                href={`https://wa.me/${contact.whatsapp}`}
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
