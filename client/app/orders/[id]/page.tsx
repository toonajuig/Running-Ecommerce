'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Header from '@/components/Header';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/types';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending:   'Pending payment',
  paid:      'Paid',
  shipped:   'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<Order['status'], string> = {
  pending:   'text-amber-400',
  paid:      'text-emerald-400',
  shipped:   'text-sky-400',
  delivered: 'text-ink-muted',
  cancelled: 'text-red-400',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isPaying, setIsPaying] = useState(false);

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: () => api.get<Order>(`/orders/${id}`, { token: token! }),
    enabled: !!token,
  });

  const handleMarkPaid = async () => {
    setIsPaying(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: 'paid' }, { token: token! });
      // invalidate cache เพื่อให้ TanStack Query ดึงข้อมูลใหม่ทันที
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-ink-muted">Loading order…</p>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-red-400">Order not found.</p>
        </main>
      </>
    );
  }

  return (
    <RequireAuth>
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link href="/orders" className="mb-8 inline-block text-sm text-ink-muted transition hover:text-ink">
          ← All orders
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Order #{order.id}</h1>
            <p className="mt-1 text-sm text-ink-faint">
              {new Date(order.created_at).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <span className={`text-sm font-medium ${STATUS_COLOR[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>

        {/* Items */}
        {order.items && (
          <ul className="mb-6 divide-y divide-white/5 rounded-3xl bg-surface-card p-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{item.product_name}</p>
                  <p className="text-xs text-ink-muted">Size: {item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm text-ink">฿{(Number(item.price) * item.quantity).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Total */}
        <div className="mb-8 flex items-center justify-between rounded-2xl bg-surface-deep px-6 py-4">
          <span className="text-sm text-ink-muted">Total</span>
          <span className="text-lg font-semibold text-ink">฿{Number(order.total).toLocaleString()}</span>
        </div>

        {/* Mock payment — แสดงเฉพาะเมื่อ status = pending */}
        {order.status === 'pending' && (
          <button
            onClick={handleMarkPaid}
            disabled={isPaying}
            className="mb-4 w-full rounded-full bg-emerald-600 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPaying ? 'Processing…' : 'Simulate payment (Mark as paid)'}
          </button>
        )}

        <Link
          href="/"
          className="block w-full rounded-full border border-white/10 py-3 text-center text-sm font-medium text-ink-muted transition hover:border-white/30 hover:text-ink"
        >
          Continue shopping
        </Link>

      </main>
    </RequireAuth>
  );
}
