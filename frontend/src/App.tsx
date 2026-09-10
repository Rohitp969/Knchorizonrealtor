import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import { AboutPage, AreasPage, ContactPage, DesignBuildPage, InteriorsPage, PropertiesPage, ServicesPage } from '@/pages/interior-pages';
import { AdminPage, LoginPage, ProjectDetailPage, RegisterPage } from '@/pages/advanced-pages';
import { BlogPage, BlogPostPage, GalleryPage, ProjectsPage, PropertiesLivePage, PropertyDetailPage } from '@/pages/content-pages';
import { SiteShell } from '@/components/site-shell';
import { PrivacyPage, TermsPage } from '@/pages/legal-pages';
import { usePageMeta } from '@/lib/seo';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const pageMeta = {
    '/': ['Dubai Property Advisory', 'KNC Horizon Realtor connects clients with exceptional Dubai property, investment, design, and interiors services.'],
    '/properties': ['Properties', 'Explore selected homes and investment opportunities across Dubai with KNC Horizon Realtor.'],
    '/projects': ['Projects', 'Explore considered off-plan and new development opportunities across Dubai.'],
    '/blog': ['Blog', 'Real-estate guidance, neighbourhood notes, and property perspective from KNC Horizon Realtor.'],
    '/gallery': ['Portfolio', 'Explore the KNC Horizon visual archive of Dubai homes, interiors, and communities.'],
    '/areas': ['Dubai Areas', 'Find the Dubai neighbourhood that fits the way you want to live.'],
    '/about': ['About', 'Meet KNC Horizon Realtor, an independent Dubai property advisory built around context, candour, and care.'],
    '/services': ['Services', 'Property advisory, design, interiors, and relocation support from KNC Horizon Realtor in Dubai.'],
    '/design-build': ['Design & Build', 'KNC Horizon Design & Build brings together concept, build coordination, and considered delivery for Dubai homes.'],
    '/interiors': ['Interiors & Furniture', 'Interior design, bespoke furniture, and styling for Dubai homes from KNC Horizon Realtor.'],
    '/contact': ['Contact', 'Start a conversation with KNC Horizon Realtor about your next Dubai property move.'],
    '/terms-and-conditions': ['Terms & Conditions', 'General terms for using the KNC Horizon Realtor website.'],
    '/privacy-policy': ['Privacy Policy', 'General privacy information for KNC Horizon Realtor website enquiries.'],
  }[location] ?? ['KNC Horizon Realtor', 'A more considered way to move through Dubai property.'];
  usePageMeta(pageMeta[0], pageMeta[1]);
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <SiteShell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={AboutPage} />
          <Route path="/properties" component={PropertiesLivePage} />
          <Route path="/properties/:slug" component={PropertyDetailPage} />
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/projects/:slug" component={ProjectDetailPage} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/gallery" component={GalleryPage} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/design-build" component={DesignBuildPage} />
          <Route path="/interiors" component={InteriorsPage} />
          <Route path="/areas" component={AreasPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/terms-and-conditions" component={TermsPage} />
          <Route path="/privacy-policy" component={PrivacyPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      </SiteShell>
    </RoutedErrorBoundary>
  );
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: 'start' }));
    }
  }, [location]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <ScrollToTop />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
