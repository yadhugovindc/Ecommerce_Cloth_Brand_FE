import { api } from "./api";
import type { Category, Order, Product } from "@/types";

export interface OrderWithUser extends Order {
  user: { _id: string; name: string; email: string };
}

export interface AdminStats {
  productCount: number;
  orderCount: number;
  customerCount: number;
  revenue: number;
}

export function fetchStats(): Promise<{
  stats: AdminStats;
  recentOrders: OrderWithUser[];
}> {
  return api("/admin/stats");
}

export function fetchAllOrders(status = "all"): Promise<{ orders: OrderWithUser[] }> {
  return api(`/admin/orders${status && status !== "all" ? `?status=${status}` : ""}`);
}

export function fetchOrderAdmin(id: string): Promise<{ order: OrderWithUser }> {
  return api(`/admin/orders/${id}`);
}

export function updateOrderStatus(
  id: string,
  body: { status?: string; paymentStatus?: string }
): Promise<{ order: OrderWithUser }> {
  return api(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function fetchAdminProducts(search = ""): Promise<{ products: Product[] }> {
  return api(`/admin/products${search ? `?search=${encodeURIComponent(search)}` : ""}`);
}

export function fetchProductById(id: string): Promise<{ product: Product }> {
  return api(`/admin/products/${id}`);
}

export function createProduct(data: Partial<Product>): Promise<{ product: Product }> {
  return api("/products", { method: "POST", body: JSON.stringify(data) });
}

export function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<{ product: Product }> {
  return api(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteProduct(id: string): Promise<{ message: string }> {
  return api(`/products/${id}`, { method: "DELETE" });
}

export function createCategory(data: {
  name: string;
  description?: string;
}): Promise<{ category: Category }> {
  return api("/categories", { method: "POST", body: JSON.stringify(data) });
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return api(`/categories/${id}`, { method: "DELETE" });
}

export async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  const data = await api<{ urls: string[] }>("/admin/upload", {
    method: "POST",
    body: form,
  });
  return data.urls;
}