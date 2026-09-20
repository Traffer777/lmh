"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartCustom = { name?: string; number?: string };

export type CartItem = {
  productId: number;
  slug: string;
  title: string;
  price: number;
  size: string;
  qty: number;
  image?: string;
  maxStock: number;
  // Персональное нанесение (форма со своим именем/номером на спине).
  custom?: CartCustom;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: number, size: string, custom?: CartCustom) => void;
  setQty: (productId: number, size: string, qty: number, custom?: CartCustom) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
};

const customTag = (c?: CartCustom) =>
  c && (c.name || c.number) ? `${(c.name ?? "").trim()}|${(c.number ?? "").trim()}` : "";
const keyOf = (id: number, size: string, custom?: CartCustom) =>
  `${id}::${size}::${customTag(custom)}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((state) => {
          const k = keyOf(item.productId, item.size, item.custom);
          const existing = state.items.find((i) => keyOf(i.productId, i.size, i.custom) === k);
          if (existing) {
            const next = Math.min(existing.qty + qty, item.maxStock);
            return {
              items: state.items.map((i) =>
                keyOf(i.productId, i.size, i.custom) === k
                  ? { ...i, qty: next, maxStock: item.maxStock, price: item.price }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, qty: Math.min(qty, item.maxStock) }] };
        }),
      remove: (productId, size, custom) =>
        set((state) => ({
          items: state.items.filter(
            (i) => keyOf(i.productId, i.size, i.custom) !== keyOf(productId, size, custom),
          ),
        })),
      setQty: (productId, size, qty, custom) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              keyOf(i.productId, i.size, i.custom) === keyOf(productId, size, custom)
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
