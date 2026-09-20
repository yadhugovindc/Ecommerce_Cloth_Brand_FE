"use client";

import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl">New Product</h1>
      <p className="mt-1 text-sm text-muted">
        Fill in the details — the slug and listing will be generated automatically.
      </p>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}