'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (user?.role !== 'admin') router.push('/');
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== 'admin') return null;

  return <>{children}</>;
}
