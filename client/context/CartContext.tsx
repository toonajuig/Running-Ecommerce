'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // mounted flag — localStorage ไม่มีตอน SSR, useEffect รันหลัง hydration เท่านั้น
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  // อ่าน cart จาก localStorage หลัง mount (ครั้งเดียว)
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem('cart');
      }
    }
    setMounted(true);
  }, []);

  // sync ทุกครั้งที่ items เปลี่ยน (แต่ข้าม write ก่อน mount เพื่อไม่ล้าง cart)
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items, mounted]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === newItem.variantId);
      if (existing) {
        // variant นี้มีในตะกร้าแล้ว — บวก quantity
        return prev.map((i) =>
          i.variantId === newItem.variantId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (variantId: number) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: number, qty: number) => {
    if (qty <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
