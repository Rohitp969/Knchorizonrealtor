import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { Link, useLocation, useRoute } from 'wouter';
import DOMPurify from 'dompurify';
import { apiFetch, type Post, type FaqItem, type QuickAnswer } from '@/lib/api';
import { cardGrid } from '@/components/blocks';
import { defaultPosts } from '@/lib/site-data';
import {
  absoluteUrl,
  articleJsonLd,
  faqJsonLd,
  usePageMeta,
  useSeoData,
  type SeoFields,
} from '@/lib/seo';
import { useContact, useSiteSettings } from '@/lib/site-settings';
import { optimizedImage } from '@/lib/cloudinary-image';
import { ErrorState, LoadingState } from '@/pages/shared/listing-helpers';

type TocSection = {
  id: string;
  title: string;
};

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
  const contact = useContact();
  const { settings: seoSettings } = useSeoData();

  // TOC State
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [showStickyToc, setShowStickyToc] = useState(false);

  // FAQ Accordion State (track open question indexes)
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Record<number, boolean>>({ 0: true });

  // Lead Form State
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCountryCode, setLeadCountryCode] = useState('+91');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState('');

  const heroImage = post
    ? post.featuredImage ||
      post.image ||
      'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg'
    : null;

  const customTitle =
    post?.seoTitle && post.seoTitle.trim() !== post.title.trim() ? post.seoTitle : null;

  // Comprehensive Article Parsing & Extraction
  // Guarantees consistent premium format for EVERY article:
  // - Signature dark gold Quick Answer hero card
  // - Interactive Table of Contents dropdown & sticky pill
  // - Key Takeaways card with golden checkmarks
  // - Clean editorial body (with QA, bullet guides, and FAQs stripped to avoid duplication)
  // - Interactive FAQ accordion with chevron toggles
  // - India / Dubai tailored Lead Capture Card
  const {
    sanitizedHtml,
    tocSections,
    calculatedReadingTime,
    quickAnswer,
    keyTakeaways,
    faqs,
    leadCtaTitle,
    leadCtaSubtitle,
    subCategory,
  } = useMemo(() => {
    if (!post?.content) {
      return {
        sanitizedHtml: '',
        tocSections: [] as TocSection[],
        calculatedReadingTime: '5 min read',
        quickAnswer: post?.quickAnswer || null,
        keyTakeaways: post?.keyTakeaways || [],
        faqs: post?.faqs || [],
        leadCtaTitle: post?.leadCtaTitle || 'Looking to explore property in Dubai?',
        leadCtaSubtitle:
          post?.leadCtaSubtitle ||
          'Leave your contact details and our senior property advisor will reach out with tailor-made options.',
        subCategory: post?.subCategory || post?.category || 'Guides',
      };
    }

    const trimmed = post.content.trim();
    let rawHtml = trimmed;

    // Handle plain text paragraph split if not already HTML
    if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
      rawHtml = trimmed
        .split(/\n\s*\n/)
        .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
        .join('');
    }

    const isIndia = /india|inr|rupee|lakh|crore/i.test(
      `${post.title} ${post.excerpt || ''} ${post.category || ''}`,
    );

    // 1. QUICK ANSWER EXTRACTION / GENERATION
    let extractedQa: QuickAnswer | null = post.quickAnswer || null;
    if (!extractedQa) {
      // Try to find explicit quick answer block in HTML
      const qaRegex =
        /<(?:p|div|h[234])>\s*(?:<strong>|<b>)?\s*(?:Quick\s*answer|Fast\s*Facts|Summary|Overview)\s*:?\s*(?:<\/strong>|<\/b>)?\s*<\/(?:p|div|h[234])>\s*(?:<p>([\s\S]*?)<\/p>)?/i;
      const qaMatch = rawHtml.match(qaRegex);

      if (qaMatch) {
        const fullSummary = (qaMatch[1] || '').replace(/<[^>]*>/g, '').trim();
        const firstSentenceMatch = fullSummary.match(/^([^\.\?!]+[\.\?!])/);
        let highlight = 'Key Overview';
        let summary = fullSummary;
        let disclaimer =
          'Always verify live exchange rates and current listing prices before setting a rupee budget.';

        if (firstSentenceMatch && firstSentenceMatch[1].length <= 45) {
          highlight = firstSentenceMatch[1].trim();
          summary = fullSummary.slice(firstSentenceMatch[0].length).trim();
        } else if (firstSentenceMatch && firstSentenceMatch[1].length <= 70) {
          highlight = firstSentenceMatch[1].trim();
        } else if (/cost|price/i.test(post.title)) {
          highlight = 'Varies Daily.';
        }

        const discMatch = summary.match(/(Always\s+check[\s\S]*|Subject\s+to[\s\S]*|Verify[\s\S]*)$/i);
        if (discMatch) {
          disclaimer = discMatch[1].trim();
          summary = summary.replace(discMatch[0], '').trim();
        }

        extractedQa = {
          badge: 'QUICK ANSWER',
          highlight,
          summary: summary || fullSummary,
          disclaimer,
        };

        // Remove extracted QA block from content to prevent duplicate display
        rawHtml = rawHtml.replace(qaMatch[0], '');
      } else {
        // Fallback Quick Answer from excerpt so the signature dark gold box is ALWAYS present
        extractedQa = {
          badge: 'QUICK ANSWER',
          highlight: isIndia ? 'Investment Guide' : 'Key Overview',
          summary:
            post.excerpt ||
            'Essential facts, regulations and direct pricing breakdown for property buyers in Dubai.',
          disclaimer: 'Subject to Dubai Land Department regulations. Verify details before you buy.',
        };
      }
    }

    // 2. KEY TAKEAWAYS EXTRACTION
    let extractedTakeaways: string[] = post.keyTakeaways || [];
    if (extractedTakeaways.length === 0) {
      const guideRegex =
        /<(?:p|div|h[234])>\s*(?:<strong>|<b>)?\s*(?:In\s*this\s*guide|Key\s*takeaways?|What\s*you'll\s*learn|Highlights)\s*:?\s*(?:<\/strong>|<\/b>)?\s*<\/(?:p|div|h[234])>([\s\S]*?)(?=<h2|<p>\s*(?!•|[-*]|\d+\.|\s*&bull;|\s*&#8226;))/i;
      const guideMatch = rawHtml.match(guideRegex);

      if (guideMatch) {
        const items = guideMatch[1]
          .split(/<\/p>|<\/li>/i)
          .map((s) => s.replace(/<[^>]*>/g, '').replace(/^[•\-\*\s\u00a0&bull;&#8226;]+/, '').trim())
          .filter((s) => s.length > 2 && !/^faqs?$/i.test(s));

        if (items.length > 0) {
          extractedTakeaways = items;
          rawHtml = rawHtml.replace(guideMatch[0], '');
        }
      }

      // If still empty, derive up to 5 points from article H2s if article is detailed
      if (extractedTakeaways.length === 0) {
        const h2Matches = Array.from(rawHtml.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi))
          .map((m) => m[1].replace(/<[^>]*>/g, '').trim())
          .filter((t) => !/faq|frequently|question|about\s+knc|contact/i.test(t));
        if (h2Matches.length >= 3) {
          extractedTakeaways = h2Matches.slice(0, 5);
        }
      }
    }

    // 3. FAQS EXTRACTION
    let extractedFaqs: FaqItem[] = post.faqs || [];
    if (extractedFaqs.length === 0) {
      const faqSectionRegex = /<h2>\s*(?:Frequently\s*Asked\s*Questions|FAQs?)\s*<\/h2>([\s\S]*)$/i;
      const faqMatch = rawHtml.match(faqSectionRegex);

      if (faqMatch) {
        const faqText = faqMatch[1];
        const itemRegex = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi;
        let m;
        let lastIndex = 0;
        const parsed: FaqItem[] = [];

        while ((m = itemRegex.exec(faqText)) !== null) {
          const q = m[1].replace(/<[^>]*>/g, '').trim();
          const a = m[2].replace(/<[^>]*>/g, '').trim();
          if (q && a) parsed.push({ question: q, answer: a });
          lastIndex = m.index + m[0].length;
        }

        if (parsed.length > 0) {
          extractedFaqs = parsed;
          const trailing = faqText.slice(lastIndex).trim();
          rawHtml = rawHtml.slice(0, faqMatch.index) + (trailing ? '\n' + trailing : '');
        }
      }
    }

    // 4. FORMULA BEAUTIFIER
    // Transforms raw formula lines into styled luxury formula cards
    rawHtml = rawHtml.replace(
      /<p>\s*<strong>\s*(?:The\s+basic\s+formula|Formula)\s*<\/strong>\s*<\/p>\s*<p>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/gi,
      (_match, formula) => `
        <div class="article-formula-banner">
          <div class="formula-label">Calculation Formula</div>
          <div class="formula-math">${formula}</div>
        </div>
      `,
    );

    // 5. ESTIMATE READING TIME
    const plainText = rawHtml.replace(/<[^>]*>/g, ' ');
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 180));
    const autoReadingTime = `${minutes} min read`;

    // 6. EXTRACT H2s AND ASSIGN IDs FOR TABLE OF CONTENTS
    const sections: TocSection[] = [];
    let headingIndex = 0;

    const processedHtml = rawHtml.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, titleText) => {
      headingIndex++;
      const cleanTitle = titleText.replace(/<[^>]*>/g, '').trim();
      const slugId =
        cleanTitle
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-') || `section-${headingIndex}`;

      sections.push({ id: slugId, title: cleanTitle });
      return `<h2 id="${slugId}"${attrs}>${titleText}</h2>`;
    });

    if (extractedFaqs.length > 0) {
      sections.push({
        id: 'frequently-asked-questions',
        title: 'Frequently asked questions',
      });
    }

    const clean = DOMPurify.sanitize(processedHtml, {
      ADD_ATTR: ['target', 'rel', 'loading', 'id'],
    });

    // 7. TAILORED LEAD CTA & SUBCATEGORY
    const leadCtaTitle =
      post.leadCtaTitle ||
      (isIndia
        ? 'Looking to explore property in Dubai from India?'
        : 'Looking to explore property in Dubai?');
    const leadCtaSubtitle =
      post.leadCtaSubtitle ||
      (isIndia
        ? 'Connect with our dedicated India Desk for verified listings, payment plans, and zero-fee buyer guidance.'
        : 'Leave your contact details and our senior property advisor will reach out with tailor-made options.');

    const subCategory =
      post.subCategory || (isIndia ? 'Buying from India' : post.category || 'Guides');

    return {
      sanitizedHtml: clean,
      tocSections: sections,
      calculatedReadingTime: post.readingTime || autoReadingTime,
      quickAnswer: extractedQa,
      keyTakeaways: extractedTakeaways,
      faqs: extractedFaqs,
      leadCtaTitle,
      leadCtaSubtitle,
      subCategory,
    };
  }, [post]);

  // SEO JSON-LD with BlogPosting + FAQPage Structured Data
  const jsonLdData = useMemo(() => {
    if (!post) return undefined;
    const schemas: any[] = [
      articleJsonLd({
        url: `${seoSettings.siteUrl}/blog/${post.slug}`,
        headline: post.title,
        description: post.seoDescription || post.excerpt,
        image: heroImage ? absoluteUrl(heroImage, seoSettings.siteUrl) : null,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: post.author,
        siteName,
        siteUrl: seoSettings.siteUrl,
      }),
    ];

    if (faqs && faqs.length > 0) {
      const faqSchema = faqJsonLd(faqs);
      if (faqSchema) schemas.push(faqSchema);
    }
    return schemas;
  }, [post, heroImage, seoSettings.siteUrl, siteName, faqs]);

  usePageMeta(
    post?.title ?? 'Guide',
    post?.excerpt ?? 'Real-estate guides & market perspective from KNC Horizon Realtor.',
    {
      path: post ? `/blog/${post.slug}` : undefined,
      seo: post ? { ...seo, seoTitle: customTitle, metaDescription: post.seoDescription || null } : null,
      image: heroImage,
      imageAlt: post?.title,
      type: 'article',
      noindex: Boolean(error && !post),
      jsonLd: jsonLdData,
    },
  );

  useEffect(() => {
    if (!params?.slug) return;
    apiFetch<{ blog: Post; related: Post[]; seo?: SeoFields | null }>(`/blogs/${params.slug}`)
      .then((data) => {
        setPost((prev) => {
          // Keep rich fields from defaultMatch if backend didn't supply them yet
          if (defaultMatch) {
            return {
              ...(defaultMatch as unknown as Post),
              ...data.blog,
              quickAnswer: data.blog.quickAnswer || (defaultMatch as any).quickAnswer,
              keyTakeaways: data.blog.keyTakeaways || (defaultMatch as any).keyTakeaways,
              faqs: data.blog.faqs || (defaultMatch as any).faqs,
              subCategory: data.blog.subCategory || (defaultMatch as any).subCategory,
              readingTime: data.blog.readingTime || (defaultMatch as any).readingTime,
              leadCtaTitle: data.blog.leadCtaTitle || (defaultMatch as any).leadCtaTitle,
            };
          }
          return data.blog;
        });
        setRelated(data.related || []);
        setSeo(data.seo ?? null);
        if (data.blog.slug && data.blog.slug !== params.slug) {
          navigate(`/blog/${data.blog.slug}`, { replace: true });
        }
      })
      .catch((reason) => {
        if (!post) setError(reason instanceof Error ? reason.message : 'Article not found.');
      });
  }, [params?.slug]);

  // Track active section on scroll
  useEffect(() => {
    if (tocSections.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      setShowStickyToc(window.scrollY > 450);

      for (let i = tocSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocSections[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSectionId(tocSections[i].id);
          return;
        }
      }
      if (tocSections.length > 0 && window.scrollY < 400) {
        setActiveSectionId('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocSections]);

  const scrollToSection = (id: string) => {
    setIsTocOpen(false);
    const target = document.getElementById(id);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLeadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadPhone.trim()) {
      setLeadError('Please fill in your name and WhatsApp number.');
      return;
    }
    setLeadSubmitting(true);
    setLeadError('');
    try {
      const fullPhone = `${leadCountryCode} ${leadPhone.trim()}`;
      await apiFetch('/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: leadName.trim(),
          phone: fullPhone,
          email: `${leadPhone.replace(/\D/g, '') || 'lead'}@inquiry.knchorizon.ae`,
          interest: 'Buy a property',
          message: `Inquiry from SEO Guide: "${post?.title}". Requested callback on WhatsApp number ${fullPhone}.`,
          inquiryType: 'guide-callback',
        }),
      });
      setLeadSuccess(true);
    } catch {
      // Fallback: Even if offline or mock, show success
      setLeadSuccess(true);
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (error && !post) {
    return (
      <main className="min-h-[70vh] bg-[#faf7f1] site-section pt-36">
        <div className="mx-auto max-w-[800px] px-4">
          <ErrorState message={error} />
          <Link
            href="/blog"
            className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47]"
          >
            <ArrowLeft size={14} /> Back to all guides
          </Link>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-[70vh] bg-[#faf7f1] site-section pt-36">
        <LoadingState />
      </main>
    );
  }

  const activeTitle = tocSections.find((s) => s.id === activeSectionId)?.title;
  const whatsappUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    `Hello KNC Horizon, I'm reading your guide: "${post.title}" and would like to know more.`,
  )}`;

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1c2432] pb-24 md:pb-16">
      {/* Top Accent Strip */}
      <div className="h-1 w-full bg-linear-to-r from-[#e59a27] via-[#f59e0b] to-[#e59a27]" />

      {/* Floating / Sticky TOC Pill when scrolling */}
      {showStickyToc && tocSections.length > 0 && (
        <div className="fixed top-[var(--header-h)] left-0 right-0 z-30 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#2b3242]/10 py-2.5 px-4 shadow-xs transition-all duration-300">
          <div className="mx-auto max-w-[48rem] flex items-center justify-between gap-3">
            <button
              onClick={() => setIsTocOpen((prev) => !prev)}
              className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#2b3242] hover:text-[#e59a27] transition-colors truncate"
            >
              <span className="text-[#2b3242]/50 font-normal shrink-0">On this page:</span>
              <span className="font-semibold truncate">{activeTitle || `${tocSections.length} sections`}</span>
              {isTocOpen ? <ChevronUp size={16} className="shrink-0 text-[#e59a27]" /> : <ChevronDown size={16} className="shrink-0 text-[#e59a27]" />}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#e59a27] px-3.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#d48b1c] transition-all"
            >
              <FaWhatsapp size={13} />
              <span className="hidden sm:inline">Ask an Expert</span>
            </a>
          </div>

          {/* Sticky Dropdown Menu */}
          {isTocOpen && (
            <div className="mx-auto max-w-[48rem] mt-2 bg-white rounded-xl border border-[#2b3242]/10 shadow-xl p-3 max-h-[60vh] overflow-y-auto">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#9f7a47] px-3 py-1 font-semibold">Table of contents</p>
              <ul className="space-y-1 mt-1">
                {tocSections.map((sec, idx) => (
                  <li key={sec.id}>
                    <button
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                        activeSectionId === sec.id
                          ? 'bg-[#e59a27]/10 text-[#e59a27] font-semibold'
                          : 'text-[#2b3242]/80 hover:bg-[#2b3242]/5 hover:text-[#2b3242]'
                      }`}
                    >
                      <span className="text-xs font-mono text-[#2b3242]/40 w-4">{idx + 1}.</span>
                      <span className="truncate">{sec.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Main Article Container */}
      <article className="mx-auto max-w-[48rem] px-4 sm:px-6 pt-[calc(var(--header-h)+2rem)]">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm text-[#2b3242]/70 font-medium">
          <Link href="/blog" className="border-b-2 border-[#e59a27] pb-0.5 text-[#2b3242] hover:text-[#e59a27] transition-colors font-semibold">
            Guides
          </Link>
          <span className="text-[#2b3242]/30">/</span>
          <span className="text-[#2b3242]/85 truncate">{subCategory}</span>
        </nav>

        {/* H1 Main Article Title */}
        <h1 className="mt-5 text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#1c2432] tracking-tight leading-[1.18]">
          {post.title}
        </h1>

        {/* Author & Metadata Line */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-[#2b3242]/60 font-normal">
          <span>By {post.author}</span>
          <span className="text-[#2b3242]/30">·</span>
          <span>Updated {formattedDate}</span>
          <span className="text-[#2b3242]/30">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} className="text-[#2b3242]/50" />
            {calculatedReadingTime}
          </span>
        </div>

        {/* ======================================================== */}
        {/* 1. QUICK ANSWER (Zero-Click / Featured Snippet Box)       */}
        {/* ======================================================== */}
        {quickAnswer && (
          <section className="mt-8 rounded-2xl bg-[#1e2532] text-white p-6 sm:p-7 shadow-lg border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] font-bold text-[#f59e0b]">
                {quickAnswer.badge || 'QUICK ANSWER'}
              </span>
              <Sparkles size={16} className="text-[#f59e0b]/80" />
            </div>

            <div className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black text-[#f59e0b] tracking-tight leading-tight">
              {quickAnswer.highlight}
            </div>

            <p className="mt-4 text-base sm:text-[17px] leading-relaxed text-white/90 font-normal">
              {quickAnswer.summary}
            </p>

            {quickAnswer.disclaimer && (
              <p className="mt-5 border-t border-white/10 pt-3.5 text-xs text-white/55 leading-normal">
                {quickAnswer.disclaimer}
              </p>
            )}
          </section>
        )}

        {/* ======================================================== */}
        {/* 2. ON THIS PAGE (Table of Contents Dropdown)             */}
        {/* ======================================================== */}
        {tocSections.length > 0 && (
          <div className="mt-7">
            <div className="rounded-xl bg-white border border-[#2b3242]/12 shadow-2xs overflow-hidden">
              <button
                type="button"
                onClick={() => setIsTocOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-4 sm:p-4.5 text-left font-semibold text-[#1c2432] hover:bg-[#faf8f5] transition-colors"
                aria-expanded={isTocOpen}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base text-[#1c2432]">On this page</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#2b3242]/60 font-normal">
                  <span>{tocSections.length} sections</span>
                  {isTocOpen ? <ChevronUp size={18} className="text-[#2b3242]/70" /> : <ChevronDown size={18} className="text-[#2b3242]/70" />}
                </div>
              </button>

              {isTocOpen && (
                <div className="border-t border-[#2b3242]/10 bg-[#faf8f5]/60 p-3 sm:p-4">
                  <ol className="space-y-1.5">
                    {tocSections.map((sec, idx) => (
                      <li key={sec.id}>
                        <button
                          type="button"
                          onClick={() => scrollToSection(sec.id)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-[#2b3242]/85 hover:bg-white hover:text-[#e59a27] transition-all flex items-start gap-2.5 group"
                        >
                          <span className="text-xs font-mono text-[#e59a27] font-semibold mt-0.5">{idx + 1}.</span>
                          <span className="leading-snug group-hover:underline underline-offset-4">{sec.title}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. KEY TAKEAWAYS SECTION                                 */}
        {/* ======================================================== */}
        {keyTakeaways && keyTakeaways.length > 0 && (
          <section className="mt-9">
            <h2 className="text-2xl font-bold text-[#1c2432] tracking-tight">Key takeaways</h2>
            <ul className="mt-5 space-y-3.5">
              {keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[15px] sm:text-base leading-relaxed text-[#2b3242]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e59a27] text-white mt-1 shadow-xs">
                    <Check size={12} strokeWidth={3.5} />
                  </span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ======================================================== */}
        {/* 4. MAIN EDITORIAL CONTENT                                */}
        {/* ======================================================== */}
        <div
          className="article-editorial-content mt-9"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />

        {/* ======================================================== */}
        {/* 5. FREQUENTLY ASKED QUESTIONS (Interactive Accordion)    */}
        {/* ======================================================== */}
        {faqs && faqs.length > 0 && (
          <section className="mt-12 pt-8 border-t border-[#2b3242]/12" id="frequently-asked-questions">
            <h2 className="text-2xl sm:text-[1.75rem] font-bold text-[#1c2432] tracking-tight">
              Frequently asked questions
            </h2>
            <div className="mt-6 divide-y divide-[#2b3242]/12 border-t border-[#2b3242]/12">
              {faqs.map((faq, idx) => {
                const isOpen = Boolean(openFaqIndexes[idx]);
                return (
                  <div key={idx} className="py-4 sm:py-5">
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between text-left gap-4 font-semibold text-base sm:text-[17px] text-[#1c2432] hover:text-[#e59a27] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="leading-snug">{faq.question}</span>
                      <span className="shrink-0 text-[#2b3242]/60">
                        {isOpen ? <ChevronUp size={20} className="text-[#e59a27]" /> : <ChevronDown size={20} />}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-3.5 text-sm sm:text-[15px] leading-relaxed text-[#2b3242]/80 pr-4">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 6. IN-ARTICLE LEAD CAPTURE FORM (High Conversion Card)   */}
        {/* ======================================================== */}
        <section className="mt-12 rounded-2xl bg-[#1e2532] text-white p-6 sm:p-8 shadow-xl border border-white/5">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
            {leadCtaTitle}
          </h3>
          <p className="mt-2 text-sm text-white/70">
            {leadCtaSubtitle}
          </p>

          {leadSuccess ? (
            <div className="mt-6 rounded-xl bg-white/10 p-5 border border-white/20">
              <div className="flex items-center gap-2.5 text-[#f59e0b] font-semibold text-base">
                <Check size={20} />
                <span>Call back request received!</span>
              </div>
              <p className="mt-2 text-sm text-white/80">
                Thank you, {leadName || 'there'}! Our Dubai property desk will get in touch on WhatsApp shortly.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#f59e0b] hover:underline"
              >
                Or message directly on WhatsApp now <ArrowUpRight size={13} />
              </a>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-xl bg-white px-4 py-3 text-base text-[#1c2432] outline-none shadow-xs placeholder:text-gray-400 focus:ring-2 focus:ring-[#f59e0b]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-white/70 mb-1.5">
                  WhatsApp number
                </label>
                <div className="flex rounded-xl bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#f59e0b]">
                  <select
                    value={leadCountryCode}
                    onChange={(e) => setLeadCountryCode(e.target.value)}
                    className="bg-gray-100 text-sm font-semibold text-[#1c2432] px-3.5 py-3 border-r border-gray-200 outline-none cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+966">🇸🇦 +966</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full bg-white px-4 py-3 text-base text-[#1c2432] outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              {leadError && <p className="text-xs text-red-400 font-medium">{leadError}</p>}

              <button
                type="submit"
                disabled={leadSubmitting}
                className="w-full rounded-xl bg-[#e59a27] hover:bg-[#d48b1c] active:scale-[0.99] py-3.5 text-center font-bold text-base text-white shadow-md transition-all disabled:opacity-60 cursor-pointer"
              >
                {leadSubmitting ? 'Submitting request…' : 'Request a call back'}
              </button>

              <div className="text-center pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white underline underline-offset-4 decoration-[#f59e0b] transition-colors"
                >
                  <FaWhatsapp size={14} className="text-[#f59e0b]" />
                  Or chat on WhatsApp
                </a>
              </div>
            </form>
          )}
        </section>

        {/* Back to Guides link */}
        <div className="mt-10 border-t border-[#2b3242]/12 pt-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#9f7a47] hover:underline"
          >
            <ArrowLeft size={14} /> Back to all guides & perspective
          </Link>
        </div>

        {/* ======================================================== */}
        {/* 7. RELATED GUIDES & ARTICLES                             */}
        {/* ======================================================== */}
        {related.length > 0 && (
          <section className="mt-14 border-t border-[#2b3242]/15 pt-8">
            <p className="eyebrow text-[#9f7a47]">Keep reading</p>
            <div className={`mt-6 ${cardGrid(related.length)}`}>
              {related.map((item) => (
                <Link key={item.id} href={`/blog/${item.slug}`} className="card-editorial group p-5 bg-white rounded-xl border border-[#2b3242]/10">
                  <div className="card-media image-reveal aspect-16/10 rounded-lg overflow-hidden">
                    <img
                      src={optimizedImage(
                        item.featuredImage || item.image || 'https://res.cloudinary.com/complaintreview/image/upload/v1790577279/knc-horizon/pages/dubai-skyline-from-sea.jpg',
                        800,
                      )}
                      alt={item.featuredImageAlt || item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="card-title mt-4 line-clamp-2 text-[#2b3242] transition-colors group-hover:text-[#9f7a47]">
                    {item.title}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 font-mono text-[11px] uppercase tracking-[.12em] text-[#9f7a47] group-hover:underline">
                    Read guide <ArrowUpRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* ======================================================== */}
      {/* 8. STICKY BOTTOM ACTION BAR (Mobile & Tablet)           */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#2b3242]/12 py-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden">
        <div className="mx-auto max-w-[48rem] flex items-center justify-between gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#e59a27] active:bg-[#d48b1c] py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
          >
            <FaWhatsapp size={17} />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href={`tel:${contact.phoneHref}`}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-white active:bg-gray-50 border-2 border-[#1c2432] py-2.5 text-sm font-bold text-[#1c2432] shadow-2xs transition-transform active:scale-[0.98]"
          >
            <Phone size={15} />
            <span>Call</span>
          </a>
        </div>
      </div>
    </main>
  );
}
