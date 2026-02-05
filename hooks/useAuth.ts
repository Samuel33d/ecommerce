'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User, AuthResponse } from '@/types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialize: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  initialize: () => {
    if (typeof window === 'undefined') {
      set({ loading: false });
      return;
    }
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        set({ user: JSON.parse(stored), loading: false });
      } catch {
        set({ loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    const data = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user });
  },

  register: async (registerData) => {
    const data = await api.post<AuthResponse>('/auth/register', registerData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    set({ user: data.user });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null });
  },

  isAdmin: () => get().user?.role === 'ADMIN',
  isAuthenticated: () => !!get().user,
}));
