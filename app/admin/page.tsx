'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import type { DashboardStats } from '@/types';
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineCube,
  HiOutlineUsers,
} from 'react-icons/hi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardStats>('/orders/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: HiOutlineCurrencyDollar,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: HiOutlineClipboardList,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Products',
      value: stats.totalProducts.toString(),
      icon: HiOutlineCube,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Customers',
      value: stats.totalCustomers.toString(),
      icon: HiOutlineUsers,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-ink-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-soft p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-ink-500">{stat.label}</p>
                <p className="text-xl font-bold text-ink-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-soft">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-ink-900">
            Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                  Order
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-surface-200 last:border-0">
                  <td className="px-6 py-4 text-sm font-mono text-ink-500">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-900">
                    {order.user.firstName} {order.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-ink-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-500">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-ink-500"
                  >
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
