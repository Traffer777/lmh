"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  slug: string;
  title: string;
  price: number;
  size: string;
  qty: number;
  image?: string;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: number, size: string) => void;
  setQty: (productId: number, size: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
};

const keyOf = (id: number, size: string) => `${id}::${size}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => keyOf(i.productId, i.size) === keyOf(item.productId, item.size),
          );
          if (existing) {
            const next = Math.min(existing.qty + qty, item.maxStock);
            return {
              items: state.items.map((i) =>
                keyOf(i.productId, i.size) === keyOf(item.productId, item.size)
                  ? { ...i, qty: next, maxStock: item.maxStock, price: item.price }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: Math.min(qty, item.maxStock) }] };
        }),
      remove: (productId, size) =>
        set((state) => ({
          items: state.items.filter((i) => keyOf(i.productId, i.size) !== keyOf(productId, size)),
        })),
      setQty: (productId, size, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              keyOf(i.productId, i.size) === keyOf(productId, size)
                ? { ...i, qty: Math.max(0, Math.min(qty, i.maxStock)) }
                : i,
            )
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      total: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    { name: "lmh-cart" },
  ),
);
