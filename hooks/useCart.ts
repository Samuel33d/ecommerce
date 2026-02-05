'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Cart } from '@/types';

interface CartStore {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => void;
  itemCount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const cart = await api.get<Cart>('/cart');
      set({ cart, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId: string, quantity: number) => {
    const cart = await api.post<Cart>('/cart/items', { productId, quantity });
    set({ cart });
  },

  updateItem: async (itemId: string, quantity: number) => {
    const cart = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
    set({ cart });
  },

  removeItem: async (itemId: string) => {
    const cart = await api.delete<Cart>(`/cart/items/${itemId}`);
    set({ cart });
  },

  clearCart: () => {
    set({ cart: null });
  },

  itemCount: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
