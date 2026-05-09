'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import RequireAdmin from '@/components/RequireAdmin';

const NAV = [
  { href: '/admin/orders',   label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAdmin>
      <div className="min-h-screen">
        {/* Admin top bar */}
        <header className="border-b border-white/5 bg-surface-card">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-ink">RunStore</Link>
              <span className="text-xs uppercase tracking-widest text-ink-faint">Admin</span>
            </div>
            <nav className="flex gap-4">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm transition ${
                    pathname.startsWith(href)
                      ? 'text-ink'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </RequireAdmin>
  );
}
