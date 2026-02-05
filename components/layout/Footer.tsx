import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-400 noise-overlay">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">S</span>
              </div>
              <span className="text-lg font-display font-bold text-white tracking-tight">
                Store
              </span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed">
              Curated premium products, carefully selected for quality and style.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-widest mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm hover:text-white transition-colors duration-200">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/?featured=true" className="text-sm hover:text-white transition-colors duration-200">
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-widest mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/login" className="text-sm hover:text-white transition-colors duration-200">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm hover:text-white transition-colors duration-200">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm hover:text-white transition-colors duration-200">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-surface-300 uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-sm">sbenedetti89@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-800/60 text-center">
          <p className="text-xs text-surface-600 tracking-wide">
            &copy; {new Date().getFullYear()} Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
