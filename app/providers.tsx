'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { initialize, user } = useAuth();
  const { fetchCart } = useCart();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthInitializer>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#2563eb',
              secondary: '#f8fafc',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#f8fafc',
            },
          },
        }}
      />
    </AuthInitializer>
  );
}
