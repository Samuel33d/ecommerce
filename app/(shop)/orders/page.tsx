'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Order, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlineClipboardList } from 'react-icons/hi';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const success = searchParams.get('success');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (success === 'true') {
      toast.success('Payment successful! Your order has been placed.');
    }
  }, [success]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated()) return;
    api
      .get<PaginatedResponse<Order>>('/orders?limit=50')
      .then((data) => {
        setOrders(data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [authLoading, isAuthenticated]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<HiOutlineClipboardList className="w-16 h-16" />}
          title="No orders yet"
          description="Once you place an order, it will appear here"
          action={
            <Link
              href="/"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-gray-50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="text-sm font-mono font-medium">
                      {order.id.slice(0, 12)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-bold">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
                <span
                  className={`mt-2 sm:mt-0 inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                    order.status,
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.product?.name || 'Product'} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                  <span className="text-gray-500">
                    Ship to: {order.shippingAddress}, {order.shippingCity},{' '}
                    {order.shippingCountry} {order.shippingZip}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersContent />
    </Suspense>
  );
}
