'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { api } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import type { Product, Category, PaginatedResponse } from '@/types';
import { HiOutlineSearch } from 'react-icons/hi';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const featured = searchParams.get('featured') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (categoryId) params.set('categoryId', categoryId);
      if (sort) params.set('sort', sort);
      if (order) params.set('order', order);
      if (featured) params.set('featured', 'true');

      const data = await api.get<PaginatedResponse<Product>>(
        `/products?${params.toString()}`,
      );
      setProducts(data.data);
      setMeta(data.meta);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, sort, order, page, featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api
      .get<Category[]>('/categories')
      .then(setCategories)
      .catch(() => {});
  }, []);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section - Full Width */}
      {!search && !categoryId && page === 1 && (
        <section className="relative min-h-[600px] overflow-hidden flex items-center">
          {/* Background image */}
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            alt="Store hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 hero-gradient" />
          {/* Animated blobs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-blob-reverse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-violet-500/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
          {/* Content */}
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={childVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-white/90 mb-6">
                Free Shipping on Orders $50+
              </span>
            </motion.div>
            <motion.div variants={childVariants}>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Discover Premium<br />Products
              </h1>
            </motion.div>
            <motion.div variants={childVariants}>
              <p className="text-surface-300 text-lg mb-8 max-w-xl">
                Curated selection of premium products at unbeatable prices. Quality you can trust, style you&apos;ll love.
              </p>
            </motion.div>
            <motion.div variants={childVariants} className="flex gap-4">
              <button
                onClick={() => updateParams('featured', 'true')}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:shadow-glow transition-all duration-300"
              >
                Shop Featured
              </button>
              <button
                onClick={() => {
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 glass text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Browse All
              </button>
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* Product Grid - Inside Container */}
      <div id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={categoryId}
            onChange={(e) => updateParams('category', e.target.value)}
            className="px-3 py-2 text-sm border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-ink-700"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={`${sort}-${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split('-');
              const params = new URLSearchParams(searchParams.toString());
              params.set('sort', s);
              params.set('order', o);
              params.delete('page');
              router.push(`/?${params.toString()}`);
            }}
            className="px-3 py-2 text-sm border border-surface-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-ink-700"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>

          {(search || categoryId || featured) && (
            <button
              onClick={() => router.push('/')}
              className="px-3 py-2 text-sm text-ink-600 hover:text-ink-900 border border-surface-300 rounded-xl hover:bg-surface-50"
            >
              Clear Filters
            </button>
          )}

          <div className="sm:ml-auto text-sm text-ink-500 self-center">
            {meta.total} product{meta.total !== 1 ? 's' : ''} found
          </div>
        </div>

        {search && (
          <div className="flex items-center gap-2 mb-4 text-ink-600">
            <HiOutlineSearch className="w-4 h-4" />
            <span className="text-sm">
              Results for &quot;<strong>{search}</strong>&quot;
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description="Try adjusting your search or filter criteria"
            action={
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                View all products
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {meta.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => updateParams('page', p.toString())}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        p === meta.page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-surface-300 text-ink-700 hover:bg-surface-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
