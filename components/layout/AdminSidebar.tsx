'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineUsers,
  HiOutlineArrowLeft,
} from 'react-icons/hi';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: HiOutlineChartBar },
  { href: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { href: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { href: '/admin/customers', label: 'Customers', icon: HiOutlineUsers },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] hidden lg:block">
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Store
        </Link>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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
                  'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
