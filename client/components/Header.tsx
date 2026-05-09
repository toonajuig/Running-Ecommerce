'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <Link href="/" className="font-semibold text-ink">RunStore</Link>

        <nav className="hidden gap-6 text-sm sm:flex">
          <Link href="/" className="text-ink-muted transition hover:text-ink">Shop</Link>
          <Link href="/" className="text-ink-muted transition hover:text-ink">Brands</Link>
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="hidden text-sm text-ink-muted sm:block">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-5 py-2 text-sm font-medium text-ink-muted transition hover:border-white/30 hover:text-ink"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-surface-card transition hover:bg-ink-muted"
            >
              Sign in
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
