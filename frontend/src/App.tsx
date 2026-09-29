import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import { SiteShell } from '@/components/site-shell';
import { SiteSettingsProvider, useContact, useSiteSettings } from '@/lib/site-settings';
import { canonicalPath, organizationJsonLd, PRIORITY_FALLBACK, PRIORITY_STATIC, SeoProvider, useHead, useSeoData } from '@/lib/seo';
import { PAGE_IMAGES, PAGE_META } from '@/lib/page-meta';
import { MotionConfig } from 'framer-motion';

/*
 * ============================================================
 * PAGES
 * ============================================================
 *
 * One file per page, in a folder named after its section of the
 * site: src/pages/<section>/<PageName>.tsx
 */
import Home from '@/pages/home/HomePage';

import { AboutPage } from '@/pages/about/AboutPage';
import { AboutApproachPage } from '@/pages/about/AboutApproachPage';
import { IndiaOfficePage } from '@/pages/about/IndiaOfficePage';

import { PropertiesLivePage } from '@/pages/properties/PropertiesLivePage';
import { PropertiesFilterPage } from '@/pages/properties/PropertiesFilterPage';
import { PropertyDetailPage } from '@/pages/properties/PropertyDetailPage';

import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectsFilterPage } from '@/pages/projects/ProjectsFilterPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';

import { DevelopersPage } from '@/pages/developers/DevelopersPage';
import { DeveloperDetailPage } from '@/pages/developers/DeveloperDetailPage';

import { AreasPage, CommunitiesPage } from '@/pages/communities/CommunitiesPage';
import { CommunityDetailPage } from '@/pages/communities/CommunityDetailPage';

import { ServicesPage } from '@/pages/services/ServicesPage';
import { DesignBuildPage } from '@/pages/services/DesignBuildPage';
import { InteriorsPage } from '@/pages/services/InteriorsPage';

import { BlogPage } from '@/pages/blog/BlogPage';
import { BlogPostPage } from '@/pages/blog/BlogPostPage';
import { MarketInsightsPage } from '@/pages/market-insights/MarketInsightsPage';
import { GalleryPage } from '@/pages/gallery/GalleryPage';
import { ContactPage } from '@/pages/contact/ContactPage';

import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { TermsPage } from '@/pages/legal/TermsPage';

import NotFound from '@/pages/not-found/NotFoundPage';
import { AdminPage } from '@/pages/admin/AdminPage';

import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

/*
 * ============================================================
 * ROUTER
 * ============================================================
 */
