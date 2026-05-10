'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthButtons() {
  const { isLoggedIn, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-surface-card transition hover:bg-ink-muted"
      >
        Sign in
      </Link>
    );
  }

  return (
    <>
      <Link href="/orders" className="hidden text-sm text-ink transition hover:text-ink sm:block">
        Orders
      </Link>
      {user?.role === 'admin' && (
        <Link href="/admin" className="hidden text-sm text-ink transition hover:text-ink sm:block">
          Admin
        </Link>
      )}
      <span className="hidden text-sm text-ink sm:block">{user?.name}</span>
      <button
        onClick={handleLogout}
        className="rounded-full border border-white/25 px-5 py-2 text-sm font-medium text-ink transition hover:border-white/50"
      >
        Logout
      </button>
    </>
  );
}
