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

import {
  LoginPage,
  ProjectDetailPage,
  RegisterPage,
} from '@/pages/advanced-pages';

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
import { usePageMeta } from '@/lib/seo';

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
   */
  const pageMeta: Record<string, [string, string]> = {
    '/': [
      'Dubai Property Advisory',
      'KNC Horizon Realtor connects clients with exceptional Dubai property, investment, design, and interiors services.',
    ],

    '/properties': [
      'Properties',
      'Explore selected homes and investment opportunities across Dubai with KNC Horizon Realtor.',
    ],

    '/projects': [
      'Projects',
      'Explore considered off-plan and new development opportunities across Dubai.',
    ],

    '/blog': [
      'Blog',
      'Real-estate guidance, neighbourhood notes, and property perspective from KNC Horizon Realtor.',
    ],

    '/gallery': [
      'Portfolio',
      'Explore the KNC Horizon visual archive of Dubai homes, interiors, and communities.',
    ],

    '/areas': [
      'Dubai Areas',
      'Find the Dubai neighbourhood that fits the way you want to live.',
    ],

    '/communities': [
      'Dubai Communities',
      'Explore premier Dubai neighbourhoods, waterfront communities, and master developments.',
    ],

    '/about': [
      'About',
      'Meet KNC Horizon Realtor, an independent Dubai property advisory built around context, candour, and care.',
    ],

    '/about/approach': [
      'Our Approach',
      'Learn about KNC Horizon Realtor’s disciplined advisory framework, due diligence, and client care.',
    ],

    '/about/india-office': [
      'India Office · DLF Phase 1 Gurugram',
      'Connecting Indian HNIs and NRI investors to prime Dubai real estate through our Gurugram advisory desk.',
    ],

    '/market-insights': [
      'Dubai Market Insights',
      'Essential market fundamentals, freehold regulations, rental yields, and investment intelligence.',
    ],

    '/properties/sale': [
      'Properties for Sale',
      'Curated freehold homes, luxury villas, and prime penthouses for sale across Dubai.',
    ],

    '/properties/rent': [
      'Properties for Rent',
      'Exceptional luxury residences and prime commercial properties available for lease in Dubai.',
    ],

    '/off-plan': [
      'Off-Plan Developments',
      'Explore premier off-plan developments and payment plans from Dubai’s top master developers.',
    ],

    '/off-plan/new-launches': [
      'New Launches',
      'The newest property launches from leading Dubai developers including Emaar, Sobha, and Meraas.',
    ],

    '/off-plan/apartments': [
      'Off-Plan Apartments',
      'Prime waterfront and skyline off-plan apartments across Dubai’s highest-performing corridors.',
    ],

    '/off-plan/villas-townhouses': [
      'Off-Plan Villas & Townhouses',
      'Master-planned off-plan villas and family townhouses in Dubai’s premier gated communities.',
    ],

    '/off-plan/developers': [
      'Top Dubai Developers',
      'Explore verified developments by Emaar, Sobha, Omniyat, Nakheel, Meraas, and Ellington.',
    ],

    '/services': [
      'Services',
      'Property advisory, design, interiors, and relocation support from KNC Horizon Realtor in Dubai.',
    ],

    '/design-build': [
      'Design & Build',
      'KNC Horizon Design & Build brings together concept, build coordination, and considered delivery for Dubai homes.',
    ],

    '/interiors': [
      'Interiors & Furniture',
      'Interior design, bespoke furniture, and styling for Dubai homes from KNC Horizon Realtor.',
    ],

    '/contact': [
      'Contact',
      'Start a conversation with KNC Horizon Realtor about your next Dubai property move.',
    ],

    /*
     * ========================================================
     * TERMS & CONDITIONS
     * ========================================================
     */

    '/terms': [
      'Terms & Conditions',
      'General terms and conditions for using the KNC Horizon Realtor website.',
    ],

    '/terms-and-conditions': [
      'Terms & Conditions',
      'General terms and conditions for using the KNC Horizon Realtor website.',
    ],

    /*
     * ========================================================
     * PRIVACY POLICY
     * ========================================================
     */

    '/privacy': [
      'Privacy Policy',
      'Privacy information explaining how KNC Horizon Realtor may collect, use and protect website enquiry information.',
    ],

    '/privacy-policy': [
      'Privacy Policy',
      'Privacy information explaining how KNC Horizon Realtor may collect, use and protect website enquiry information.',
    ],
  };

  const currentMeta = pageMeta[location] ?? [
    'KNC Horizon Realtor',
    'A more considered way to move through Dubai property.',
  ];

  usePageMeta(currentMeta[0], currentMeta[1]);

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

          <Route
            path="/login"
            component={LoginPage}
          />

          <Route
            path="/register"
            component={RegisterPage}
          />

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
      <TooltipProvider>

        <WouterRouter
          base={import.meta.env.BASE_URL.replace(/\/$/, '')}
        >
          <ScrollToTop />

          <Router />
        </WouterRouter>

        <Toaster />

      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;