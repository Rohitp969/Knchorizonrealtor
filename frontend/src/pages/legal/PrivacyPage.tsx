import { PageHero } from '@/components/blocks';
import { useContact } from '@/lib/site-settings';

/* ============================================================
   PRIVACY POLICY
============================================================ */

export function PrivacyPage() {
  const contact = useContact();

  return (
    <main className="min-h-screen bg-[#faf7f1] text-[#2b3242]">

      {/* =====================================================
          HERO
      ====================================================== */}
      <PageHero
        label="KNC Horizon Realtor"
        title={<>Privacy Policy</>}
        copy="How KNC Horizon Realtor handles information shared through our website, property enquiries and communication channels."
        image="https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/signing-documents.jpg"
      >
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[.18em] text-[#faf7f1]/55">
          Last updated · September 2026
        </p>
      </PageHero>


      {/* =====================================================
          PRIVACY CONTENT
      ====================================================== */}
      <section className="site-section border-t border-[#2b3242]/10">

        <div className="site-container">
          <div className="max-w-[52rem] space-y-12">

          {/* 1 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              About this Privacy Policy
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              This Privacy Policy describes how information may be handled
              when you visit the KNC Horizon Realtor website, contact us,
              submit a property enquiry, request information about a
              development, or otherwise communicate with us through the
              website.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              We aim to handle personal information responsibly and in
              accordance with applicable laws and regulations.
            </p>
          </div>


          {/* 2 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Information we may collect
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Depending on how you interact with the website, we may receive
              information such as:
            </p>

            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-[#2b3242]/70">
              <li>Your name and contact details.</li>
              <li>Email address and telephone number.</li>
              <li>Property preferences and requirements.</li>
              <li>
                Budget or investment information that you choose to provide.
              </li>
              <li>Details contained in your enquiry or message.</li>
              <li>
                Information you voluntarily provide through forms or
                communication channels.
              </li>
              <li>
                Technical information such as browser, device and website
                usage data where applicable.
              </li>
            </ul>
          </div>


          {/* 3 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              How we may use information
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Information may be used for purposes including:
            </p>

            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-[#2b3242]/70">
              <li>Responding to property and service enquiries.</li>
              <li>Providing requested property or project information.</li>
              <li>Understanding your property requirements.</li>
              <li>
                Arranging communication or follow-up requested by you.
              </li>
              <li>Operating, maintaining and improving the website.</li>
              <li>
                Protecting the website against misuse, fraud or security
                threats.
              </li>
              <li>
                Complying with applicable legal or regulatory obligations.
              </li>
            </ul>
          </div>


          {/* 4 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Property enquiries
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              If you submit a property enquiry, the information you provide
              may be used to understand your requirements and respond to your
              request.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Depending on your enquiry, relevant information may also need to
              be shared with an appropriate developer, property owner,
              authorised representative or service provider where this is
              necessary to respond to your request or provide a requested
              service.
            </p>
          </div>


          {/* 5 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Legal basis and consent
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Personal information will be processed on an appropriate legal
              basis depending on the circumstances, including where processing
              is necessary to respond to a request, perform a requested
              service, comply with a legal obligation, protect legitimate
              interests, or where consent is required and has been provided.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Where processing is based on consent, applicable rights regarding
              withdrawal of consent may apply.
            </p>
          </div>


          {/* 6 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Sharing of information
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              We do not intend to sell personal information submitted through
              this website.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Information may be disclosed to service providers, technology
              providers, developers, property owners, professional advisers,
              regulators or other parties where reasonably necessary for the
              purposes described in this Policy or where required by law.
            </p>
          </div>


          {/* 7 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Third-party services
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              The website may use third-party services for hosting, analytics,
              maps, communications, image delivery, forms, security or other
              website functionality.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Those third parties may process information according to their
              own terms and privacy policies.
            </p>
          </div>


          {/* 8 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Cookies and analytics
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              The website may use cookies or similar technologies to support
              functionality, security, analytics and user experience.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Where required, information about cookies and applicable choices
              may be provided through the website or relevant third-party
              service.
            </p>
          </div>


          {/* 9 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Data security
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Reasonable technical and organisational measures should be used
              to protect personal information against unauthorised access,
              alteration, disclosure or destruction.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              However, no internet transmission or electronic storage system
              can be guaranteed to be completely secure.
            </p>
          </div>


          {/* 10 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Data retention
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Personal information may be retained for as long as reasonably
              necessary for the purpose for which it was collected, to handle
              enquiries, maintain business records, comply with legal
              obligations, resolve disputes, or protect legitimate interests.
            </p>
          </div>


          {/* 11 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Your privacy rights
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Depending on applicable law and the circumstances, individuals
              may have rights relating to their personal information,
              including rights to request access, correction or restriction of
              certain processing.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Requests concerning personal information can be sent to KNC
              Horizon Realtor at {contact.email}.
            </p>
          </div>


          {/* 12 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              International transfers
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              Some technology or service providers used by the website may
              process information outside the United Arab Emirates. Where
              applicable, such processing should be carried out in accordance
              with the requirements of applicable data protection laws.
            </p>
          </div>


          {/* 13 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Children's information
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              This website is intended for general property and business
              enquiries and is not directed toward children. We do not
              knowingly request unnecessary personal information from
              children.
            </p>
          </div>


          {/* 14 */}
          <div>
            <h2 className="block-title text-[#2b3242]">
              Changes to this Privacy Policy
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#2b3242]/70">
              This Privacy Policy may be updated from time to time to reflect
              changes in the website, services, technology or applicable legal
              requirements. The latest version will be published on this page.
            </p>
          </div>


          {/* Footer */}
            <div className="border-t border-[#2b3242]/10 pt-8">
              <p className="text-xs leading-6 text-[#2b3242]/60">
                KNC Horizon Realtor · Dubai, UAE
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
