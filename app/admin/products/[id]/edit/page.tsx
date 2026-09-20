"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { fetchProductById } from "@/lib/admin";
import type { Product } from "@/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProductById(id)
      .then((d) => setProduct(d.product))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <p className="py-20 text-center text-muted">
        Product not found.{" "}
        <a href="/admin/products" className="underline underline-offset-2">
          Back to products
        </a>
      </p>
    );
  }

  if (!product) {
    return <div className="h-64 animate-pulse bg-cream/40" />;
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl">Edit Product</h1>
      <p className="mt-1 text-sm text-muted">{product.name}</p>
      <div className="mt-8">
        <ProductForm mode="edit" productId={id} initialProduct={product} />
      </div>
    </div>
  );
}