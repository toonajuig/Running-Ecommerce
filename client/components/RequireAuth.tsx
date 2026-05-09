'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  // render nothing ขณะ redirect เพื่อไม่ให้ flash เนื้อหา protected ก่อน redirect เสร็จ
  if (!isLoggedIn) return null;

  return <>{children}</>;
}
