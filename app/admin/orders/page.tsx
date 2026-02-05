'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { Order, OrderStatus, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';

const statuses: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (filterStatus) params.set('status', filterStatus);

      const data = await api.get<PaginatedResponse<Order>>(
        `/orders/admin?${params.toString()}`,
      );
      setOrders(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchOrders(meta.page);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update status',
      );
    }
  };

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-ink-900 mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
            !filterStatus
              ? 'bg-ink-950 text-white'
              : 'bg-surface-100 text-ink-600 hover:bg-surface-200'
          }`}
        >
          All
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
              filterStatus === status
                ? 'bg-ink-950 text-white'
                : 'bg-surface-100 text-ink-600 hover:bg-surface-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Items
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-surface-200 last:border-0">
                    <td className="px-4 py-3 text-sm font-mono text-ink-500">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-ink-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-xs text-ink-500">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(order.id, e.target.value as OrderStatus)
                        }
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(order)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-ink-500"
                    >
                      No orders found
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
                  onClick={() => fetchOrders(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    p === meta.page
                      ? 'bg-ink-950 text-white'
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

      {/* Order detail modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Order ${selectedOrder?.id.slice(0, 8)}...`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-ink-500">Customer</p>
                <p className="font-medium text-ink-900">
                  {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                </p>
                <p className="text-ink-500">{selectedOrder.user?.email}</p>
              </div>
              <div>
                <p className="text-ink-500">Shipping</p>
                <p className="font-medium text-ink-900">{selectedOrder.shippingAddress}</p>
                <p className="text-ink-500">
                  {selectedOrder.shippingCity}, {selectedOrder.shippingCountry}{' '}
                  {selectedOrder.shippingZip}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-ink-500 mb-2">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm bg-surface-50 px-3 py-2 rounded"
                  >
                    <span className="text-ink-700">
                      {item.product?.name || 'Product'} x {item.quantity}
                    </span>
                    <span className="font-medium text-ink-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-surface-200">
              <span className="font-semibold text-ink-900">Total</span>
              <span className="text-lg font-bold text-ink-900">
                {formatPrice(selectedOrder.total)}
              </span>
            </div>

            {selectedOrder.notes && (
              <div>
                <p className="text-sm text-ink-500">Notes</p>
                <p className="text-sm text-ink-700">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
