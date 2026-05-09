'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/types';

const STATUS_LABEL: Record<Order['status'], string> = {
  pending:   'Pending',
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

export default function OrdersPage() {
  const { token } = useAuth();

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get<Order[]>('/orders', { token: token! }),
    enabled: !!token,
  });

  return (
    <RequireAuth>
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">Your</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Orders</h1>
        </div>

        {isLoading && <p className="text-ink-muted">Loading…</p>}
        {error && <p className="text-red-400">Failed to load orders.</p>}

        {orders && orders.length === 0 && (
          <div className="py-24 text-center">
            <p className="mb-6 text-ink-muted">No orders yet.</p>
            <Link
              href="/"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-surface-card transition hover:bg-ink-muted"
            >
              Start shopping
            </Link>
          </div>
        )}

        {orders && orders.length > 0 && (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-2xl bg-surface-card px-6 py-5 transition hover:bg-surface-deep"
                >
                  <div>
                    <p className="font-medium text-ink">Order #{order.id}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {new Date(order.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink">
                      ฿{Number(order.total).toLocaleString()}
                    </p>
                    <p className={`mt-0.5 text-xs ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status]}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

      </main>
    </RequireAuth>
  );
}
