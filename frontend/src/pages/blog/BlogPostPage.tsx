import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useLocation, useRoute } from 'wouter';
import { apiFetch, type Post } from '@/lib/api';
import { PageHero, cardGrid } from '@/components/blocks';
import { defaultPosts } from '@/lib/site-data';
import { absoluteUrl, articleJsonLd, usePageMeta, useSeoData, type SeoFields } from '@/lib/seo';
import { useSiteSettings } from '@/lib/site-settings';
import { optimizedImage } from '@/lib/cloudinary-image';
import { ErrorState, LoadingState } from '@/pages/shared/listing-helpers';

export function BlogPostPage() {
  const [, blogParams] = useRoute('/blog/:slug');
  const [, journalParams] = useRoute('/journal/:slug');
  const params = blogParams ?? journalParams;
  const defaultMatch = defaultPosts.find((p) => p.slug === params?.slug);
  const [post, setPost] = useState<Post | null>((defaultMatch as unknown as Post) || null);
  const [related, setRelated] = useState<Post[]>([]);
  const [seo, setSeo] = useState<SeoFields | null>(null);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();
  const { siteName } = useSiteSettings();
  const { settings: seoSettings } = useSeoData();
  const heroImage = post ? post.featuredImage || post.image || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg' : null;

  // The blog admin saves the title as the SEO title by default; only a different one is a real override.
  const customTitle = post?.seoTitle && post.seoTitle.trim() !== post.title.trim() ? post.seoTitle : null;
  usePageMeta(
    post?.title ?? 'Blog',
    post?.excerpt ?? 'Real-estate perspective from KNC Horizon Realtor.',
    {
      path: post ? `/blog/${post.slug}` : undefined,
      seo: post ? { ...seo, seoTitle: customTitle, metaDescription: post.seoDescription || null } : null,
      image: heroImage,
      imageAlt: post?.title,
      type: 'article',
      noindex: Boolean(error && !post),
      jsonLd: post ? [articleJsonLd({
        url: `${seoSettings.siteUrl}/blog/${post.slug}`,
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        image: heroImage ? absoluteUrl(heroImage, seoSettings.siteUrl) : null,
        datePublished: post.publishedAt,
        author: post.author,
        siteName,
        siteUrl: seoSettings.siteUrl,
      })] : undefined,
    },
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ blog: Post; related: Post[]; seo?: SeoFields | null }>(`/blogs/${params.slug}`)
      .then((data) => {
        setPost(data.blog);
        setRelated(data.related);
        setSeo(data.seo ?? null);
        if (data.blog.slug && data.blog.slug !== params.slug) navigate(`/blog/${data.blog.slug}`, { replace: true });
      })
      .catch((reason) => {
        if (!post) setError(reason instanceof Error ? reason.message : 'Blog post not found.');
      });
  }, [params?.slug]);

  if (error && !post) {
    return (
      <main className="bg-[#faf7f1] site-section pt-40">
        <div className="mx-auto max-w-[900px]">
          <ErrorState message={error} />
          <Link href="/blog" className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
            <ArrowLeft size={14} /> Back to blog
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="site-section pt-40">
        <LoadingState />
      </main>
    );
  }

  const image = post.featuredImage || post.image || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg';
  const internalLinks = seo?.internalLinks ?? [];

  return (
    <main>
      <PageHero
        label={`${post.category} · ${post.author}`}
        title={<>{post.title}</>}
        copy={post.excerpt}
        image={image}
        imageAlt={seo?.imageAlt || post.featuredImageAlt || post.title}
      />
      <article className="site-section bg-[#faf7f1]">
        <div className="site-container">
          {/* The reading column keeps the page's left grid line; the related cards below
              take the full container so they match the cards on every other page. */}
          <div className="max-w-[46rem]">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
              {post.author} · {new Date(post.publishedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}
            </p>
            <div className="body-copy mt-8 whitespace-pre-line text-[#2b3242]/80">
              {post.content}
            </div>
            {internalLinks.length > 0 && (
              <nav aria-label="Related pages" className="mt-10 border-t border-[#2b3242]/15 pt-6">
                <p className="eyebrow text-[#9f7a47]">Related on KNC Horizon</p>
                <ul className="mt-4 space-y-2.5">
                  {internalLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="inline-flex items-center gap-2 text-[15px] text-[#2b3242] underline decoration-[#9f7a47]/40 underline-offset-4 transition-colors hover:text-[#80623a] hover:decoration-[#9f7a47]">
                        {link.label} <ArrowUpRight size={13} className="text-[#9f7a47]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <Link href="/blog" className="line-link mt-12 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]">
              <ArrowLeft size={14} /> Back to blog
            </Link>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-[#2b3242]/15 pt-8">
              <p className="eyebrow text-[#9f7a47]">Keep reading</p>
              <div className={`mt-6 ${cardGrid(related.length)}`}>
                {related.map((item) => (
                  <Link key={item.id} href={`/blog/${item.slug}`} className="card-editorial group p-5">
                    <div className="card-media image-reveal">
                      <img
                        src={optimizedImage(item.featuredImage || item.image || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg', 800)}
                        alt={item.featuredImageAlt || item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <p className="card-title mt-4 line-clamp-2 text-[#2b3242] transition-colors group-hover:text-[#9f7a47]">{item.title}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-4 font-mono text-[11px] uppercase tracking-[.12em] text-[#9f7a47] group-hover:underline">
                      Read note <ArrowUpRight size={12} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
