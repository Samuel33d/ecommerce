'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const count = itemCount();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-950 text-surface-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm font-display">S</span>
            </div>
            <span className="text-lg font-display font-bold text-white tracking-tight">
              Store
            </span>
          </Link>

          {/* Search bar - desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-surface-900 border border-surface-800 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60 transition-all"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 text-surface-300 hover:text-white rounded-xl hover:bg-surface-800 transition-colors"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-surface-950">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-surface-300 hover:text-white rounded-xl hover:bg-surface-800 transition-colors"
                >
                  <div className="w-6 h-6 bg-primary-700 rounded-lg flex items-center justify-center text-[10px] font-bold text-primary-100">
                    {user.firstName[0]}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {user.firstName}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-dramatic border border-surface-200 py-1 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-surface-100">
                      <p className="text-sm font-semibold text-ink-950">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-ink-500">{user.email}</p>
                    </div>
                    <Link
                      href="/orders"
                      className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {isAdmin() && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-surface-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-surface-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          router.push('/');
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-950 bg-white rounded-xl hover:bg-surface-100 transition-all shadow-soft"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2.5 text-surface-300 hover:text-white rounded-xl hover:bg-surface-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <HiOutlineX className="w-5 h-5" />
              ) : (
                <HiOutlineMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-surface-800 py-4 space-y-3 animate-slide-up">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-surface-900 border border-surface-800 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
            </form>
            <nav className="space-y-1">
              <Link
                href="/"
                className="block px-3 py-2.5 text-sm text-surface-200 hover:bg-surface-800 rounded-xl transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/cart"
                className="block px-3 py-2.5 text-sm text-surface-200 hover:bg-surface-800 rounded-xl transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Cart ({count})
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className="block px-3 py-2.5 text-sm text-surface-200 hover:bg-surface-800 rounded-xl transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
