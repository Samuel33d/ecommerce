'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to add to cart',
      );
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <Image
            src={product.images[0] || 'https://placehold.co/600x400?text=No+Image'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-3 right-3 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-md">
              Featured
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="ml-2 text-sm text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <HiOutlineShoppingCart className="w-4 h-4" />
                Add
              </button>
            ) : (
              <span className="text-sm text-red-500 font-medium">
                Out of stock
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
