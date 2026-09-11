
import { motion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Compass, Eye, HandHeart } from 'lucide-react';
import { Link } from 'wouter';

import {
  AreaCard,
  ContactForm,
  FaqSection,
  FeaturedProperties,
  NewsletterForm,
  SectionIntro,
  SectionLabel,
  ServiceRow,
  fadeUp,
} from '@/components/blocks';

import { areas, services, specialistServices } from '@/lib/site-data';
import { CONTACT } from '@/lib/contact-info';

export default function Home() {
  return (
    <main className="overflow-x-hidden">

      {/* =========================================================
          HERO
          Controlled height instead of full viewport image
      ========================================================= */}
      <section
        className="
          home-hero relative flex
          min-h-[520px] h-[580px]
          items-end
          overflow-hidden
          bg-[#202635]
          px-5 pb-10 pt-24
          text-[#f5f0e6]
          sm:h-[620px]
          md:h-[660px]
          md:min-h-0
          md:px-10
          md:pb-14
        "
      >
        <img
          src="/images/hero-dubai-villa.jpg"
          alt="A calm waterfront villa in Dubai at dusk"
          className="
            hero-image
            absolute inset-0
            h-full w-full
            object-cover
            opacity-70
          "
          data-testid="img-hero"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#202635]/95 via-[#202635]/25 to-[#202635]/35" />

        <div className="absolute left-5 top-1/2 hidden -translate-y-1/2 [writing-mode:vertical-rl] md:left-10 md:block">
          <span className="eyebrow text-[#f5f0e6]/65">
            Property advisory · Dubai, UAE
          </span>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1380px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >

            <h1
              className="
                display
                mt-5
                max-w-5xl
                text-5xl
                leading-[.88]
                tracking-[-.045em]
                sm:text-6xl
                md:mt-6
                md:text-[7.5rem]
                lg:text-[9rem]
              "
            >
              Find your
              <br />
              <em className="text-[#d9c6a4]">horizon</em>
              <br />
              in Dubai.
            </h1>

            <div className="mt-7 flex flex-col justify-between gap-5 md:mt-9 md:flex-row md:items-end">
              <div className="max-w-sm">
                <p className="text-sm leading-6 text-[#f5f0e6]/72">
                  Discover exceptional properties and trusted real estate
                  opportunities across Dubai and the UAE.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/properties"
                    className="
                      inline-flex items-center gap-3
                      bg-[#d9c6a4]
                      px-5 py-3
                      font-mono text-[10px]
                      uppercase tracking-[.13em]
                      text-[#202635]
                      transition-colors
                      hover:bg-[#f5f0e6]
                    "
                    data-testid="link-hero-properties"
                  >
                    Explore properties
                    <ArrowUpRight size={14} />
                  </Link>

                  <Link
                    href="/contact"
                    className="
                      inline-flex items-center gap-3
                      border border-[#f5f0e6]/45
                      px-5 py-3
                      font-mono text-[10px]
                      uppercase tracking-[.13em]
                      text-[#f5f0e6]
                      transition-colors
                      hover:bg-[#f5f0e6]
                      hover:text-[#202635]
                    "
                    data-testid="link-hero-contact"
                  >
                    Contact us
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              <a
                href="#introduction"
                className="
                  group flex items-center gap-3
                  font-mono text-[10px]
                  uppercase tracking-[.15em]
                  text-[#f5f0e6]/80
                "
                data-testid="link-hero-scroll"
              >
                Scroll to explore

                <span
                  className="
                    grid h-9 w-9
                    place-items-center
                    rounded-full
                    border border-[#f5f0e6]/45
                    transition-transform
                    group-hover:translate-y-1
                  "
                >
                  <ArrowDown size={15} />
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>


      {/* =========================================================
          INTRODUCTION
      ========================================================= */}
      <section
        id="introduction"
        className="
          bg-[#f5f0e6]
          px-5 py-16
          sm:py-20
          md:px-10 md:py-28
        "
      >
        <div
          className="
            mx-auto grid
            max-w-[1380px]
            gap-10
            md:grid-cols-[.7fr_1.6fr]
            md:gap-20
          "
        >
          <div>
            <SectionLabel>
              01 / The KNC approach
            </SectionLabel>

            <p className="mt-6 max-w-[180px] text-sm leading-6 text-[#202635]/55">
              For those who know that the right address is more than a pin on a map.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            <h2
              className="
                display
                max-w-4xl
                text-4xl
                leading-[.95]
                text-[#202635]
                sm:text-5xl
                md:text-[5rem]
              "
            >
              Your trusted real estate partner in{' '}
              <em className="text-[#c97352]">Dubai.</em>
            </h2>

            <p
              className="
                mt-7
                max-w-2xl
                text-base
                leading-7
                text-[#202635]/65
                md:ml-[18%]
              "
            >
              KNC Horizon Realtor connects clients with exceptional
              residential and commercial real estate opportunities across
              Dubai and the UAE. Our approach combines local market
              knowledge, professional service and a commitment to helping
              every client find the right property.
            </p>

            <Link
              href="/about"
              className="
                mt-7
                inline-flex items-center gap-3
                font-mono text-[10px]
                uppercase tracking-[.14em]
                text-[#c97352]
                line-link
                md:ml-[18%]
              "
              data-testid="link-home-about"
            >
              Discover more
              <ArrowUpRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>


      {/* =========================================================
          SERVICES
      ========================================================= */}
      <section
        className="
          bg-[#e9e4da]
          px-5 py-16
          sm:py-20
          md:px-10 md:py-24
        "
      >
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="02 / What we do"
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
          SMALLER IMAGES
      ========================================================= */}
      <section
        className="
          bg-[#f5f0e6]
          px-5 py-16
          sm:py-20
          md:px-10 md:py-28
        "
      >
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="KNC Studio / Specialist services"
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

          <div className="mt-10 grid gap-7 sm:grid-cols-2 md:mt-14 lg:grid-cols-3 md:gap-8">
            {specialistServices.map((service) => (
              <Link
                key={service.id}
                href={service.href}
                className="
                  group
                  flex
                  h-full
                  flex-col
                  justify-between
                  border-t
                  border-[#202635]/20
                  pt-5
                "
                data-testid={`link-specialist-${service.id}`}
              >
                <div>
                  <div
                    className="
                      relative
                      aspect-[16/10]
                      h-[180px]
                      sm:h-[200px]
                      md:h-[220px]
                      w-full
                      overflow-hidden
                      rounded-sm
                      bg-[#202635]/10
                    "
                  >
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
                    {service.index} / KNC studio
                  </p>

                  <h3 className="mt-2 font-serif text-2xl md:text-3xl text-[#202635] transition-colors group-hover:text-[#c97352]">
                    {service.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-[#202635]/65">
                    {service.description}
                  </p>
                </div>

                <span
                  className="
                    mt-5
                    inline-flex items-center gap-2
                    font-mono text-[10px]
                    uppercase tracking-[.13em]
                    text-[#c97352]
                    group-hover:underline
                  "
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
          03 / THE EDIT
      ========================================================= */}
      <section
        className="
          bg-[#f5f0e6]
          px-5 py-16
          sm:py-20
          md:px-10 md:py-28
        "
      >
        <div className="mx-auto max-w-[1380px]">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionIntro
              label="03 / The Edit"
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
                items-center gap-2
                font-mono text-[10px]
                uppercase tracking-[.14em]
                text-[#c97352]
                transition-colors
                hover:text-[#202635]
                md:flex
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
              flex items-center gap-2
              font-mono text-[10px]
              uppercase tracking-[.14em]
              text-[#c97352]
              md:hidden
            "
            data-testid="link-home-properties-mobile"
          >
            View all properties
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>


      {/* =========================================================
          WHY KNC
      ========================================================= */}
      <section
        className="
          bg-[#202635]
          px-5 py-16
          text-[#f5f0e6]
          sm:py-20
          md:px-10 md:py-28
        "
      >
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="04 / Why KNC"
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
              md:mt-14
              md:grid-cols-4
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
                icon: Compass,
                title: 'Professional client support',
                copy: 'One accountable point of contact from the first conversation through to completion.',
              },
            ].map(
              ({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="
                    bg-[#202635]
                    p-6
                    md:p-8
                  "
                >
                  <Icon
                    size={22}
                    className="text-[#c97352]"
                  />

                  <h3 className="mt-10 font-serif text-2xl leading-tight">
                    {title}
                  </h3>

                  <p className="mt-4 max-w-xs text-sm leading-6 text-[#f5f0e6]/55">
                    {copy}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>


      {/* =========================================================
          AREAS
          CHILD CARD IMAGES CONTROLLED
      ========================================================= */}
      <section
        className="
          overflow-hidden
          bg-[#dfe2dc]
          px-5 py-16
          sm:py-20
          md:px-10 md:py-28
        "
      >
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            label="05 / Neighbourhood notes"
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

          <div
            className="
              mt-10
              grid
              grid-cols-1
              gap-5
              sm:grid-cols-2
              md:mt-14
              md:grid-cols-4
            "
          >
            {areas.map((area, i) => (
              <AreaCard
                key={area.id}
                area={area}
                index={i}
              />
            ))}
          </div>

          <Link
            href="/areas"
            className="
              mt-7
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
          INVESTMENT
          SMALLER IMAGE
      ========================================================= */}
      <section
        className="
          grid
          bg-[#c6d0c9]
          md:grid-cols-[.85fr_1.15fr]
        "
      >

        {/* IMAGE */}
        <div
          className="
            relative
            order-2
            aspect-[16/10]
            h-[260px]
            overflow-hidden
            rounded-sm
            sm:h-[320px]
            md:order-1
            md:h-[380px]
            lg:h-[420px]
          "
        >
          <img
            src="/images/interior-detail.jpg"
            alt="Warm stone and brass details in a Dubai interior"
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
            "
            data-testid="img-investment"
          />

          <div className="absolute inset-0 bg-[#202635]/10" />
        </div>

        {/* CONTENT */}
        <div
          className="
            order-1
            flex
            items-center
            px-5
            py-14
            md:order-2
            md:px-16
            md:py-20
          "
        >
          <div className="max-w-xl">
            <SectionLabel>
              06 / A longer view
            </SectionLabel>

            <h2
              className="
                display
                mt-5
                text-4xl
                leading-[.92]
                text-[#202635]
                sm:text-5xl
                md:text-7xl
              "
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
                max-w-md
                text-sm
                leading-7
                text-[#202635]/65
              "
            >
              Explore opportunities in one of the world’s most dynamic real
              estate markets. We bring local perspective to residential
              investments, off-plan opportunities, high-growth locations,
              and luxury properties.
            </p>

            <div
              className="
                mt-6
                grid
                max-w-md
                grid-cols-2
                gap-x-5
                gap-y-3
                border-t
                border-[#202635]/20
                pt-5
                font-mono
                text-[10px]
                uppercase
                tracking-[.1em]
                text-[#202635]/70
              "
            >
              <span>Residential investments</span>
              <span>Off-plan opportunities</span>
              <span>High-growth locations</span>
              <span>Luxury properties</span>
            </div>

            <Link
              href="/services#investment"
              className="
                mt-7
                inline-flex
                items-center gap-3
                font-mono text-[10px]
                uppercase tracking-[.14em]
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
          FAQ
      ========================================================= */}
      <FaqSection />


      {/* =========================================================
          JOURNAL
      ========================================================= */}
      <section
        className="
          bg-[#202635]
          px-5 py-16
          text-[#f5f0e6]
          sm:py-20
          md:px-10 md:py-24
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1380px]
            flex-col
            justify-between
            gap-8
            md:flex-row
            md:items-end
          "
        >
          <div>
            <SectionLabel light>
              08 / The blog
            </SectionLabel>

            <h2
              className="
                display
                mt-5
                max-w-xl
                text-4xl
                leading-[.9]
                sm:text-5xl
                md:text-7xl
              "
            >
              A little more
              <br />
              <em className="text-[#d9c6a4]">
                context.
              </em>
            </h2>
          </div>

          <div className="max-w-sm">
            <p className="text-sm leading-6 text-[#f5f0e6]/60">
              Occasional notes on Dubai property, neighbourhoods, and making
              a move with more clarity.
            </p>

            <NewsletterForm />
          </div>
        </div>
      </section>


      {/* =========================================================
          CTA IMAGE
          CONTROLLED HEIGHT
      ========================================================= */}
      <section
        className="
          mobile-cta-section
          relative
          h-[360px]
          overflow-hidden
          bg-[#202635]
          px-5
          py-14
          text-[#f5f0e6]
          sm:h-[400px]
          md:h-[440px]
          md:px-10
          md:py-20
        "
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
            max-w-[1380px]
            flex-col
            justify-between
            gap-12
            md:min-h-[310px]
            md:flex-row
          "
        >
          <div>
            <SectionLabel light>
              07 / Your next move
            </SectionLabel>

            <h2
              className="
                display
                mt-6
                max-w-3xl
                text-4xl
                leading-[.86]
                sm:text-5xl
                md:text-[6rem]
              "
            >
              Let’s find your
              <br />
              <em className="text-[#d9c6a4]">
                next property.
              </em>
            </h2>
          </div>

          <div
            className="
              flex
              flex-col
              items-start
              gap-3
              md:items-end
            "
          >
            <Link
              href="/contact"
              className="
                group
                flex
                items-center
                gap-4
                border
                border-[#f5f0e6]/45
                px-5
                py-4
                font-mono
                text-[10px]
                uppercase
                tracking-[.15em]
                transition-colors
                hover:bg-[#f5f0e6]
                hover:text-[#202635]
              "
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
              className="
                group
                flex
                items-center
                gap-3
                font-mono
                text-[10px]
                uppercase
                tracking-[.15em]
                text-[#f5f0e6]/80
                transition-colors
                hover:text-[#d9c6a4]
              "
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
        className="
          bg-[#f5f0e6]
          px-5 py-16
          sm:py-20
          md:px-10 md:py-28
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1380px]
            gap-12
            md:grid-cols-[.75fr_1.25fr]
            md:gap-20
          "
        >
          <div>
            <SectionLabel>
              08 / Connect
            </SectionLabel>

            <h2
              className="
                display
                mt-5
                text-4xl
                leading-[.92]
                text-[#202635]
                sm:text-5xl
                md:text-7xl
              "
            >
              Tell us where
              <br />
              <em className="text-[#c97352]">
                you’re headed.
              </em>
            </h2>

            <p className="mt-6 max-w-xs text-sm leading-6 text-[#202635]/60">
              No hard sell. Just a first conversation about what a good move
              looks like for you.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3">
              <a
                href={`tel:${CONTACT.phoneHref}`}
                className="
                  font-mono
                  text-[10px]
                  uppercase
                  tracking-[.13em]
                  text-[#202635]
                  line-link
                "
                data-testid="link-contact-phone"
              >
                {CONTACT.phoneDisplay}
              </a>

              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="
                  font-mono
                  text-[10px]
                  uppercase
                  tracking-[.13em]
                  text-[#c97352]
                  line-link
                "
                data-testid="link-contact-whatsapp"
              >
                WhatsApp instead
              </a>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

    </main>
  );
}