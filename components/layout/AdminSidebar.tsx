'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: HiOutlineChartBar },
  { href: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { href: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { href: '/admin/customers', label: 'Customers', icon: HiOutlineUsers },
  { href: '/admin/reports', label: 'Reports', icon: HiOutlineDocumentReport },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-surface-200 min-h-[calc(100vh-4rem)] hidden lg:block">
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
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-ink-950 text-white font-medium shadow-soft'
                    : 'text-ink-600 hover:bg-surface-100 hover:text-ink-900',
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
