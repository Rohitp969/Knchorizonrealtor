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
  ExternalLink,
  X,
} from 'lucide-react';

export type AdminResource =
  | 'overview'
  | 'properties'
  | 'projects'
  | 'developers'
  | 'posts'
  | 'inquiries'
  | 'subscribers'
  | 'content'
  | 'settings';

export type AdminSidebarProps = {
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
  resource,
  setResource,
  logout,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const items: SidebarItem[] = [
    { key: 'overview', label: 'Overview', icon: <Home size={16} /> },
    { key: 'properties', label: 'Properties', icon: <Building2 size={16} /> },
    { key: 'projects', label: 'Projects', icon: <FolderGit2 size={16} /> },
    { key: 'developers', label: 'Developers', icon: <Users2 size={16} /> },
    { key: 'posts', label: 'Blog', icon: <FileText size={16} /> },
    { key: 'inquiries', label: 'Leads / Inquiries', icon: <Mail size={16} /> },
    { key: 'subscribers', label: 'Subscribers', icon: <UserCheck size={16} /> },
    { key: 'content', label: 'Website Content', icon: <Palette size={16} /> },
    { key: 'settings', label: 'Settings', icon: <Settings size={16} /> },
    { key: 'logout', label: 'Logout', icon: <LogOut size={16} /> },
  ];

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
          className="fixed inset-0 z-40 bg-[#202635]/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#202635]/12 bg-[#ebe5dc] transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 md:shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between border-b border-[#202635]/10 px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center border border-[#c97352]/70 bg-[#202635] text-[#f5f0e6]">
              <span className="font-serif text-base font-bold leading-none text-[#c97352]">K</span>
            </span>
            <div className="leading-tight">
              <span className="block font-sans text-[11px] font-bold tracking-[.2em] text-[#202635]">
                KNC HORIZON
              </span>
              <span className="block font-mono text-[8px] uppercase tracking-[.18em] text-[#c97352]">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-sm text-[#202635]/70 hover:bg-[#202635]/10 hover:text-[#202635] md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[.2em] text-[#202635]/45">
            Management
          </p>

          <div className="space-y-1">
            {items.map((item) => {
              const isLogout = item.key === 'logout';
              const isActive = !isLogout && resource === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSelect(item.key)}
                  className={`group flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-xs font-medium transition-all ${
                    isLogout
                      ? 'mt-3 border-t border-[#202635]/10 pt-3 text-[#c97352] hover:bg-[#c97352]/10'
                      : isActive
                      ? 'bg-[#202635] text-[#f5f0e6] shadow-xs'
                      : 'text-[#202635]/75 hover:bg-[#202635]/8 hover:text-[#202635]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-[#c97352]'
                          : isLogout
                          ? 'text-[#c97352]'
                          : 'text-[#202635]/60 group-hover:text-[#202635]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c97352]" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer / Quick Links */}
        <div className="border-t border-[#202635]/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between rounded-sm border border-[#202635]/15 bg-[#f5f0e6]/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#202635]/70 transition-colors hover:border-[#c97352] hover:text-[#c97352]"
          >
            <span>View Public Site</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </aside>
    </>
  );
}
