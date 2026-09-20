"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import type { CartItem, Product } from "@/types";
import { effectivePrice } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "atelier-cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, opts: { size: string; color: string; quantity: number }) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const mergeUserRef = useRef<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (authLoading || !user || !hydrated || items.length === 0) return;
    if (mergeUserRef.current === user.id) return;
    mergeUserRef.current = user.id;

    let cancelled = false;
    api("/cart/merge", {
      method: "POST",
      body: JSON.stringify({
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      }),
    })
      .then(() => {
        if (!cancelled) setItems([]);
      })
      .catch(() => {
        // Keep the local cart when synchronization fails so it is not lost.
        mergeUserRef.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, hydrated, items]);

  const addItem = useCallback(
    (product: Product, opts: { size: string; color: string; quantity: number }) => {
      const price = effectivePrice(product);
      setItems((prev) => {
        const existing = prev.findIndex(
          (i) =>
            i.productId === product._id &&
            i.size === opts.size &&
            i.color === opts.color
        );
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = {
            ...next[existing],
            quantity: Math.min(
              product.stock,
              next[existing].quantity + opts.quantity
            ),
          };
          return next;
        }
        return [
          ...prev,
          {
            productId: product._id,
            slug: product.slug,
            name: product.name,
            image: product.images[0] || "",
            price,
            originalPrice: product.discountPrice ? product.price : undefined,
            size: opts.size,
            color: opts.color,
            quantity: Math.min(product.stock, opts.quantity),
            stock: product.stock,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item
      )
    );
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, count, subtotal, addItem, updateQuantity, removeItem, clearCart };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}