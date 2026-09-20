"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { imageUrl } from "@/lib/api";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import Price from "./Price";

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("productCard");
  const { addItem } = useCart();
  const categoryName =
    typeof product.category === "string" ? "" : product.category?.name || "";

  return (
    <div className="group">
      <Link href={`/product/${product.slug}`} className="relative block overflow-hidden bg-cream/40">
        <div className="relative aspect-[4/5] w-full">
          {product.images[0] ? (
            <Image
              src={imageUrl(product.images[0])}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">{t("noImage")}</div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isNewArrival && (
            <span className="bg-white/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">
              {t("new")}
            </span>
          )}
          {product.isSale && (
            <span className="bg-dark px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-bg">
              {t("sale")}
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted">{categoryName}</p>
          <Link
            href={`/product/${product.slug}`}
            className="mt-0.5 block text-sm font-medium hover:underline"
          >
            {product.name}
          </Link>
        </div>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <Price price={product.price} discountPrice={product.discountPrice} size="sm" />
        <button
          onClick={() =>
            addItem(product, { size: product.sizes[0] || "M", color: product.colors[0] || "", quantity: 1 })
          }
          disabled={product.stock <= 0}
          className="text-[11px] uppercase tracking-[0.15em] text-muted underline-offset-4 hover:text-ink hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`${t("addToCart")}: ${product.name}`}
        >
          {product.stock > 0 ? t("addToCart") : t("soldOut")}
        </button>
      </div>
    </div>
  );
}