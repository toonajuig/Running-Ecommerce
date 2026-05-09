'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import RequireAuth from '@/components/RequireAuth';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Order } from '@/types';

interface LiveVariant {
  id: number;
  stock: number;
  price: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { token } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ดึงราคา + stock ปัจจุบันจาก server ทุกครั้งที่เปิด cart
  const variantIds = items.map((i) => i.variantId).join(',');
  const { data: liveVariants } = useQuery<LiveVariant[]>({
    queryKey: ['variants', variantIds],
    queryFn: () => api.get<LiveVariant[]>(`/products/variants?ids=${variantIds}`),
    enabled: items.length > 0,
    staleTime: 0, // บังคับ fetch ใหม่ทุกครั้ง ไม่ใช้ cache เพราะต้องการข้อมูล real-time
  });

  // สร้าง map id → liveVariant เพื่อ lookup O(1)
  const liveMap = new Map(liveVariants?.map((v) => [v.id, v]) ?? []);

  // คำนวณ totalPrice จากราคาสด (ถ้าโหลดเสร็จแล้ว) ไม่งั้นใช้ snapshot
  const liveTotalPrice = items.reduce((sum, item) => {
    const live = liveMap.get(item.variantId);
    const price = live ? Number(live.price) : item.price;
    return sum + price * item.quantity;
  }, 0);

  const hasOutOfStock = items.some((item) => {
    const live = liveMap.get(item.variantId);
    return live && live.stock < item.quantity;
  });

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const order = await api.post<Order>(
        '/orders',
        { items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) },
        { token: token! }
      );
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireAuth>
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="mb-1 text-xs uppercase tracking-widest text-ink-faint">Your</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <p className="mb-6 text-ink-muted">Your cart is empty.</p>
            <Link
              href="/"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-surface-card transition hover:bg-ink-muted"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">

            {/* Item list */}
            <ul className="divide-y divide-white/5">
              {items.map((item) => {
                const live = liveMap.get(item.variantId);
                const currentPrice = live ? Number(live.price) : item.price;
                const priceChanged = live && Number(live.price) !== item.price;
                const outOfStock = live && live.stock < item.quantity;

                return (
                  <li key={item.variantId} className="flex gap-4 py-6">

                    {/* Thumbnail */}
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-surface-deep">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-2xl object-cover" />
                      ) : (
                        <span className="text-2xl font-semibold text-ink-faint">{item.name[0]}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-medium text-ink">{item.name}</p>
                      <p className="text-sm text-ink-muted">Size: {item.size}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-ink-muted">฿{currentPrice.toLocaleString()}</p>
                        {priceChanged && (
                          <span className="text-xs text-amber-400">
                            (was ฿{item.price.toLocaleString()})
                          </span>
                        )}
                      </div>
                      {outOfStock && (
                        <p className="text-xs text-red-400">
                          Only {live!.stock} left — reduce quantity
                        </p>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-ink-faint transition hover:text-ink-muted"
                      >
                        Remove
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-muted transition hover:border-white/30 hover:text-ink"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-muted transition hover:border-white/30 hover:text-ink"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </li>
                );
              })}
            </ul>

            {/* Summary + checkout */}
            <div className="rounded-3xl bg-surface-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-ink-muted">Total</span>
                <span className="text-xl font-semibold text-ink">฿{liveTotalPrice.toLocaleString()}</span>
              </div>

              {hasOutOfStock && (
                <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  Some items exceed available stock. Please adjust quantities before checking out.
                </p>
              )}

              {checkoutError && (
                <p className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {checkoutError}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={isSubmitting || hasOutOfStock}
                className="w-full rounded-full bg-ink py-3 text-sm font-medium text-surface-card transition hover:bg-ink-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? 'Placing order…' : 'Checkout'}
              </button>
            </div>

          </div>
        )}

      </main>
    </RequireAuth>
  );
}
