'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductsResponse, Category, Brand } from '@/types';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // อ่าน filter ปัจจุบันจาก URL — เป็น source of truth เสมอ
  const filters = {
    category: searchParams.get('category') ?? '',
    brand:    searchParams.get('brand')    ?? '',
    gender:   searchParams.get('gender')   ?? '',
    sort:     searchParams.get('sort')     ?? 'newest',
    q:        searchParams.get('q')        ?? '',
  };
  const page = Number(searchParams.get('page') ?? '1');

  // สร้าง query string จาก filters + page เพื่อส่ง API
  const buildQuery = (f: typeof filters, p: number) => {
    const params = new URLSearchParams();
    if (f.category) params.set('category', f.category);
    if (f.brand)    params.set('brand',    f.brand);
    if (f.gender)   params.set('gender',   f.gender);
    if (f.sort && f.sort !== 'newest') params.set('sort', f.sort);
    if (f.q)        params.set('q',        f.q);
    if (p > 1)      params.set('page',     String(p));
    return params.toString();
  };

  // queryKey รวม filters + page → TanStack Query refetch อัตโนมัติเมื่อ URL เปลี่ยน
  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['products', filters, page],
    queryFn:  () => {
      const qs = buildQuery(filters, page);
      return api.get<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn:  () => api.get<Category[]>('/categories'),
    staleTime: Infinity, // categories แทบไม่เปลี่ยน — cache ตลอด session
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn:  () => api.get<Brand[]>('/brands'),
    staleTime: Infinity,
  });

  // เขียน filter ใหม่ลง URL — reset page กลับ 1 เสมอเมื่อ filter เปลี่ยน
  const handleFilterChange = useCallback((key: keyof typeof filters, value: string) => {
    const next = { ...filters, [key]: value };
    const qs = buildQuery(next, 1);
    router.push(`/?${qs}`);
  }, [filters, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => router.push('/');

  const handlePageChange = (p: number) => {
    const qs = buildQuery(filters, p);
    router.push(`/?${qs}`);
  };

  return (
    <>
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-10">

          {/* Sidebar filters — desktop */}
          <div className="hidden w-52 flex-shrink-0 lg:block">
            <Filters
              values={filters}
              categories={categories}
              brands={brands}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Main content */}
          <main className="flex-1">

            {/* Heading + result count */}
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">Collection</p>
                <h1 className="text-3xl font-semibold tracking-tight text-ink">
                  {filters.category
                    ? (categories.find(c => c.slug === filters.category)?.name ?? 'Products')
                    : 'All Products'}
                </h1>
              </div>
              {data && (
                <p className="text-sm text-ink-faint">
                  {data.total} {data.total === 1 ? 'item' : 'items'}
                </p>
              )}
            </div>

            {isLoading && <p className="text-ink-muted">Loading…</p>}
            {error   && <p className="text-red-400">Failed to load products.</p>}

            {data?.items.length === 0 && !isLoading && (
              <p className="py-24 text-center text-ink-muted">No products match your filters.</p>
            )}

            {data && data.items.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                <div className="mt-12">
                  <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onChange={handlePageChange}
                  />
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
