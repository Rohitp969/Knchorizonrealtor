import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { apiFetch, type RemoteProperty } from '@/lib/api';
import { PageHero, PropertyCard, cardGrid } from '@/components/blocks';
import { categoryOf } from '@/lib/property-search';
import { defaultRemoteProperties } from '@/lib/site-data';
import { usePageMeta } from '@/lib/seo';
import { useSiteSettings } from '@/lib/site-settings';
import { isOffPlan, LoadingState, ErrorState, propertyCard } from '@/pages/shared/listing-helpers';

/** Applies a /properties/<category> page's own meaning to a list of published properties. */
function narrowToCategory(list: RemoteProperty[], category: string) {
  if (category === 'residential' || category === 'commercial') {
    const wanted = category === 'residential' ? 'Residential' : 'Commercial';
    return list.filter((item) => categoryOf(item.type ?? '') === wanted);
  }
  if (category === 'off-plan') return list.filter(isOffPlan);
  // sale, rent and investment are already narrowed by the request itself.
  return list;
}

export type PropertiesFilterPageProps = {
  category?: string;
  params?: { category?: string; [key: string]: unknown };
};

export function PropertiesFilterPage(props: PropertiesFilterPageProps = {}) {
  const { defaultCurrency } = useSiteSettings();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const pathCategory = location.startsWith('/properties/') ? location.replace('/properties/', '').split('/')[0].split('?')[0] : '';
  const validCategories = ['residential', 'commercial', 'investment', 'off-plan', 'sale', 'rent'];
  const rawCategory = (props.category || (typeof props.params?.category === 'string' ? props.params.category : undefined) || searchParams.get('category') || (validCategories.includes(pathCategory) ? pathCategory : 'residential')).toLowerCase();
  const category = validCategories.includes(rawCategory) ? rawCategory : 'residential';

  const [items, setItems] = useState<RemoteProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const displayTitles: Record<string, string> = {
    residential: 'Residential Properties',
    commercial: 'Commercial Properties',
    investment: 'Investment Opportunities',
    'off-plan': 'Off-Plan Properties',
    sale: 'Properties for Sale',
    rent: 'Properties for Rent'
  };

  // The header photo of this page, which is also its share image.
  const heroImage = ({ sale: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577267/knc-horizon/hero/burj-khalifa-aerial.jpg', rent: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jbr-residences-street.jpg', residential: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577275/knc-horizon/hero/the-greens-residential.jpg', commercial: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/difc-green-towers.jpg', investment: 'https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/business-bay-skyline-day.jpg', 'off-plan': 'https://res.cloudinary.com/complaintreview/image/upload/v1790577273/knc-horizon/hero/jvc-tower-construction-dusk.jpg' } as Record<string, string>)[category] ?? 'https://res.cloudinary.com/complaintreview/image/upload/v1790577268/knc-horizon/hero/downtown-safa-park.jpg';

  usePageMeta(displayTitles[category] || 'Properties', `Explore ${category} real estate opportunities in Dubai.`, { image: heroImage });

  /*
   * The API only filters on fields it holds, so the category itself is applied here against
   * the same taxonomy the search bar uses. An empty result is now shown as an empty result:
   * it used to fall back to the whole list, which put apartments under "Commercial spaces"
   * and completed stock under "Off-Plan launches".
   */
  useEffect(() => {
    setLoading(true);
    setError('');
    const query = category === 'sale' || category === 'investment'
      ? '?listingType=sale&limit=50'
      : category === 'rent'
      ? '?listingType=rent&limit=50'
      : '?limit=50';

    apiFetch<{ properties: RemoteProperty[] }>(`/public/properties${query}`)
      .then((data) => setItems(narrowToCategory(data.properties ?? [], category)))
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Please try again.');
        setItems(narrowToCategory(defaultRemoteProperties as unknown as RemoteProperty[], category));
      })
      .finally(() => setLoading(false));
  }, [category]);

  const titles: Record<string, React.ReactNode> = {
    residential: <>Residential<br /><em className="text-[#9f7a47]">properties.</em></>,
    commercial: <>Commercial<br /><em className="text-[#9f7a47]">spaces.</em></>,
    investment: <>Investment<br /><em className="text-[#9f7a47]">opportunities.</em></>,
    'off-plan': <>Off-Plan<br /><em className="text-[#9f7a47]">launches.</em></>,
    sale: <>Properties<br /><em className="text-[#9f7a47]">for sale.</em></>,
    rent: <>Properties<br /><em className="text-[#9f7a47]">for rent.</em></>
  };

  const copyMap: Record<string, string> = {
    residential: 'A considered selection of residential properties in Dubai.',
    commercial: 'Prime commercial office spaces and retail assets across Dubai.',
    investment: 'High-yield residential and commercial investment assets across Dubai.',
    'off-plan': 'Exciting new developments and off-plan launches across the UAE.',
    sale: 'Curated freehold and prime properties for sale across Dubai.',
    rent: 'Exceptional long-term luxury residences and commercial spaces for lease.'
  };

  return (
    <main>
      <PageHero
        label={displayTitles[category] || `${category} properties`}
        title={titles[category] || titles['residential']}
        copy={copyMap[category] || `A considered selection of ${category} properties in Dubai.`}
        image={heroImage}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container">
          {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="block-title text-[#2b3242]">No properties found in this category.</p>
              <p className="measure-narrow mx-auto mt-4 text-sm leading-7 text-[#2b3242]/65">
                {category === 'off-plan' ? (
                  <>Completed stock is listed here. For launches still under construction, see our{' '}
                    <Link href="/off-plan" className="text-[#9f7a47] underline underline-offset-4">off-plan projects</Link>.</>
                ) : (
                  <>Our recommendations are not limited to what is listed here.{' '}
                    <Link href="/contact" className="text-[#9f7a47] underline underline-offset-4">Share your brief</Link>
                    {' '}and an advisor will come back to you.</>
                )}
              </p>
            </div>
          ) : (
            <div className={cardGrid(items.length)}>
              {items.map((item) => (
                <PropertyCard key={item.id} property={propertyCard(item, defaultCurrency)} featured={false} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
