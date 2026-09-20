import { api } from "./api";
import type { Category, Order, PaginatedProducts, Product } from "@/types";

export interface ProductQuery {
  category?: string;
  search?: string;
  sort?: string;
  min?: number;
  max?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export function fetchProducts(query: ProductQuery = {}): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.search) params.set("search", query.search);
  if (query.sort) params.set("sort", query.sort);
  if (query.min !== undefined) params.set("min", String(query.min));
  if (query.max !== undefined) params.set("max", String(query.max));
  if (query.featured) params.set("featured", "true");
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  return api<PaginatedProducts>(`/products${qs ? `?${qs}` : ""}`);
}

export function fetchProduct(slug: string): Promise<{ product: Product }> {
  return api<{ product: Product }>(`/products/${slug}`);
}

export function fetchFeatured(): Promise<PaginatedProducts> {
  return api<PaginatedProducts>("/products/featured");
}

export function fetchCategories(): Promise<{ categories: Category[] }> {
  return api<{ categories: Category[] }>("/categories");
}

export function fetchOrder(id: string): Promise<{ order: import("@/types").Order }> {
  return api<{ order: import("@/types").Order }>(`/orders/${id}`);
}

/**
 * Confirms a Stripe checkout from the return redirect. Stripe sends the customer
 * back before the webhook is guaranteed to have landed, so the success page asks
 * the server to settle the session and report the order's real state.
 */
export function verifyCheckoutSession(sessionId: string): Promise<{ order: Order }> {
  return api<{ order: Order }>(`/orders/stripe-session/${encodeURIComponent(sessionId)}`);
}

export function fetchMyOrders(): Promise<{ orders: import("@/types").Order[] }> {
  return api<{ orders: import("@/types").Order[] }>("/orders");
}