function Router() {
  const [location] = useLocation();

  /*
   * ==========================================================
   * PAGE SEO META
   * ==========================================================
   * Static pages take their built-in text from PAGE_META and any SEO console override for
   * their path; detail pages describe themselves and outrank the fallback used for any other
   * route. The admin console is never indexed.
   */
  const contact = useContact();
  const { siteName } = useSiteSettings();
  const { settings: seoSettings, pages: seoPages } = useSeoData();
  const isAdmin = location === '/admin' || location.startsWith('/admin/');
  const staticMeta = PAGE_META[location] ?? PAGE_META[canonicalPath(location)];
  const [metaTitle, metaDescription] = staticMeta ?? ['', 'A more considered way to move through Dubai property.'];
  // The page's own photo is its share image; its alt text is dropped once the console sets another image.
  const shareImage: [string, string] | undefined = PAGE_IMAGES[location] ?? PAGE_IMAGES[canonicalPath(location)];
  const customShareImage = Boolean(seoPages[canonicalPath(location)]?.ogImage);

  useHead(
    isAdmin
      ? { title: 'Admin console', description: '', path: location, seo: null, noindex: true }
      : {
          title: metaTitle,
          description: metaDescription,
          path: location,
          image: shareImage?.[0],
          imageAlt: customShareImage ? undefined : shareImage?.[1],
          jsonLd: location === '/'
            ? [organizationJsonLd({ siteName, siteUrl: seoSettings.siteUrl, phone: contact.phoneDisplay, email: contact.email })]
            : undefined,
        },
    isAdmin || staticMeta ? PRIORITY_STATIC : PRIORITY_FALLBACK,
  );

  /*
   * ============================================================
   * ADMIN SECTION
   * ============================================================
   *
   * Admin dashboard is intentionally outside SiteShell.
   *
   * This prevents:
   * - Public Navbar
   * - Public Footer
   * - Public website layout
   *
   * from appearing on the Admin Dashboard.
   */
  if (
    location === '/admin' ||
    location.startsWith('/admin/')
  ) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route
            path="/admin"
            component={AdminPage}
          />

          <Route
            path="/admin/:sub*"
            component={AdminPage}
          />
        </Switch>
      </RoutedErrorBoundary>
    );
  }

  /*
   * ============================================================
   * PUBLIC WEBSITE
   * ============================================================
   */
  return (
    <RoutedErrorBoundary>
      <SiteShell>
        <Switch>

          {/* ================================================== */}
          {/* HOME */}
          {/* ================================================== */}

          <Route
            path="/"
            component={Home}
          />

          {/* ================================================== */}
          {/* MAIN PAGES */}
          {/* ================================================== */}

          <Route
            path="/about"
            component={AboutPage}
          />

          <Route
            path="/about/approach"
            component={AboutApproachPage}
          />

          <Route
            path="/about/india-office"
            component={IndiaOfficePage}
          />

          <Route
            path="/areas"
            component={AreasPage}
          />

          <Route
            path="/communities"
            component={CommunitiesPage}
          />

          <Route
            path="/communities/:slug"
            component={CommunityDetailPage}
          />

          <Route
            path="/market-insights"
            component={MarketInsightsPage}
          />

          <Route
            path="/contact"
            component={ContactPage}
          />

          <Route
            path="/services"
            component={ServicesPage}
          />

          <Route
            path="/design-build"
            component={DesignBuildPage}
          />

          <Route
            path="/interiors"
            component={InteriorsPage}
          />

          {/* ================================================== */}
          {/* PROPERTIES */}
          {/* ================================================== */}

          <Route
            path="/properties"
            component={PropertiesLivePage}
          />

          <Route
            path="/properties/sale"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/rent"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/residential"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/commercial"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/investment"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/off-plan"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/filter"
            component={PropertiesFilterPage}
          />

          <Route
            path="/properties/live"
            component={PropertiesLivePage}
          />

          <Route
            path="/properties/:slug"
            component={PropertyDetailPage}
          />

          <Route
            path="/property/:id"
            component={PropertyDetailPage}
          />

          {/* ================================================== */}
          {/* PROJECTS & OFF-PLAN */}
          {/* ================================================== */}

          <Route
            path="/off-plan"
            component={ProjectsPage}
          />

          <Route
            path="/off-plan/new-launches"
            component={ProjectsFilterPage}
          />

          <Route
            path="/off-plan/apartments"
            component={ProjectsFilterPage}
          />

          <Route
            path="/off-plan/villas-townhouses"
            component={ProjectsFilterPage}
          />

          <Route
            path="/off-plan/developers"
            component={DevelopersPage}
          />

          <Route
            path="/projects"
            component={ProjectsPage}
          />

          <Route
            path="/projects/featured"
            component={ProjectsFilterPage}
          />

          <Route
            path="/projects/new-launches"
            component={ProjectsFilterPage}
          />

          <Route
            path="/projects/off-plan"
            component={ProjectsFilterPage}
          />

          <Route
            path="/projects/filter"
            component={ProjectsFilterPage}
          />

          <Route
            path="/projects/:slug"
            component={ProjectDetailPage}
          />

          <Route
            path="/project/:id"
            component={ProjectDetailPage}
          />

          {/* ================================================== */}
          {/* DEVELOPERS */}
          {/* ================================================== */}

          <Route
            path="/developers"
            component={DevelopersPage}
          />

          <Route
            path="/developers/:slug"
            component={DeveloperDetailPage}
          />

          <Route
            path="/developers/:id"
            component={DeveloperDetailPage}
          />

          {/* ================================================== */}
          {/* BLOG */}
          {/* ================================================== */}

          <Route
            path="/blog"
            component={BlogPage}
          />

          {/* The blog is also referred to as the journal, so that URL lands on it too. */}
          <Route
            path="/journal"
            component={BlogPage}
          />

          <Route
            path="/journal/:slug"
            component={BlogPostPage}
          />

          <Route
            path="/blog/:slug"
            component={BlogPostPage}
          />

          {/* ================================================== */}
          {/* GALLERY */}
          {/* ================================================== */}

          <Route
            path="/gallery"
            component={GalleryPage}
          />

          {/* ================================================== */}
          {/* AUTHENTICATION */}
          {/* ================================================== */}



          {/* ================================================== */}
          {/* LEGAL PAGES */}
          {/* ================================================== */}

          {/* Terms - short URL */}
          <Route
            path="/terms"
            component={TermsPage}
          />

          {/* Terms - full URL */}
          <Route
            path="/terms-and-conditions"
            component={TermsPage}
          />

          {/* Privacy - short URL */}
          <Route
            path="/privacy"
            component={PrivacyPage}
          />

          {/* Privacy - full URL */}
          <Route
            path="/privacy-policy"
            component={PrivacyPage}
          />

          {/* ================================================== */}
          {/* 404 */}
          {/* ================================================== */}

          <Route
            component={NotFound}
          />

        </Switch>
      </SiteShell>
    </RoutedErrorBoundary>
  );
}

/*
 * ============================================================
 * SCROLL TO TOP
 * ============================================================
 */
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    });

    /*
     * Handle hash links such as:
     *
     * /about#team
     * /services#design
     */
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);

      window.requestAnimationFrame(() => {
        document
          .getElementById(hash)
          ?.scrollIntoView({
            block: 'start',
          });
      });
    }
  }, [location]);

  return null;
}

/*
 * ============================================================
 * GOOGLE TAG PAGE VIEWS
 * ============================================================
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/*
 * The Google tag in index.html records the page the visitor lands on. Moving between pages
 * afterwards never reloads the document, so each later route change is reported here instead.
 * Rendered after <Router /> so the new page has already written its title. Comparing against
 * the last path sent keeps the landing page from being counted twice.
 */
function GoogleTagPageViews() {
  const [location] = useLocation();
  const lastPath = useRef(window.location.pathname);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: path + window.location.search,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

/*
 * ============================================================
 * ROUTED ERROR BOUNDARY
 * ============================================================
 */
function RoutedErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const [location] = useLocation();

  return (
    <ErrorBoundary resetKey={location}>
      {children}
    </ErrorBoundary>
  );
}

/*
 * ============================================================
 * MAIN APP
 * ============================================================
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every framer-motion reveal on the site honour the
          viewer's OS "reduce motion" setting, the same one the CSS guard reads. */}
      <MotionConfig reducedMotion="user">
      <SiteSettingsProvider>
      <SeoProvider>
        <TooltipProvider>

          <WouterRouter
            base={import.meta.env.BASE_URL.replace(/\/$/, '')}
          >
            <ScrollToTop />

            <Router />
            <GoogleTagPageViews />
          </WouterRouter>

          <Toaster />

        </TooltipProvider>
      </SeoProvider>
      </SiteSettingsProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;