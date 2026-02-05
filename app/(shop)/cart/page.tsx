'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingCart,
  HiMinus,
  HiPlus,
  HiOutlineTrash,
} from 'react-icons/hi';

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, fetchCart, updateItem, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, fetchCart, router]);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(itemId);
    try {
      await updateItem(itemId, quantity);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update quantity',
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to remove item',
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
        <EmptyState
          icon={<HiOutlineShoppingCart className="w-16 h-16" />}
          title="Your cart is empty"
          description="Add some products to your cart to get started"
          action={
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shopping Cart ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={
                    item.product.images[0] ||
                    'https://placehold.co/600x400?text=No+Image'
                  }
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.product.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-primary-600 line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.product.category?.name}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {formatPrice(item.product.price)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                      disabled={updating === item.id || item.quantity <= 1}
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      <HiMinus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={
                        updating === item.id ||
                        item.quantity >= item.product.stock
                      }
                      className="p-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    >
                      <HiPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={updating === item.id}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatPrice(cart.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-base font-bold">
                  {formatPrice(cart.total)}
                </span>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </Button>
            <Link href="/">
              <p className="text-center text-sm text-primary-600 hover:text-primary-700 mt-3">
                Continue Shopping
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
