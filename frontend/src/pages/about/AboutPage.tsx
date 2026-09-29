import { ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { PageHero, SectionIntro, SectionLabel } from '@/components/blocks';

export function AboutPage() {
  return (
    <main className="overflow-x-clip">

      {/* HERO */}
      <PageHero
        label="About KNC Horizon"
        title={
          <>
            A steady point
            <br />
            in a moving city.
          </>
        }
        copy="We are an independent Dubai property advisory for people who value context, candour, and an exceptionally well-handled move."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577270/knc-horizon/hero/dubai-skyline-creek-sunset.jpg"
      />

      {/* OUR POINT OF VIEW */}
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          <SectionLabel>Our Point of View</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#2b3242]">
            The best property advice starts with a better{" "}
            <em className="text-[#9f7a47]">question.</em>
          </h2>

          <p className="body-copy measure mt-8 text-[#2b3242]/75">
            What does home need to make possible? What would make this
            investment resilient? Which parts of the city feel like you?
            These are the questions that shape our work — long before we
            send a listing.
          </p>

          <p className="body-copy measure mt-5 text-[#2b3242]/75">
            KNC was founded to make the Dubai property experience feel
            more human. Our clients come from everywhere, but they all want
            the same thing: someone local enough to know the detail, and
            independent enough to tell the truth.
          </p>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="bg-[#f2ede4] site-section">
        <div className="site-container">
          <SectionIntro
            label="Our Working Method"
            title={
              <>
                Calm is not passive.
                <br />
                <em className="text-[#9f7a47]">It is prepared.</em>
              </>
            }
            copy="A high-touch process, built around the detail that makes decisions feel simple."
          />

          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                step: "Discovery & Brief",
                title: "Listen before we look",
                desc: "A proper brief makes everything downstream sharper. We learn the practicals, the preferences, and the non-negotiables.",
              },
              {
                step: "Curated Analysis",
                title: "Edit with context",
                desc: "Every recommendation comes with the why: the community, the quality, the value, and the questions worth asking.",
              },
              {
                step: "Advisory to Completion",
                title: "Stay close through handover",
                desc: "Our work does not end when the offer is accepted. We keep momentum through the details, right up to the handover.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border-t border-[#2b3242]/20 pt-6"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#9f7a47]">
                  {item.step}
                </span>

                <h3 className="block-title mt-4 max-w-sm text-[#2b3242]">
                  {item.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[#2b3242]/65">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR COMMITMENT */}
      <section className="bg-[#eee6d8] site-section text-[#2b3242]">
        <div className="site-container">
          <SectionLabel>Our Commitment</SectionLabel>

          <h2 className="section-title mt-6 max-w-4xl text-[#2b3242]">
            Useful honesty,
            <br />
            <em className="text-[#9f7a47]">beautifully delivered.</em>
          </h2>

          <p className="body-copy measure mt-8 text-[#2b3242]/75">
            We will always tell you what we see, what we know, and what we
            would do if it were our decision. That is the foundation of trust
            — and the reason our business is built on referrals.
          </p>

          <div className="btn-row mt-10">
            <Link href="/contact" className="btn btn-primary" data-testid="link-about-contact">
              Start a conversation <ArrowUpRight size={14} />
            </Link>
            <Link href="/about/approach" className="btn btn-secondary" data-testid="link-about-approach">
              Our approach <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
