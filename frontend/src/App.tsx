import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

import NotFound from '@/pages/not-found';
import Home from '@/pages/home';

import {
  AboutApproachPage,
  AboutPage,
  AreasPage,
  CommunitiesPage,
  ContactPage,
  DesignBuildPage,
  IndiaOfficePage,
  InteriorsPage,
  MarketInsightsPage,
  ServicesPage,
} from '@/pages/interior-pages';

import { AdminPage } from '@/pages/admin/AdminPage';

import { ProjectDetailPage } from '@/pages/advanced-pages';

import {
  BlogPage,
  BlogPostPage,
  CommunityDetailPage,
  GalleryPage,
  ProjectsPage,
  PropertiesLivePage,
  PropertyDetailPage,
  PropertiesFilterPage,
  ProjectsFilterPage,
  DevelopersPage,
} from '@/pages/content-pages';

import { SiteShell } from '@/components/site-shell';
import { SiteSettingsProvider, useContact, useSiteSettings } from '@/lib/site-settings';
import { MotionConfig } from 'framer-motion';

/*
 * ============================================================
 * LEGAL PAGES
 * ============================================================
 *
 * Both PrivacyPage and TermsPage are now inside:
 *
 * src/pages/legal-pages.tsx
 *
 * Separate PrivacyPage.tsx and TermsPage.tsx files are not
 * required when this import is used.
 */
import {
  PrivacyPage,
  TermsPage,
} from '@/pages/legal-pages';

import { DeveloperDetailPage } from '@/pages/developer-detail-page';
import { canonicalPath, organizationJsonLd, PRIORITY_FALLBACK, PRIORITY_STATIC, SeoProvider, useHead, useSeoData } from '@/lib/seo';
import { PAGE_META } from '@/lib/page-meta';

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
  const { settings: seoSettings } = useSeoData();
  const isAdmin = location === '/admin' || location.startsWith('/admin/');
  const staticMeta = PAGE_META[location] ?? PAGE_META[canonicalPath(location)];
  const [metaTitle, metaDescription] = staticMeta ?? ['', 'A more considered way to move through Dubai property.'];

  useHead(
    isAdmin
      ? { title: 'Admin console', description: '', path: location, seo: null, noindex: true }
      : {
          title: metaTitle,
          description: metaDescription,
          path: location,
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