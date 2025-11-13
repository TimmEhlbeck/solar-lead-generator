import React, { PropsWithChildren } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Home,
  Sun,
  Zap,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  User,
  Shield,
  Users,
  Briefcase,
  Mail
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { DynamicTheme } from '@/Components/DynamicTheme';

interface DashboardLayoutProps extends PropsWithChildren {
  auth: {
    user: {
      name: string;
      email: string;
      is_admin?: boolean;
      roles?: string[];
    };
  };
  header?: React.ReactNode;
}

const getNavigation = (user: { is_admin?: boolean; roles?: string[] }) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Dachplanung', href: '/', icon: Home },
  ];

  // Check if user has admin role
  const isAdmin = user.is_admin || user.roles?.includes('admin');
  const isSales = user.roles?.includes('sales');

  if (isAdmin) {
    return [
      ...baseNavigation,
      { name: 'Admin', href: '/admin/dashboard', icon: Shield },
      { name: 'Alle Projekte', href: '/admin/projects', icon: FolderOpen },
      { name: 'Alle Dokumente', href: '/admin/documents', icon: FileText },
      { name: 'Benutzer', href: '/admin/users', icon: Users },
      { name: 'Einstellungen', href: '/admin/settings', icon: Settings },
    ];
  }

  if (isSales) {
    return [
      ...baseNavigation,
      { name: 'Vertrieb', href: '/sales/dashboard', icon: Briefcase },
      { name: 'Projekte', href: '/sales/projects', icon: FolderOpen },
      { name: 'Leads', href: '/sales/leads', icon: Mail },
    ];
  }

  return [
    ...baseNavigation,
    { name: 'Dokumente', href: '/documents', icon: FileText },
  ];
};

export default function DashboardLayout({ auth, header, children }: DashboardLayoutProps) {
  const navigation = getNavigation(auth.user);

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.post('/logout', {}, {
      onSuccess: () => {
        window.location.href = '/login';
      }
    });
  };

  return (
    <>
      <DynamicTheme />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 text-white" style={{ backgroundColor: 'var(--company-secondary)' }}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--company-primary)' }}>
                <Sun className="h-6 w-6" style={{ color: 'var(--company-text)' }} />
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--company-text)' }}>GW Energytec</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = false; // TODO: Implement active state

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                    transition-colors
                    ${isActive
                      ? 'bg-white/10'
                      : 'hover:bg-white/5'
                    }
                  `}
                  style={{ color: isActive ? 'var(--company-text)' : 'rgba(255, 255, 255, 0.7)' }}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--company-primary)' }}>
                <User className="h-5 w-5" style={{ color: 'var(--company-text)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--company-text)' }}>
                  {auth.user.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {auth.user.email}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <Settings className="h-4 w-4" />
                Einstellungen
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </aside>

        {/* Main Content */}
        <div className="pl-64">
          {/* Header */}
          {header && (
            <header className="bg-white dark:bg-gray-800 shadow-sm">
              <div className="px-6 py-4">
                {header}
              </div>
            </header>
          )}

          {/* Page Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
