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

type ServerCartItem = {
  product: {
    _id: string;
    slug: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    stock: number;
  } | string;
  quantity: number;
  size: string;
  color: string;
};

function fromServerCart(cart: { items: ServerCartItem[] }): CartItem[] {
  return cart.items.flatMap((item) => {
    if (typeof item.product === "string") return [];
    const product = item.product;
    const price = effectivePrice(product);
    return [{
      productId: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] || "",
      price,
      originalPrice: product.discountPrice && product.discountPrice < product.price
        ? product.price
        : undefined,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      stock: product.stock,
    }];
  });
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
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
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const initialAuthResolvedRef = useRef(false);
  const mergeUserRef = useRef<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // This is the one-time browser-storage hydration step.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated, user]);

  useEffect(() => {
    if (authLoading || !hydrated) return;

    const isInitialAuthResolution = !initialAuthResolvedRef.current;
    initialAuthResolvedRef.current = true;

    if (!user) {
      mergeUserRef.current = null;
      return;
    }
    if (mergeUserRef.current === user.id) return;

    const shouldMergeGuestCart = !isInitialAuthResolution && items.length > 0;
    mergeUserRef.current = user.id;

    let cancelled = false;
    const request = shouldMergeGuestCart
      ? api<{ cart: { items: ServerCartItem[] } }>("/cart/merge", {
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
      : api<{ cart: { items: ServerCartItem[] } }>("/cart");

    request
      .then(({ cart }) => {
        if (!cancelled) {
          setItems(fromServerCart(cart));
          setLoadedUserId(user.id);
        }
      })
      .catch(() => {
        // Keep the local cart when synchronization fails so it is not lost.
        mergeUserRef.current = null;
        setLoadedUserId(user.id);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, hydrated, user, items]);

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
      if (user) {
        api<{ cart: { items: ServerCartItem[] } }>("/cart/add", {
          method: "POST",
          body: JSON.stringify({
            product: product._id,
            quantity: opts.quantity,
            size: opts.size,
            color: opts.color,
          }),
        })
          .then(({ cart }) => setItems(fromServerCart(cart)))
          .catch((error) => console.error("Could not save cart item:", error));
      }
    },
    [user]
  );

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item
      )
    );
    if (user) {
      api<{ cart: { items: ServerCartItem[] } }>("/cart/update", {
        method: "PUT",
        body: JSON.stringify({ index, quantity }),
      })
        .then(({ cart }) => setItems(fromServerCart(cart)))
        .catch((error) => console.error("Could not update cart quantity:", error));
    }
  }, [user]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (user) {
      api<{ cart: { items: ServerCartItem[] } }>("/cart/remove", {
        method: "DELETE",
        body: JSON.stringify({ index }),
      })
        .then(({ cart }) => setItems(fromServerCart(cart)))
        .catch((error) => console.error("Could not remove cart item:", error));
    }
  }, [user]);

  const clearCart = useCallback(() => {
    setItems([]);
    if (user) {
      void api<{ cart: { items: ServerCartItem[] } }>("/cart")
        .then(async ({ cart }) => {
          for (let index = cart.items.length - 1; index >= 0; index -= 1) {
            await api("/cart/remove", {
              method: "DELETE",
              body: JSON.stringify({ index }),
            });
          }
        })
        .catch((error) => console.error("Could not clear saved cart:", error));
    }
  }, [user]);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const loading = !hydrated || authLoading || Boolean(user && loadedUserId !== user.id);
    return { items, count, subtotal, loading, addItem, updateQuantity, removeItem, clearCart };
  }, [items, hydrated, authLoading, user, loadedUserId, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}