'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  ShoppingBag,
  Package,
  Store,
  Building2,
  LogOut,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const employeeNav: NavItem[] = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/employee/marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-5 h-5" /> },
  { href: '/employee/orders', label: 'Mijn Bestellingen', icon: <Package className="w-5 h-5" /> },
  { href: '/employee/profile', label: 'Profiel', icon: <Settings className="w-5 h-5" /> },
];

const employerNav: NavItem[] = [
  { href: '/employer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/employer/employees', label: 'Werknemers', icon: <Users className="w-5 h-5" /> },
  { href: '/employer/budgets', label: 'Budgetten', icon: <Wallet className="w-5 h-5" /> },
  { href: '/employer/billing', label: 'Facturering', icon: <CreditCard className="w-5 h-5" /> },
  { href: '/employer/reports', label: 'Rapporten', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/employer/settings', label: 'Instellingen', icon: <Settings className="w-5 h-5" /> },
];

const providerNav: NavItem[] = [
  { href: '/provider/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/provider/offerings', label: 'Mijn Aanbod', icon: <Store className="w-5 h-5" /> },
  { href: '/provider/orders', label: 'Bestellingen', icon: <Package className="w-5 h-5" /> },
  { href: '/provider/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/provider/settings', label: 'Instellingen', icon: <Settings className="w-5 h-5" /> },
];

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/companies', label: 'Bedrijven', icon: <Building2 className="w-5 h-5" /> },
  { href: '/admin/providers', label: 'Aanbieders', icon: <Store className="w-5 h-5" /> },
  { href: '/admin/offerings', label: 'Aanbod', icon: <Package className="w-5 h-5" /> },
  { href: '/admin/settings', label: 'Instellingen', icon: <Settings className="w-5 h-5" /> },
];

export function DashboardSidebar() {
  const { role, signOut } = useAuth();
  const pathname = usePathname();

  const navItems = role === 'employee' ? employeeNav
    : role === 'employer' ? employerNav
    : role === 'provider' ? providerNav
    : role === 'admin' ? adminNav
    : [];

  return (
    <aside className="w-64 bg-white border-r border-zynq-mid/20 min-h-screen flex flex-col">
      <div className="p-6 border-b border-zynq-mid/20">
        <Link href="/" className="text-zynq-green font-sans font-bold text-xl tracking-tight">
          Zynq
        </Link>
        {role && (
          <p className="text-xs text-zynq-muted font-sans mt-1 capitalize">
            {role === 'employee' ? 'Werknemer' : role === 'employer' ? 'Werkgever' : role === 'provider' ? 'Aanbieder' : 'Admin'}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm transition-colors',
                isActive
                  ? 'bg-zynq-pale text-zynq-green font-medium'
                  : 'text-zynq-dark hover:bg-zynq-pale hover:text-zynq-green'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zynq-mid/20">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md font-sans text-sm text-zynq-muted hover:text-zynq-red hover:bg-zynq-red/5 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Uitloggen
        </button>
      </div>
    </aside>
  );
}
