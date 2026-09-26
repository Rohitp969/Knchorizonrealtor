import { useEffect, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { ContactForm, ErrorState, PageHero, SectionLabel } from '@/components/blocks';
import { apiFetch, type Project } from '@/lib/api';
import { defaultProjects } from '@/lib/site-data';
import { absoluteUrl, listingJsonLd, usePageMeta, useSeoData, type SeoFields } from '@/lib/seo';

const fallbackImage = '/images/dubai-skyline-from-sea.jpg';

export function ProjectDetailPage() {
  // Both /projects/:slug and the /project/:id alias registered in App.tsx land here
  const [, slugParams] = useRoute('/projects/:slug');
  const [, idParams] = useRoute('/project/:id');
  const slug = slugParams?.slug ?? idParams?.id;
  const params = slug ? { slug } : undefined;
  const defaultMatch = defaultProjects.find((p) => p.slug === slug || p.id === slug);
  const [project, setProject] = useState<Project | null>((defaultMatch as unknown as Project) || null);
  const [seo, setSeo] = useState<SeoFields | null>(null);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { settings: seoSettings } = useSeoData();

  usePageMeta(
    project?.title ?? 'Project details',
    project
      ? `${project.title} in ${project.location}. Explore the project and request its brief from KNC Horizon Realtor.`
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

  const images = project.gallery?.length ? project.gallery : [project.image || fallbackImage];

  return (
    <main>
      <PageHero
        label={[project.category, project.status].filter(Boolean).join(' \u00b7 ') || 'Off-plan development'}
        title={
          <>
            {project.title}
            <br />
            <em className="text-[#d9c6a4]">{project.location}.</em>
          </>
        }
        copy={project.description}
        image={project.image || fallbackImage}
        imageAlt={seo?.imageAlt || project.title}
      />
      <section className="bg-[#faf7f1] site-section">
        <div className="site-container grid gap-12 lg:grid-cols-[1fr_.75fr] lg:gap-16 xl:gap-20">
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {images.map((image) => (
                <div key={image} className="card-media card-media-wide">
                  <img
                    src={image}
                    alt={project.title}
                    onError={(event) => {
                      event.currentTarget.src = fallbackImage;
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-12">
              <SectionLabel>About the project</SectionLabel>
              <p className="body-copy measure mt-5 text-[#2b3242]/65">{project.description}</p>
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#2b3242]/15 pt-5 sm:grid-cols-3">
                {(project.amenities ?? ['Design-led architecture', 'Resident amenities', 'Long-term value']).map((item) => (
                  <span key={item} className="flex items-start gap-2 text-sm text-[#2b3242]/65">
                    <Check size={15} className="mt-0.5 text-[#9f7a47]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <aside className="h-fit rounded-2xl border border-[#2b3242]/15 bg-[#fffdf8] p-6 shadow-sm sm:p-8 lg:sticky lg:top-28">
            <SectionLabel>Project details</SectionLabel>
            <p className="display mt-4 text-[2rem] leading-none text-[#2b3242] sm:text-[2.35rem]">From AED {new Intl.NumberFormat('en-AE').format(project.startingPrice)}</p>
            <div className="mt-6 grid gap-y-3 border-y border-[#2b3242]/15 py-5 text-sm text-[#2b3242]/75">
              <span>{project.developer}</span>
              <span>{project.location}</span>
              <span>Handover {project.handover}</span>
            </div>
            <h3 className="block-title mt-10">
              Request the<br />
              <em className="text-[#9f7a47]">project brief.</em>
            </h3>
            <div className="mt-6">
              <ContactForm compact inquiryType="project" projectSlug={project.slug} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
