"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, uploadImages } from "@/lib/admin";
import { imageUrl } from "@/lib/api";
import { fetchCategories } from "@/lib/products";
import type { Category, Product } from "@/types";

const input =
  "h-11 w-full border border-line bg-white px-3 text-sm outline-none focus:border-muted";
const label = "mb-1 block text-xs uppercase tracking-[0.15em] text-muted";

interface FormState {
  name: string;
  description: string;
  category: string;
  subCategory: string;
  gender: "women" | "men" | "unisex";
  price: string;
  discountPrice: string;
  stock: string;
  sku: string;
  material: string;
  colors: string;
  sizes: string;
  images: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isSale: boolean;
}

function toForm(p?: Product): FormState {
  return {
    name: p?.name || "",
    description: p?.description || "",
    category: typeof p?.category === "string" ? p.category : p?.category?._id || "",
    subCategory: p?.subCategory || "",
    gender: p?.gender || "unisex",
    price: p ? String(p.price) : "",
    discountPrice: p?.discountPrice ? String(p.discountPrice) : "",
    stock: p ? String(p.stock) : "10",
    sku: p?.sku || "",
    material: p?.material || "",
    colors: (p?.colors || []).join(", "),
    sizes: (p?.sizes || []).join(", "),
    images: p?.images || [],
    isFeatured: p?.isFeatured || false,
    isNewArrival: p?.isNewArrival || false,
    isSale: p?.isSale || false,
  };
}

export default function ProductForm({
  mode,
  productId,
  initialProduct,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialProduct?: Product;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(() => toForm(initialProduct));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const urls = await uploadImages(Array.from(files));
      set("images", [...form.images, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload: Partial<Product> & Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subCategory: form.subCategory.trim(),
      gender: form.gender,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      sku: form.sku.trim() || `ATL-${Math.floor(1000 + Math.random() * 9000)}`,
      material: form.material.trim(),
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      images: form.images,
      isFeatured: form.isFeatured,
      isNewArrival: form.isNewArrival,
      isSale: form.isSale,
    };
    // slug is generated server-side on create and preserved on edit

    try {
      if (mode === "create") {
        await createProduct(payload);
      } else if (productId) {
        await updateProduct(productId, payload);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="space-y-6">
        <div>
          <label className={label}>Product name *</label>
          <input
            name="name"
            className={input}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div>
          <label className={label}>Description *</label>
          <textarea
            name="description"
            className="w-full border border-line bg-white px-3 py-2 text-sm outline-none focus:border-muted"
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Category *</label>
            <select
              name="category"
              className={input}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              required
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Sub-category</label>
            <input
              name="subCategory"
              className={input}
              value={form.subCategory}
              onChange={(e) => set("subCategory", e.target.value)}
              placeholder="e.g. Knitwear"
            />
          </div>
          <div>
            <label className={label}>Gender</label>
            <select
              name="gender"
              className={input}
              value={form.gender}
              onChange={(e) => set("gender", e.target.value as FormState["gender"])}
            >
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className={label}>Material</label>
            <input
              name="material"
              className={input}
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="e.g. 100% Linen"
            />
          </div>
          <div>
            <label className={label}>Colors (comma separated)</label>
            <input
              name="colors"
              className={input}
              value={form.colors}
              onChange={(e) => set("colors", e.target.value)}
              placeholder="Natural, White, Black"
            />
          </div>
          <div>
            <label className={label}>Sizes (comma separated)</label>
            <input
              name="sizes"
              className={input}
              value={form.sizes}
              onChange={(e) => set("sizes", e.target.value)}
              placeholder="XS, S, M, L"
            />
          </div>
        </div>

        <div>
          <label className={label}>Badges</label>
          <div className="flex flex-wrap gap-6 border border-line bg-white px-4 py-3">
            {(
              [
                ["isFeatured", "Featured"],
                ["isNewArrival", "New arrival"],
                ["isSale", "On sale"],
              ] as const
            ).map(([key, text]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => set(key, e.target.checked)}
                  className="accent-dark"
                />
                {text}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-dark px-6 py-3 text-xs uppercase tracking-[0.15em] text-bg hover:bg-ink disabled:opacity-40"
          >
            {saving ? "Saving…" : mode === "create" ? "Create Product" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="border border-line px-6 py-3 text-xs uppercase tracking-[0.15em] text-muted hover:border-muted"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Side column */}
      <div className="space-y-6">
        <div>
          <label className={label}>Price (₹) *</label>
          <input
            name="price"
            className={input}
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>Discount price (₹)</label>
          <input
            name="discountPrice"
            className={input}
            type="number"
            min={0}
            value={form.discountPrice}
            onChange={(e) => set("discountPrice", e.target.value)}
          />
        </div>
        <div>
          <label className={label}>Stock *</label>
          <input
            name="stock"
            className={input}
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>SKU</label>
          <input
            name="sku"
            className={input}
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            placeholder="Auto-generated if blank"
          />
        </div>

        <div>
          <label className={label}>Images</label>
          <div className="grid grid-cols-3 gap-2">
            {form.images.map((url, i) => (
              <div key={url} className="group relative aspect-[4/5] overflow-hidden border border-line bg-cream/40">
                <Image src={imageUrl(url)} alt={`Image ${i + 1}`} fill sizes="100px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-dark text-[10px] text-bg opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex aspect-[4/5] cursor-pointer items-center justify-center border border-dashed border-muted text-center text-xs text-muted hover:border-ink hover:text-ink">
              {uploading ? (
                <span className="animate-pulse">Uploading…</span>
              ) : (
                <span className="px-2">
                  + Add<br />image
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">JPG / PNG / WebP, up to 5MB each.</p>
        </div>
      </div>
    </form>
  );
}