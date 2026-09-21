import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { ExternalLink, Menu } from 'lucide-react';

import { AdminAuthError, type AdminUser } from '@/lib/admin-api';
import { AdminSidebar, type AdminResource } from '@/pages/admin/AdminSidebar';
import { ResourceManager } from '@/pages/admin/ResourceManager';
import { resources } from '@/pages/admin/resource-config';
import { InquiriesPanel, MediaPanel, OverviewPanel, SettingsPanel, SubscribersPanel } from '@/pages/admin/panels';
import { StateBlock, ToastProvider, adminButtonClass } from '@/pages/admin/admin-ui';

export type AdminDashboardProps = {
  user: AdminUser;
  logout: () => void;
  onAuthLost: () => void;
};

/** Public URL for the “view on site” action, per resource. */
const publicPaths: Partial<Record<AdminResource, (item: Record<string, any>) => string>> = {
  properties: (item) => `/properties/${item.slug ?? ''}`,
  projects: (item) => `/projects/${item.slug ?? ''}`,
  developers: (item) => `/developers/${item.slug ?? ''}`,
  communities: () => '/communities',
  posts: (item) => `/blog/${item.slug ?? ''}`,
  insights: () => '/market-insights',
  gallery: () => '/gallery',
};

export function AdminDashboard({ user, logout, onAuthLost }: AdminDashboardProps) {
  const [resource, setResource] = useState<AdminResource>('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  // Any panel that hits a 401/403 bubbles it up as an unhandled rejection; catch it once here.
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof AdminAuthError) {
        event.preventDefault();
        onAuthLost();
      }
    };
    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, [onAuthLost]);

  useEffect(() => { setMenuOpen(false); }, [resource]);

  return (
    <ToastProvider>
      <div className="flex min-h-[100dvh] bg-[#f3efe6]">
        <AdminSidebar
          resource={resource}
          setResource={setResource}
          logout={logout}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[#202635]/12 bg-[#f8f5ee]/95 px-4 py-3 backdrop-blur md:px-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-sm border border-[#202635]/15 md:hidden"
              aria-label="Open admin menu"
              data-testid="button-admin-menu"
            >
              <Menu size={16} />
            </button>
            <p className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[.16em] text-[#202635]/55">
              KNC Horizon · Admin console
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden truncate font-mono text-[10px] uppercase tracking-[.12em] text-[#202635]/50 sm:block">{user.email}</span>
              <a href="/" target="_blank" rel="noreferrer" className={adminButtonClass('ghost')}>
                <ExternalLink size={13} /> <span className="hidden sm:inline">View site</span>
              </a>
            </div>
          </header>

          <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8" data-testid={`admin-panel-${resource}`}>
            <PanelBoundary resourceKey={resource}>
              <AdminPanel resource={resource} user={user} onNavigate={setResource} />
            </PanelBoundary>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

function AdminPanel({
  resource,
  user,
  onNavigate,
}: {
  resource: AdminResource;
  user: AdminUser;
  onNavigate: (resource: AdminResource) => void;
}) {
  if (resource === 'overview') return <OverviewPanel onNavigate={onNavigate} />;
  if (resource === 'inquiries') return <InquiriesPanel />;
  if (resource === 'subscribers') return <SubscribersPanel />;
  if (resource === 'media') return <MediaPanel />;
  if (resource === 'content' || resource === 'settings') return <SettingsPanel user={user} area={resource} />;

  const config = resources[resource];
  if (!config) return <StateBlock title="Unknown section" message="Pick a section from the sidebar." />;
  return <ResourceManager config={config} publicPath={publicPaths[resource]} />;
}

/** Keeps one broken panel from taking down the whole console. */
class PanelBoundary extends Component<{ children: ReactNode; resourceKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(previous: { resourceKey: string }) {
    if (previous.resourceKey !== this.props.resourceKey && this.state.error) this.setState({ error: null });
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Admin panel error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <StateBlock
          tone="error"
          title="This section hit an error"
          message={this.state.error.message}
          action={
            <button className={adminButtonClass('ghost')} onClick={() => this.setState({ error: null })}>
              Try again
            </button>
          }
        />
      );
    }
    return this.props.children;
  }
}
