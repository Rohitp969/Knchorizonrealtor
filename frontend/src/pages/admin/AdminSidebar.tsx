import type React from 'react';
import { Link } from 'wouter';
import {
  LogOut,
  Home,
  Building2,
  FolderGit2,
  Users2,
  FileText,
  Mail,
  UserCheck,
  Palette,
  Settings,
  MapPin,
  LineChart,
  Images,
  FolderOpen,
  ExternalLink,
  X,
  Gauge,
  Files,
  Building,
  PenLine,
  Wrench,
  UserCog,
} from 'lucide-react';

import type { AdminUser } from '@/lib/admin-api';

export type AdminResource =
  | 'overview'
  | 'properties'
  | 'projects'
  | 'developers'
  | 'communities'
  | 'posts'
  | 'insights'
  | 'gallery'
  | 'media'
  | 'inquiries'
  | 'subscribers'
  | 'content'
  | 'settings'
  | 'seo-dashboard'
  | 'seo-pages'
  | 'seo-listings'
  | 'seo-articles'
  | 'seo-technical'
  | 'seo-managers';

/** The sections an SEO manager may open; everything else is administrators only. */
export const SEO_RESOURCES: AdminResource[] = ['seo-dashboard', 'seo-pages', 'seo-listings', 'seo-articles', 'seo-technical'];

export type AdminSidebarProps = {
  role: AdminUser['role'];
  resource: AdminResource;
  setResource: (resource: AdminResource) => void;
  logout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
};

type SidebarItem = {
  key: AdminResource | 'logout';
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
};

export function AdminSidebar({
  role,
  resource,
  setResource,
  logout,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const management: SidebarItem[] = [
    { key: 'overview', label: 'Overview', icon: <Home size={16} /> },
    { key: 'properties', label: 'Properties', icon: <Building2 size={16} /> },
    { key: 'projects', label: 'Off-Plan Projects', icon: <FolderGit2 size={16} /> },
    { key: 'developers', label: 'Developers', icon: <Users2 size={16} /> },
    { key: 'communities', label: 'Communities', icon: <MapPin size={16} /> },
    { key: 'posts', label: 'Blog', icon: <FileText size={16} /> },
    { key: 'insights', label: 'Market Insights', icon: <LineChart size={16} /> },
    { key: 'gallery', label: 'Gallery', icon: <Images size={16} /> },
    { key: 'media', label: 'Media Library', icon: <FolderOpen size={16} /> },
    { key: 'inquiries', label: 'Leads / Inquiries', icon: <Mail size={16} /> },
    { key: 'subscribers', label: 'Subscribers', icon: <UserCheck size={16} /> },
    { key: 'content', label: 'Website Content', icon: <Palette size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];
  const seo: SidebarItem[] = [
    { key: 'seo-dashboard', label: 'SEO Dashboard', icon: <Gauge size={16} /> },
    { key: 'seo-pages', label: 'Page SEO', icon: <Files size={16} /> },
    { key: 'seo-listings', label: 'Property & Project SEO', icon: <Building size={16} /> },
    { key: 'seo-articles', label: 'Articles', icon: <PenLine size={16} /> },
    { key: 'seo-technical', label: 'Technical SEO', icon: <Wrench size={16} /> },
    ...(role === 'admin' ? [{ key: 'seo-managers' as const, label: 'SEO Managers', icon: <UserCog size={16} /> }] : []),
  ];
  // An SEO manager sees the SEO section only; the server refuses the rest to them anyway.
  const sections: { title: string; items: SidebarItem[] }[] = role === 'seo_manager'
    ? [{ title: 'SEO', items: seo }]
    : [{ title: 'Management', items: management }, { title: 'SEO', items: seo }];
  const logoutItem: SidebarItem = { key: 'logout', label: 'Logout', icon: <LogOut size={16} /> };

  const handleSelect = (key: AdminResource | 'logout') => {
    if (key === 'logout') {
      logout();
    } else {
      setResource(key);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#2b3242]/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#2b3242]/12 bg-[#f1ebe1] transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-[100dvh] md:w-64 md:translate-x-0 md:shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between border-b border-[#2b3242]/10 px-5">
          <Link href="/admin" className="flex flex-col gap-1" aria-label="KNC Horizon Realtor admin console">
            <img src="/brand/knc-logo-horizontal.svg" alt="" className="h-7 w-auto" />
            <span className="font-mono text-[9px] uppercase tracking-[.2em] text-[#9f7a47]">
              {role === 'seo_manager' ? 'SEO Console' : 'Admin Console'}
            </span>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[#2b3242]/70 hover:bg-[#2b3242]/10 hover:text-[#2b3242] md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex ? 'mt-5' : ''}>
          <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[.2em] text-[#2b3242]/65">
            {section.title}
          </p>

          <div className="space-y-1">
            {[...section.items, ...(sectionIndex === sections.length - 1 ? [logoutItem] : [])].map((item) => {
              const isLogout = item.key === 'logout';
              const isActive = !isLogout && resource === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  data-testid={`sidebar-${item.key}`}
                  onClick={() => handleSelect(item.key)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all ${
                    isLogout
                      ? 'mt-3 border-t border-[#2b3242]/10 pt-3 text-[#9f7a47] hover:bg-[#8f6d3f]/10'
                      : isActive
                      ? 'bg-[#2b3242] text-[#faf7f1] shadow-xs'
                      : 'text-[#2b3242]/75 hover:bg-[#2b3242]/8 hover:text-[#2b3242]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-[#9f7a47]'
                          : isLogout
                          ? 'text-[#9f7a47]'
                          : 'text-[#2b3242]/60 group-hover:text-[#2b3242]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8f6d3f]" />
                  )}
                </button>
              );
            })}
          </div>
          </div>
          ))}
        </nav>

        {/* Footer / Quick Links */}
        <div className="border-t border-[#2b3242]/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-lg border border-[#2b3242]/15 bg-[#faf7f1]/60 px-3 py-2 font-mono text-[11px] uppercase tracking-[.14em] text-[#2b3242]/70 transition-colors hover:border-[#9f7a47] hover:text-[#9f7a47]"
          >
            <span>View Public Site</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </aside>
    </>
  );
}
