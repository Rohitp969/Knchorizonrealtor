import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { apiFetch, type RemoteProperty } from '@/lib/api';
import { ContactForm, PageHero, SectionLabel } from '@/components/blocks';
import { defaultRemoteProperties } from '@/lib/site-data';
import { absoluteUrl, listingJsonLd, usePageMeta, useSeoData, type SeoFields } from '@/lib/seo';
import { useSiteSettings } from '@/lib/site-settings';
import { altFor, optimizedImage } from '@/lib/cloudinary-image';
import { ErrorState, LoadingState, price } from '@/pages/shared/listing-helpers';

export function PropertyDetailPage() {
  const { defaultCurrency } = useSiteSettings();
  // Both /properties/:slug and the /property/:id alias registered in App.tsx land here
  const [, slugParams] = useRoute('/properties/:slug');
  const [, idParams] = useRoute('/property/:id');
  const slug = slugParams?.slug ?? idParams?.id;
  const params = slug ? { slug } : undefined;
  const defaultMatch = defaultRemoteProperties.find((p) => p.slug === slug || p.id === slug);
  const [property, setProperty] = useState<RemoteProperty | null>(
    (defaultMatch as unknown as RemoteProperty) || null
  );
  const [seo, setSeo] = useState<SeoFields | null>(null);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { settings: seoSettings } = useSeoData();

  usePageMeta(
    property?.title ?? 'Property details',
    property
      ? `${property.title} in ${property.location}. View details and request property information from KNC Horizon Realtor.`
      : 'View property details and request information from KNC Horizon Realtor.',
    {
      path: property ? `/properties/${property.slug}` : undefined,
      seo,
      image: property?.images?.[0],
      imageAlt: property?.title,
      noindex: Boolean(error && !property),
      jsonLd: property ? [listingJsonLd({
        url: `${seoSettings.siteUrl}/properties/${property.slug}`,
        name: property.title,
        description: seo?.metaDescription || property.description,
        image: property.images?.[0] ? absoluteUrl(property.images[0], seoSettings.siteUrl) : null,
        price: property.price,
        currency: property.currency,
      })] : undefined,
    },
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ property: RemoteProperty; seo?: SeoFields | null }>(`/public/properties/${params.slug}`)
      .then((data) => {
        setProperty(data.property);
        setSeo(data.seo ?? null);
        // A renamed listing answers on its old slug; move the address bar to the current one.
        if (slugParams?.slug && data.property.slug && data.property.slug !== slugParams.slug) {
          navigate(`/properties/${data.property.slug}`, { replace: true });
        }
      })
      .catch((reason) => {
        if (!property) setError(reason instanceof Error ? reason.message : 'Property not found.');
      });
  }, [params?.slug]);

  if (error && !property) {
    return (
      <main className="bg-[#faf7f1] site-section pt-40">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/properties" className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
            <ArrowLeft size={14} /> Back to properties
          </Link>
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="site-section pt-40">
        <LoadingState />
      </main>
    );
  }

  return (
    <main>
      <PageHero
        label={`${property.type} · ${property.status}`}
        title={
          <>
            {property.title}
            <br />
            <em className="text-[#d9c6a4]">{property.community}.</em>
          </>
        }
        copy={property.description}
        image={property.images[0] || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg'}
        imageAlt={seo?.imageAlt || property.coverImageAlt || property.title}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_.75fr] lg:gap-16 xl:gap-20">
          <div>
            {/* A lone image takes the full column; a pair or more splits into two. */}
            <div className={`grid gap-4 ${property.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {property.images.map((image, index) => (
                <div key={image} className="card-media card-media-wide">
                  <img
                    src={optimizedImage(image, 1200)}
                    alt={index === 0 ? seo?.imageAlt || property.coverImageAlt || property.title : altFor(image, property.galleryImages, property.title)}
                    onError={(event) => {
                      event.currentTarget.src = 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg';
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12">
              <SectionLabel>About this home</SectionLabel>
              <p className="body-copy measure mt-5 text-[#2b3242]/65">{property.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#2b3242]/15 pt-6 sm:grid-cols-3">
                {property.amenities.map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-[#2b3242]/65">
                    <Check size={15} className="mt-0.5 text-[#9f7a47]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#2b3242]/15 bg-[#fffdf8] p-6 shadow-sm sm:p-8 lg:sticky lg:top-28">
            <SectionLabel>Property details</SectionLabel>
            <p className="display mt-4 text-[2rem] leading-none text-[#2b3242] sm:text-[2.35rem]">{price(property.price, property.currency || defaultCurrency)}</p>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#2b3242]/15 py-5 text-sm text-[#2b3242]/75">
              <span>{property.bedrooms} bedrooms</span>
              <span>{property.bathrooms} bathrooms</span>
              <span>{new Intl.NumberFormat('en-AE').format(property.size)} sq ft</span>
              <span>{property.location}</span>
            </div>
            <h3 className="block-title mt-10">
              Interested in<br />
              <em className="text-[#9f7a47]">this address?</em>
            </h3>
            <div className="mt-6">
              <ContactForm compact propertySlug={property.slug} inquiryType="property" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
