'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/types';

interface AdminOrder extends Order {
  user_name: string;
  user_email: string;
}

const STATUSES: Order['status'][] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLOR: Record<Order['status'], string> = {
  pending:   'text-amber-400',
  paid:      'text-emerald-400',
  shipped:   'text-sky-400',
  delivered: 'text-ink-muted',
  cancelled: 'text-red-400',
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<AdminOrder[]>({
    queryKey: ['admin', 'orders'],
    queryFn:  () => api.get<AdminOrder[]>('/admin/orders', { token: token! }),
    enabled:  !!token,
  });

  const handleStatusChange = async (orderId: number, status: Order['status']) => {
    await api.patch(`/admin/orders/${orderId}/status`, { status }, { token: token! });
    queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
  };

  if (isLoading) return <p className="text-ink-muted">Loading…</p>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold text-ink">Orders</h1>

      <div className="overflow-x-auto rounded-2xl bg-surface-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs uppercase tracking-widest text-ink-faint">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-surface-deep transition">
                <td className="px-6 py-4 text-ink-muted">#{order.id}</td>
                <td className="px-6 py-4">
                  <p className="text-ink">{order.user_name}</p>
                  <p className="text-xs text-ink-faint">{order.user_email}</p>
                </td>
                <td className="px-6 py-4 text-ink-muted">
                  {new Date(order.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-ink">
                  ฿{Number(order.total).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                    className={`rounded-lg border border-white/10 bg-surface-deep px-2 py-1 text-xs outline-none ${STATUS_COLOR[order.status]}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
