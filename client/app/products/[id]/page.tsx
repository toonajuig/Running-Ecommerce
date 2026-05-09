'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductDetail, ProductVariant } from '@/types';
import Header from '@/components/Header';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const { data: product, isLoading, error } = useQuery<ProductDetail>({
    queryKey: ['products', id],
    queryFn: () => api.get<ProductDetail>(`/products/${id}`),
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-ink-muted">Loading…</p>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-red-400">Product not found.</p>
        </main>
      </>
    );
  }

  const effectivePrice = selectedVariant?.price_override ?? product.price;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-ink-muted transition hover:text-ink"
        >
          ← Back to all products
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">

          {/* Image */}
          <div className="flex items-center justify-center rounded-3xl bg-surface-deep h-96">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full rounded-3xl object-cover"
              />
            ) : (
              <span className="text-8xl font-semibold text-ink-faint">
                {product.brand_name?.[0] ?? product.name[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">

            {/* Brand + category */}
            <div className="mb-2 flex items-center gap-3">
              {product.brand_name && (
                <span className="text-xs uppercase tracking-widest text-ink-faint">
                  {product.brand_name}
                </span>
              )}
              <span className="text-xs uppercase tracking-widest text-ink-faint">
                {product.category_name}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                {product.description}
              </p>
            )}

            {/* Specs — shoes only */}
            {product.weight_grams && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface-deep p-4 text-center">
                  <p className="text-lg font-semibold text-ink">{product.weight_grams}g</p>
                  <p className="text-xs uppercase tracking-widest text-ink-faint">Weight</p>
                </div>
                <div className="rounded-2xl bg-surface-deep p-4 text-center">
                  <p className="text-lg font-semibold text-ink">{product.drop_mm}mm</p>
                  <p className="text-xs uppercase tracking-widest text-ink-faint">Drop</p>
                </div>
                <div className="rounded-2xl bg-surface-deep p-4 text-center">
                  <p className="text-lg font-semibold text-ink capitalize">{product.shoe_type}</p>
                  <p className="text-xs uppercase tracking-widest text-ink-faint">Type</p>
                </div>
              </div>
            )}

            {/* Size picker */}
            {product.variants.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm text-ink-muted">
                  {product.variants[0].size === 'one-size' ? 'Size' : 'Select size'}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const outOfStock = v.stock === 0;

                    return (
                      <button
                        key={v.id}
                        disabled={outOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={[
                          'rounded-lg border px-4 py-2 text-sm transition',
                          isSelected
                            ? 'border-ink bg-ink text-surface-card'
                            : 'border-white/10 text-ink-muted hover:border-white/30 hover:text-ink',
                          outOfStock ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price + CTA */}
            <div className="mt-auto pt-10">
              <p className="mb-4 text-3xl font-semibold text-ink">
                ฿{Number(effectivePrice).toLocaleString()}
              </p>
              <button
                disabled={product.variants.length > 1 && !selectedVariant}
                className="w-full rounded-full bg-ink py-3 text-sm font-medium text-surface-card transition hover:bg-ink-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.variants.length > 1 && !selectedVariant
                  ? 'Select a size'
                  : 'Add to cart'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
