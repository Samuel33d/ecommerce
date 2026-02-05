'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

interface CustomerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchCustomers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.get<PaginatedResponse<CustomerData>>(
        `/users?page=${page}&limit=10`,
      );
      setCustomers(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-ink-900 mb-6">Customers</h1>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                    Phone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                    Orders
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-surface-200 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 text-primary-800 rounded-full flex items-center justify-center text-sm font-semibold">
                          {customer.firstName[0]}
                          {customer.lastName[0]}
                        </div>
                        <span className="text-sm font-medium text-ink-900">
                          {customer.firstName} {customer.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          customer.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-surface-100 text-ink-800'
                        }`}
                      >
                        {customer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">
                      {customer._count.orders}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">
                      {formatDate(customer.createdAt)}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-sm text-ink-500"
                    >
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-surface-200">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => fetchCustomers(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    p === meta.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-100 text-ink-600 hover:bg-surface-200'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
