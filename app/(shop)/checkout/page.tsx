'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingCountry: '',
    shippingZip: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, fetchCart, router]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        shippingAddress: user.address || prev.shippingAddress,
        shippingCity: user.city || prev.shippingCity,
        shippingCountry: user.country || prev.shippingCountry,
        shippingZip: user.zipCode || prev.shippingZip,
      }));
    }
  }, [user]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.shippingAddress) newErrors.shippingAddress = 'Address is required';
    if (!form.shippingCity) newErrors.shippingCity = 'City is required';
    if (!form.shippingCountry) newErrors.shippingCountry = 'Country is required';
    if (!form.shippingZip) newErrors.shippingZip = 'ZIP code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Create order
      const order = await api.post<Order>('/orders', form);

      // Create Stripe checkout session
      const session = await api.post<{ url: string }>('/payments/create-checkout-session', {
        orderId: order.id,
      });

      // Redirect to Stripe
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create order',
      );
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-4">Add some products before checkout.</p>
        <Button onClick={() => router.push('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Address"
                id="address"
                value={form.shippingAddress}
                onChange={(e) =>
                  setForm({ ...form, shippingAddress: e.target.value })
                }
                error={errors.shippingAddress}
                placeholder="123 Main Street"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  id="city"
                  value={form.shippingCity}
                  onChange={(e) =>
                    setForm({ ...form, shippingCity: e.target.value })
                  }
                  error={errors.shippingCity}
                  placeholder="New York"
                />
                <Input
                  label="Country"
                  id="country"
                  value={form.shippingCountry}
                  onChange={(e) =>
                    setForm({ ...form, shippingCountry: e.target.value })
                  }
                  error={errors.shippingCountry}
                  placeholder="US"
                />
              </div>
              <Input
                label="ZIP Code"
                id="zip"
                value={form.shippingZip}
                onChange={(e) =>
                  setForm({ ...form, shippingZip: e.target.value })
                }
                error={errors.shippingZip}
                placeholder="10001"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Special delivery instructions..."
                />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Pay with Stripe - {formatPrice(cart.total)}
          </Button>
        </form>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product.name} x{item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold">
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
