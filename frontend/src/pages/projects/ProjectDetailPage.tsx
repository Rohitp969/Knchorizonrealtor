import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { ContactForm, ErrorState, PageHero, PropertyCard, SectionLabel, SectionBreak, cardGrid, fitsOneLine } from '@/components/blocks';
import { apiFetch, type Project, type RemoteProperty } from '@/lib/api';
import { defaultProjects, defaultRemoteProperties } from '@/lib/site-data';
import { absoluteUrl, listingJsonLd, usePageMeta, useSeoData, type SeoFields } from '@/lib/seo';
import { useSiteSettings } from '@/lib/site-settings';
import { altFor, isRepresentative, responsiveImage, GALLERY_SIZES } from '@/lib/cloudinary-image';
import { projectPriceLabel, priceLabel, titleNamesPlace } from '@/lib/listing-format';
import { ImageCredits, SourceNote, propertyCard } from '@/pages/shared/listing-helpers';

const fallbackImage = 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg';

/*
 * One row of the facts panel. A fact the developer has not published is said to be exactly
 * that, in lighter type, so a visitor can tell a verified figure from a missing one.
 */
function Fact({ label, value, missing, testId }: { label: string; value?: ReactNode; missing: string; testId: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[.13em] text-[#2b3242]/55">{label}</dt>
      {value
        ? <dd className="text-[#2b3242]/85" data-testid={testId}>{value}</dd>
        : <dd className="italic text-[#2b3242]/45" data-testid={testId} data-missing="true">{missing}</dd>}
    </div>
  );
}

export function ProjectDetailPage() {
  // Both /projects/:slug and the /project/:id alias registered in App.tsx land here
  const [, slugParams] = useRoute('/projects/:slug');
  const [, idParams] = useRoute('/project/:id');
  const slug = slugParams?.slug ?? idParams?.id;
  const params = slug ? { slug } : undefined;
  const defaultMatch = defaultProjects.find((p) => p.slug === slug || p.id === slug);
  const [project, setProject] = useState<Project | null>((defaultMatch as unknown as Project) || null);
  // The home types recorded under this project (properties whose projectSlug is this one).
  const [homes, setHomes] = useState<RemoteProperty[]>(
    (defaultRemoteProperties as unknown as RemoteProperty[]).filter((item) => item.projectSlug === defaultMatch?.slug),
  );
  const [seo, setSeo] = useState<SeoFields | null>(null);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { settings: seoSettings } = useSeoData();
  const { defaultCurrency } = useSiteSettings();

  usePageMeta(
    project?.title ?? 'Project details',
    project
      ? `${project.title}${project.developer ? ` by ${project.developer}` : ''} in ${project.location}. Verified project details and an enquiry line to KNC Horizon Realtor.`
      : 'Explore Dubai property projects with KNC Horizon Realtor.',
    {
      path: project ? `/projects/${project.slug}` : undefined,
      seo,
      image: project?.image,
      imageAlt: project?.title,
      noindex: Boolean(error && !project),
      jsonLd: project ? [listingJsonLd({
        url: `${seoSettings.siteUrl}/projects/${project.slug}`,
        name: project.title,
        description: seo?.metaDescription || project.description,
        image: project.image ? absoluteUrl(project.image, seoSettings.siteUrl) : null,
        price: project.startingPrice,
      })] : undefined,
    },
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ project: Project; seo?: SeoFields | null }>(`/public/projects/${params.slug}`)
      .then((data) => {
        setProject(data.project);
        setSeo(data.seo ?? null);
        // A renamed project answers on its old slug; move the address bar to the current one.
        if (slugParams?.slug && data.project.slug && data.project.slug !== slugParams.slug) {
          navigate(`/projects/${data.project.slug}`, { replace: true });
        }
        return apiFetch<{ properties: RemoteProperty[] }>(`/public/properties?project=${encodeURIComponent(data.project.slug)}&limit=12&sort=price-asc`)
          .then((listing) => setHomes(listing.properties ?? []))
          .catch(() => { /* the project page stands without its home types */ });
      })
      .catch((reason) => {
        if (!project) setError(reason instanceof Error ? reason.message : 'Project not found.');
      });
  }, [params?.slug]);

  if (error && !project) {
    return (
      <main className="bg-[#faf7f1] site-section pt-40">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/projects" className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
            <ArrowLeft size={14} /> Back to projects
          </Link>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="site-section pt-40">
        <div className="site-container">
          <p className="eyebrow text-[#9f7a47]">KNC Horizon</p>
          <p className="block-title mt-4 text-[#2b3242]">Loading project…</p>
        </div>
      </main>
    );
  }

  // The gallery opens with the cover, shown here in full (the header crops and darkens it).
  // With an odd number of photos the first one takes both columns, so the grid never ends on
  // an empty cell.
  const cover = project.image || fallbackImage;
  const images = [cover, ...(project.gallery ?? []).filter((image) => image !== cover)];
  const leadSpans = images.length % 2 === 1;

  // Under the name: the place, or the developer when the name is itself the place (a master
  // community such as Dubai Creek Harbour). A project with neither shows the name alone.
  const place = titleNamesPlace(project)
    ? (project.developer ? `by ${project.developer}` : '')
    : (project.location || '').trim();

  // What to say for a fact that is not there: a verified project names the developer as the
  // one who has not published it; a project entered by hand simply says "on request".
  const verified = Boolean(project.sourceUrl);
  const missing = verified ? 'Not published by the developer' : 'On request';
  const amenities = (project.amenities ?? []).filter(Boolean);
  const highlights = (project.highlights ?? []).filter(Boolean);

  return (
    <main>
      <PageHero
        label={[project.category, project.status].filter(Boolean).join(' · ') || 'Development'}
        title={
          <>
            {project.title}
            {place && (
              <>
                <SectionBreak keep={!fitsOneLine(`${project.title} ${place}.`)} />
                <em className="text-[#d9c6a4]">{place}.</em>
              </>
            )}
          </>
        }
        copy={project.description}
        image={project.image || fallbackImage}
        imageAlt={seo?.imageAlt || project.coverImageAlt || project.title}
        imageNote={project.coverImageRepresentative ? 'Representative image' : undefined}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_.75fr] lg:gap-16 xl:gap-20">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((image, index) => (
                <figure key={image} className={`card-media card-media-wide ${index === 0 && leadSpans ? 'sm:col-span-2' : ''}`}>
                  <img
                    {...responsiveImage(image, index === 0 && leadSpans ? [800, 1200, 1600] : [480, 800, 1200])}
                    sizes={GALLERY_SIZES}
                    alt={image === cover ? seo?.imageAlt || project.coverImageAlt || project.title : altFor(image, project.galleryImages, project.title)}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="h-full w-full object-cover"
                  />
                  {((image === cover && project.coverImageRepresentative) || isRepresentative(image, project.galleryImages)) && (
                    <figcaption className="absolute bottom-3 left-3 rounded-full border border-[#faf7f1]/30 bg-[#2b3242]/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[.12em] text-[#faf7f1] backdrop-blur-xs" title="A real photo of the area or of a comparable place in Dubai, not this project" data-testid="label-representative">
                      Representative image
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
            <ImageCredits
              cover={{ credit: project.coverImageCredit, sourceUrl: project.coverImageSource }}
              gallery={project.galleryImages}
              coverRepresentative={project.coverImageRepresentative}
              subject="this project"
            />
            <div className="mt-12">
              <SectionLabel>About the project</SectionLabel>
              <p className="body-copy measure mt-5 text-[#2b3242]/65">{project.description}</p>
              {highlights.length > 0 && (
                <ul className="measure mt-6 grid gap-2 text-sm leading-6 text-[#2b3242]/70" data-testid="list-project-highlights">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-[.6em] h-1 w-1 shrink-0 rounded-full bg-[#9f7a47]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {amenities.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#2b3242]/15 pt-5 sm:grid-cols-3" data-testid="list-project-amenities">
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
            <SectionLabel>Project details</SectionLabel>
            <p className="display mt-4 text-[2rem] leading-none text-[#2b3242] sm:text-[2.35rem]" data-testid="text-project-price">{projectPriceLabel(project, defaultCurrency)}</p>
            <dl className="mt-6 grid gap-y-3 border-y border-[#2b3242]/15 py-5 text-sm" data-testid="list-project-facts">
              <Fact label="Developer" value={project.developer} missing={missing} testId="fact-developer" />
              <Fact label="Location" value={project.location} missing={missing} testId="fact-location" />
              <Fact label="Property type" value={project.category} missing={missing} testId="fact-type" />
              <Fact label="Homes" value={project.unitTypes} missing={missing} testId="fact-homes" />
              <Fact label="Status" value={project.status} missing={missing} testId="fact-status" />
              <Fact label="Starting price" value={project.startingPrice > 0 ? priceLabel(project.startingPrice, defaultCurrency) : ''} missing={missing} testId="fact-price" />
              <Fact label="Handover" value={project.handover} missing={missing} testId="fact-handover" />
            </dl>
            <SourceNote developer={project.developer} sourceUrl={project.sourceUrl} sourceName={project.sourceName} verifiedOn={project.verifiedOn} />
            <h3 className="block-title mt-10">
              Request the<br />
              <em className="text-[#9f7a47]">project brief.</em>
            </h3>
            <div className="mt-6" id="enquire">
              <ContactForm compact inquiryType="project" projectSlug={project.slug} />
            </div>
          </aside>
        </div>
        {homes.length > 0 && (
          <div className="site-container mt-16 border-t border-[#2b3242]/15 pt-12" data-testid="section-project-homes">
            <SectionLabel>{`Homes in ${project.title}`}</SectionLabel>
            <p className="measure mt-4 text-sm leading-7 text-[#2b3242]/65">
              The home types the developer currently publishes a price for. Each is a starting price for that type, not a quote for one home.
            </p>
            <div className={`mt-8 ${cardGrid(homes.length)}`}>
              {homes.map((item) => (
                <PropertyCard key={item.id} property={propertyCard(item, defaultCurrency)} featured={false} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
