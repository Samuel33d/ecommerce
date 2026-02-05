'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { generateReport } from '@/lib/generateReport';
import { formatPrice, formatDate, getStatusColor, cn } from '@/lib/utils';
import Skeleton, { TableSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import type { ReportData } from '@/types';
import {
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineTrendingUp,
  HiOutlineDocumentDownload,
  HiOutlineCalendar,
  HiOutlineChartBar,
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
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
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

  const handlePreset = (
    label: string,
    getDates: () => { start: string; end: string },
  ) => {
    const { start, end } = getDates();
    setStartDate(start);
    setEndDate(end);
    setActivePreset(label);
    fetchReport(start, end);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setActivePreset(null);
    fetchReport(startDate, endDate);
  };

  const handleDownload = () => {
    if (!report) return;
    setDownloading(true);
    try {
      generateReport(report);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-950 font-display">Reports</h1>
          <p className="text-sm text-ink-500 mt-1">
            Generate and download sales reports
          </p>
        </div>
        {report && (
          <Button onClick={handleDownload} loading={downloading}>
            <HiOutlineDocumentDownload className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Date range selection */}
      <div className="bg-white rounded-2xl shadow-soft p-4 sm:p-6 mb-6">
        {/* Presets */}
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineCalendar className="w-4 h-4 text-ink-400 hidden sm:block" />
          <h2 className="text-sm font-semibold text-ink-700">Quick Select</h2>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.label, preset.getDates)}
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm rounded-xl border transition-all duration-200 disabled:opacity-50',
                activePreset === preset.label
                  ? 'bg-ink-950 text-white border-ink-950 shadow-soft'
                  : 'border-surface-300 text-ink-700 hover:bg-surface-100 hover:border-surface-400',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom range */}
        <div className="border-t border-surface-200 pt-5">
          <h2 className="text-sm font-semibold text-ink-700 mb-3">
            Custom Range
          </h2>
          <form
            onSubmit={handleCustomSubmit}
            className="flex flex-col sm:flex-row sm:items-end gap-3"
          >
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-ink-500 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full border border-surface-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                required
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-xs text-ink-500 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full border border-surface-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
                required
              />
            </div>
            <Button type="submit" disabled={loading || !startDate || !endDate}>
              Generate
            </Button>
          </form>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden p-6 mb-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <TableSkeleton rows={3} />
          </div>
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden p-6">
            <Skeleton className="h-5 w-48 mb-4" />
            <TableSkeleton rows={4} />
          </div>
        </div>
      )}

      {/* Empty state before generating */}
      {!report && !loading && !error && (
        <div className="bg-white rounded-2xl shadow-soft p-8 sm:p-16 text-center">
          <div className="mx-auto w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-4">
            <HiOutlineChartBar className="w-6 h-6 text-ink-400" />
          </div>
          <h3 className="text-base font-semibold text-ink-900 font-display mb-1">
            No report generated yet
          </h3>
          <p className="text-sm text-ink-500">
            Select a date range above to generate a sales report
          </p>
        </div>
      )}

      {/* Report preview */}
      {report && !loading && (
        <>
          {/* Date range badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-50 text-primary-800 px-3 py-1.5 rounded-full">
              <HiOutlineCalendar className="w-3.5 h-3.5" />
              {report.summary.startDate} &mdash; {report.summary.endDate}
            </span>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: 'Total Revenue',
                value: formatPrice(report.summary.totalRevenue),
                icon: HiOutlineCurrencyDollar,
                color: 'bg-green-50 text-green-600',
              },
              {
                label: 'Total Orders',
                value: report.summary.totalOrders.toString(),
                icon: HiOutlineClipboardList,
                color: 'bg-blue-50 text-blue-600',
              },
              {
                label: 'Avg Order Value',
                value: formatPrice(report.summary.avgOrderValue),
                icon: HiOutlineTrendingUp,
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((stat) => (
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
                    <p className="text-xl font-bold text-ink-950">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status + Top Products side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Orders by Status */}
            {report.ordersByStatus.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-surface-200">
                  <h2 className="text-base font-semibold text-ink-950 font-display">
                    Orders by Status
                  </h2>
                </div>
                {/* Mobile: card layout */}
                <div className="sm:hidden divide-y divide-surface-100">
                  {report.ordersByStatus.map((row) => (
                    <div
                      key={row.status}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}
                        >
                          {row.status}
                        </span>
                        <span className="text-sm text-ink-500">
                          {row.count} order{row.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-ink-900">
                        {formatPrice(row.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-surface-100">
                        <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.ordersByStatus.map((row) => (
                        <tr key={row.status} className="border-b border-surface-100 last:border-0">
                          <td className="px-6 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-ink-900 text-center">
                            {row.count}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-ink-900 text-right">
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
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-surface-200">
                  <h2 className="text-base font-semibold text-ink-950 font-display">
                    Top Selling Products
                  </h2>
                </div>
                {/* Mobile: card layout */}
                <div className="sm:hidden divide-y divide-surface-100">
                  {report.topSellingProducts.map((product, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-ink-900 truncate mr-3">
                          {product.name}
                        </span>
                        <span className="text-sm font-semibold text-ink-900 whitespace-nowrap">
                          {formatPrice(product.totalRevenue)}
                        </span>
                      </div>
                      <p className="text-xs text-ink-500">
                        {product.totalQuantity} unit{product.totalQuantity !== 1 ? 's' : ''} sold
                      </p>
                    </div>
                  ))}
                </div>
                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-surface-100">
                        <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="text-center px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Qty Sold
                        </th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.topSellingProducts.map((product, i) => (
                        <tr key={i} className="border-b border-surface-100 last:border-0">
                          <td className="px-6 py-3 text-sm text-ink-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-3 text-sm text-ink-900 text-center">
                            {product.totalQuantity}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-ink-900 text-right">
                            {formatPrice(product.totalRevenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Orders List */}
          {report.orders.length > 0 && (
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-surface-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink-950 font-display">
                  All Orders
                </h2>
                <span className="text-xs text-ink-500 bg-surface-100 px-2.5 py-1 rounded-full">
                  {report.orders.length} order{report.orders.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Mobile: card layout */}
              <div className="sm:hidden divide-y divide-surface-100">
                {report.orders.map((order) => (
                  <div key={order.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-ink-500">
                        {order.id.slice(0, 8)}...
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : 'N/A'}
                        </p>
                        <p className="text-xs text-ink-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-ink-950">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-surface-100">
                      <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-ink-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-surface-100 last:border-0 hover:bg-surface-50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm font-mono text-ink-600">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-sm text-ink-900">
                            {order.user
                              ? `${order.user.firstName} ${order.user.lastName}`
                              : 'N/A'}
                          </p>
                          {order.user && (
                            <p className="text-xs text-ink-500">
                              {order.user.email}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-3 text-sm text-ink-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-ink-950 text-right">
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
            <div className="bg-white rounded-2xl shadow-soft p-8 sm:p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center mb-4">
                <HiOutlineClipboardList className="w-6 h-6 text-ink-400" />
              </div>
              <h3 className="text-base font-semibold text-ink-900 font-display mb-1">
                No orders found
              </h3>
              <p className="text-sm text-ink-500">
                There are no orders in the selected date range
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
