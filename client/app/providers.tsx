'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { createQueryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
