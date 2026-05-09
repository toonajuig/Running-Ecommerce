'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Products</h1>
      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-600">Failed to load products.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
