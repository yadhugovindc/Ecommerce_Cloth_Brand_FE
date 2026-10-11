"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import QuantitySelector from "@/components/QuantitySelector";
import Price from "@/components/Price";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/format";
import { imageUrl } from "@/lib/api";

export default function CartPage() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const { items, subtotal, loading, updateQuantity, removeItem } = useCart();
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true">
        <span className="sr-only" role="status">{tc("loading")}</span>
        <div className="h-10 w-56 animate-pulse bg-cream/60" />
        <div className="mt-3 h-4 w-24 animate-pulse bg-cream/50" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-line border-y border-line">
            {[0, 1].map((row) => (
              <div key={row} className="flex gap-4 py-6 sm:gap-6">
                <div className="aspect-4/5 w-24 shrink-0 animate-pulse bg-cream/50 sm:w-28" />
                <div className="flex flex-1 flex-col gap-3 py-1">
                  <div className="h-4 w-2/3 animate-pulse bg-cream/50" />
                  <div className="h-3 w-1/3 animate-pulse bg-cream/40" />
                  <div className="mt-auto h-8 w-28 animate-pulse bg-cream/50" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 animate-pulse border border-line bg-cream/30" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">{t("emptyTitle")}</h1>
        <p className="mt-4 text-muted">{t("emptyBody")}</p>
        <div className="mt-8">
          <Button href="/shop">{t("startShopping")}</Button>
        </div>
      </div>
    );
  }

  const shippingFee = subtotal >= 1999 ? 0 : 99;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted">{t("itemCount", { count: itemCount })}</p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="divide-y divide-line border-y border-line">
          {items.map((item, index) => (
            <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 py-6 sm:gap-6">
              <Link href={`/product/${item.slug}`} className="block shrink-0">
                <div className="relative aspect-4/5 w-24 overflow-hidden bg-cream/40 sm:w-28">
                  {item.image ? (
                    <Image src={imageUrl(item.image)} alt={item.name} fill sizes="112px" className="object-cover" />
                  ) : null}
                </div>
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/product/${item.slug}`} className="font-medium hover:underline">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {item.color && <span className="mr-3">{t("color", { color: item.color })}</span>}
                      {item.size && <span>{t("size", { size: item.size })}</span>}
                    </p>
                  </div>
                  <Price price={item.price} discountPrice={item.originalPrice} />
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <QuantitySelector
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(index, q)}
                    max={item.stock}
                    size="sm"
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="text-xs uppercase tracking-[0.15em] text-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="h-fit border border-line bg-white p-6">
          <h2 className="font-display text-xl">{t("summaryTitle")}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{t("subtotal")}</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t("shipping")}</dt>
              <dd>
                {shippingFee === 0 ? <span className="text-green-700">{tc("free")}</span> : formatINR(shippingFee)}
              </dd>
            </div>
            {subtotal < 1999 && (
              <p className="bg-cream/60 px-3 py-2 text-xs text-muted">
                {t("freeShippingHint", { amount: formatINR(1999 - subtotal) })}
              </p>
            )}
            <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
              <dt>{t("total")}</dt>
              <dd>{formatINR(subtotal + shippingFee)}</dd>
            </div>
          </dl>
          <Button href="/checkout" className="mt-6 w-full">
            {t("proceed")}
          </Button>
          <Button href="/shop" variant="ghost" size="sm" className="mt-3 w-full">
            {t("continue")}
          </Button>
        </aside>
      </div>
    </div>
  );
}