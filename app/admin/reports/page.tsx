'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { generateReport } from '@/lib/generateReport';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import type { ReportData } from '@/types';
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineTrendingUp,
  HiOutlineDocumentDownload,
} from 'react-icons/hi';

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const presets = [
  {
    label: 'Last 7 days',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start: toISODate(start), end: toISODate(end) };
    },
  },
  {
    label: 'Last 30 days',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start: toISODate(start), end: toISODate(end) };
    },
  },
  {
    label: 'This month',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: toISODate(start), end: toISODate(now) };
    },
  },
  {
    label: 'Last month',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toISODate(start), end: toISODate(end) };
    },
  },
];

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (start: string, end: string) => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const data = await api.get<ReportData>(
        `/orders/report?startDate=${start}&endDate=${end}`,
      );
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (getDates: () => { start: string; end: string }) => {
    const { start, end } = getDates();
    setStartDate(start);
    setEndDate(end);
    fetchReport(start, end);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    fetchReport(startDate, endDate);
  };

  const handleDownload = () => {
    if (!report) return;
    generateReport(report);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        {report && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <HiOutlineDocumentDownload className="w-5 h-5" />
            Download PDF
          </button>
        )}
      </div>

      {/* Date range selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Quick Presets
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.getDates)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Custom Range
        </h2>
        <form onSubmit={handleCustomSubmit} className="flex items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Generate
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-xl mb-6" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {/* Report preview */}
      {report && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-green-50 text-green-600">
                  <HiOutlineCurrencyDollar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(report.summary.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <HiOutlineClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">
                    {report.summary.totalOrders}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                  <HiOutlineTrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(report.summary.avgOrderValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          {report.ordersByStatus.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Orders by Status
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Count
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.ordersByStatus.map((row) => (
                      <tr key={row.status} className="border-b last:border-0">
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {row.count}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(row.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Selling Products */}
          {report.topSellingProducts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Selling Products
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Qty Sold
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topSellingProducts.map((product, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.totalQuantity}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(product.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders List */}
          {report.orders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Orders ({report.orders.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Order
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {report.orders.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                No orders found in the selected date range.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
