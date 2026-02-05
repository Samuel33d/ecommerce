'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineArrowLeft,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: HiOutlineChartBar },
  { href: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { href: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { href: '/admin/customers', label: 'Customers', icon: HiOutlineUsers },
  { href: '/admin/reports', label: 'Reports', icon: HiOutlineDocumentReport },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {navItems.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200',
              isActive
                ? 'bg-primary-600 text-white font-medium shadow-soft'
                : 'text-ink-600 hover:bg-surface-100 hover:text-ink-900',
            )}
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-surface-200 px-4 py-2 flex items-center justify-between">
        <h2 className="text-xs font-semibold text-ink-400 uppercase tracking-[0.15em]">
          Admin Panel
        </h2>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-ink-600 hover:text-ink-900 hover:bg-surface-100 rounded-xl transition-colors"
        >
          {mobileOpen ? (
            <HiOutlineX className="w-5 h-5" />
          ) : (
            <HiOutlineMenu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile dropdown nav */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[8rem] z-30">
          <div
            className="absolute inset-0 bg-ink-950/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative bg-white border-b border-surface-200 shadow-lifted px-4 py-3 space-y-1 animate-slide-up">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-3 transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="w-64 bg-white border-r border-surface-200 fixed top-16 bottom-0 left-0 hidden lg:block overflow-y-auto">
        <div className="p-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-ink-500 hover:text-ink-800 mb-7 transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
          <h2 className="text-[10px] font-semibold text-ink-400 uppercase tracking-[0.15em] mb-4">
            Admin Panel
          </h2>
          <nav className="space-y-1">
            <NavLinks pathname={pathname} />
          </nav>
        </div>
      </aside>
    </>
  );
}
