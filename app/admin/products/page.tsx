'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/Skeleton';
import type { Product, Category, PaginatedResponse } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  images: string;
  stock: string;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  images: '',
  stock: '',
  isActive: true,
  isFeatured: false,
  categoryId: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.set('search', search);

      const data = await api.get<PaginatedResponse<Product>>(
        `/products/admin?${params.toString()}`,
      );
      setProducts(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      images: product.images.join(', '),
      stock: product.stock.toString(),
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      categoryId: product.categoryId,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Name, price, and category are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        images: form.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        stock: parseInt(form.stock) || 0,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        categoryId: form.categoryId,
      };

      if (editing) {
        await api.patch(`/products/${editing.id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchProducts(meta.page);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save product',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts(meta.page);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete product',
      );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold font-display text-ink-900">Products</h1>
        <Button onClick={openCreate}>
          <HiOutlinePlus className="w-4 h-4 mr-1" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-ink-500 uppercase">
                    Stock
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
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-surface-200 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">
                            {product.name}
                          </p>
                          {product.isFeatured && (
                            <span className="text-xs text-primary-600">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {product.category?.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {product.stock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-surface-100 text-ink-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-ink-400 hover:text-primary-700 rounded"
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-ink-400 hover:text-red-600 rounded"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-ink-500"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-surface-200">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => fetchProducts(p)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'New Product'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            id="productName"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              id="productPrice"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Compare Price"
              id="productComparePrice"
              type="number"
              step="0.01"
              value={form.comparePrice}
              onChange={(e) =>
                setForm({ ...form, comparePrice: e.target.value })
              }
            />
          </div>
          <Input
            label="Stock"
            id="productStock"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
              className="w-full rounded-xl border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Image URLs (comma separated)"
            id="productImages"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="rounded-md border-surface-300 text-ink-900"
              />
              <span className="text-sm text-ink-700">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
                className="rounded-md border-surface-300 text-ink-900"
              />
              <span className="text-sm text-ink-700">Featured</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
