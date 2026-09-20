"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteProduct, fetchAdminProducts } from "@/lib/admin";
import { imageUrl } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  function load(s = "") {
    setLoading(true);
    fetchAdminProducts(s)
      .then((d) => setProducts(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(p: Product) {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    setDeleting(p._id);
    try {
      await deleteProduct(p._id);
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted">{products.length} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-dark px-5 py-3 text-xs uppercase tracking-[0.15em] text-bg hover:bg-ink"
        >
          + New Product
        </Link>
      </div>

      <div className="mt-6 flex items-center border border-line bg-white focus-within:border-muted">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="h-11 w-full bg-transparent px-4 text-sm outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="px-4 text-muted">✕</button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        {loading ? (
          <div className="h-48 animate-pulse bg-cream/40" />
        ) : products.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No products found{search ? ` for “${search}”` : ""}.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-[0.15em] text-muted">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Badges</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const catName = typeof p.category === "string" ? "" : p.category?.name || "";
                return (
                  <tr key={p._id} className="border-b border-line/60 last:border-0 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-[4/5] w-10 shrink-0 overflow-hidden bg-cream/40">
                          {p.images[0] && (
                            <Image src={imageUrl(p.images[0])} alt="" fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="truncate text-xs text-muted">/product/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">{catName}</td>
                    <td className="px-5 py-3">
                      {formatINR(p.price)}
                      {p.discountPrice && p.discountPrice < p.price && (
                        <span className="ml-1 text-xs text-muted line-through">{formatINR(p.discountPrice)}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={p.stock <= 0 ? "text-red-600" : p.stock < 10 ? "text-amber-700" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        {p.isFeatured && <span className="bg-cream px-1.5 py-0.5 text-[10px] uppercase">Feat</span>}
                        {p.isNewArrival && <span className="bg-cream px-1.5 py-0.5 text-[10px] uppercase">New</span>}
                        {p.isSale && <span className="bg-cream px-1.5 py-0.5 text-[10px] uppercase">Sale</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3 text-xs">
                        <Link href={`/admin/products/${p._id}/edit`} className="underline underline-offset-2 hover:text-ink">
                          Edit
                        </Link>
                        <Link href={`/product/${p.slug}`} target="_blank" className="text-muted underline underline-offset-2 hover:text-ink">
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p._id}
                          className="text-red-600 underline underline-offset-2 disabled:opacity-40"
                        >
                          {deleting === p._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}