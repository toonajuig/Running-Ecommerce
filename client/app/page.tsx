'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Product } from '@/types';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
  });

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Page heading */}
        <div className="mb-10">
          <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">Collection</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            All Products
          </h1>
        </div>

        {/* States */}
        {isLoading && (
          <p className="text-ink-muted">Loading…</p>
        )}
        {error && (
          <p className="text-red-400">Failed to load products.</p>
        )}

        {/* Product grid */}
        {products && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </main>
    </>
  );
}
