import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { apiFetch, type RemoteProperty } from '@/lib/api';
import { ContactForm, PageHero, SectionLabel, SectionBreak, fitsOneLine } from '@/components/blocks';
import { defaultRemoteProperties } from '@/lib/site-data';
import { absoluteUrl, listingJsonLd, usePageMeta, useSeoData, type SeoFields } from '@/lib/seo';
import { useSiteSettings } from '@/lib/site-settings';
import { altFor, isRepresentative, responsiveImage, GALLERY_SIZES } from '@/lib/cloudinary-image';
import { bedroomsLabel, isRental, propertyPriceLabel } from '@/lib/listing-format';
import { ErrorState, ImageCredits, LoadingState, SourceNote } from '@/pages/shared/listing-helpers';

const fallbackImage = 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg';

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

  // The place under the name: the community, or the address when no community is recorded.
  // A name that already says where it is ("Silva at Dubai Creek Harbour") gets its developer
  // instead, and a record with neither shows the name alone rather than a stray full stop.
  const community = (property.community || property.location || '').trim();
  const place = community && property.title.toLowerCase().includes(community.toLowerCase())
    ? (property.developer ? `by ${property.developer}` : '')
    : community;

  // Only the figures the listing actually holds; an unknown one is left out, never shown as 0.
  const bedrooms = bedroomsLabel(property, true);
  const bathrooms = Number(property.bathrooms) || 0;
  const size = Number(property.size) || 0;
  const amenities = (property.amenities ?? []).filter(Boolean);
  const coverRepresentative = property.coverImageRepresentative === true;
  const leadSpans = property.images.length > 1 && property.images.length % 2 === 1;

  return (
    <main>
      <PageHero
        label={[property.type, property.status].filter(Boolean).join(' · ')}
        title={
          <>
            {property.title}
            {place && (
              <>
                <SectionBreak keep={!fitsOneLine(`${property.title} ${place}.`)} />
                <em className="text-[#d9c6a4]">{place}.</em>
              </>
            )}
          </>
        }
        copy={property.description}
        image={property.images[0] || fallbackImage}
        imageAlt={seo?.imageAlt || property.coverImageAlt || property.title}
        imageNote={coverRepresentative ? 'Representative image' : undefined}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_.75fr] lg:gap-16 xl:gap-20">
          <div>
            {/* A lone image takes the full column; a pair or more splits into two, and with an
                odd number the first photo takes both columns so no cell is left empty. */}
            <div className={`grid gap-4 ${property.images.length > 1 ? 'sm:grid-cols-2' : ''}`}>
              {property.images.map((image, index) => (
                <figure key={image} className={`card-media card-media-wide ${index === 0 && leadSpans ? 'sm:col-span-2' : ''}`}>
                  <img
                    {...responsiveImage(image, index === 0 && leadSpans ? [800, 1200, 1600] : [480, 800, 1200])}
                    sizes={GALLERY_SIZES}
                    alt={index === 0 ? seo?.imageAlt || property.coverImageAlt || property.title : altFor(image, property.galleryImages, property.title)}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="h-full w-full object-cover"
                  />
                  {((index === 0 && coverRepresentative) || isRepresentative(image, property.galleryImages)) && (
                    <figcaption className="absolute bottom-3 left-3 rounded-full border border-[#faf7f1]/30 bg-[#2b3242]/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[.12em] text-[#faf7f1] backdrop-blur-xs" title="A real photo of a comparable home in Dubai, not this listing" data-testid="label-representative">
                      Representative image
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            <ImageCredits
              cover={{ credit: property.coverImageCredit, sourceUrl: property.coverImageSource }}
              gallery={property.galleryImages}
              coverRepresentative={coverRepresentative}
              subject="this home"
            />
            <div className="mt-12">
              <SectionLabel>About this home</SectionLabel>
              <p className="body-copy measure mt-5 text-[#2b3242]/65">{property.description}</p>
              {amenities.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#2b3242]/15 pt-6 sm:grid-cols-3">
                  {amenities.map((item) => (
                    <span key={item} className="flex items-start gap-2 text-sm text-[#2b3242]/65">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#9f7a47]" />
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#2b3242]/15 bg-[#fffdf8] p-6 shadow-sm sm:p-8 lg:sticky lg:top-28">
            <SectionLabel>Property details</SectionLabel>
            <p className="display mt-4 text-[2rem] leading-none text-[#2b3242] sm:text-[2.35rem]" data-testid="text-property-price">{propertyPriceLabel(property, defaultCurrency)}</p>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#2b3242]/15 py-5 text-sm text-[#2b3242]/75" data-testid="list-property-facts">
              {bedrooms && <span>{bedrooms}</span>}
              {bathrooms > 0 && <span>{bathrooms} {bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>}
              {size > 0 && <span>{new Intl.NumberFormat('en-AE').format(size)} sq ft</span>}
              <span>{property.location}</span>
              {property.developer && <span>By {property.developer}</span>}
              {property.status && <span>{property.status}</span>}
            </div>
            {property.projectSlug && (
              <Link href={`/projects/${property.projectSlug}`} className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.13em] text-[#9f7a47] hover:underline" data-testid="link-property-project">
                View the project <ArrowUpRight size={12} />
              </Link>
            )}
            {(property.sourceUrl || property.priceFrom) && (
              <SourceNote developer={property.developer} sourceUrl={property.sourceUrl} sourceName={property.sourceName} verifiedOn={property.verifiedOn} rental={isRental(property)} />
            )}
            <h3 className="block-title mt-10">
              Interested in<br />
              <em className="text-[#9f7a47]">this address?</em>
            </h3>
            <div className="mt-6" id="enquire">
              <ContactForm compact propertySlug={property.slug} inquiryType="property" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
