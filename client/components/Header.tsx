'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCart } from '@/context/CartContext';

// ssr: false → ไม่ render บน server เลย ป้องกัน hydration mismatch
// เพราะ auth state อ่านจาก localStorage ซึ่งไม่มีบน server
const AuthButtons = dynamic(() => import('./AuthButtons'), { ssr: false });

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <Link href="/" className="font-semibold text-ink">RunStore</Link>

        <nav className="hidden gap-6 text-sm sm:flex">
          <Link href="/" className="text-ink transition hover:text-ink">Shop</Link>
          <Link href="/" className="text-ink transition hover:text-ink">Brands</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 text-ink transition hover:text-ink">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-surface-card">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
          <AuthButtons />
        </div>

      </div>
    </header>
  );
}
