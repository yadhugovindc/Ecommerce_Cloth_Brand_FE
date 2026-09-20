"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import Price from "@/components/Price";
import QuantitySelector from "@/components/QuantitySelector";
import ProductGrid from "@/components/ProductGrid";
import { Link } from "@/i18n/navigation";
import { fetchProduct, fetchProducts } from "@/lib/products";
import { imageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const t = useTranslations("product");
  const tp = useTranslations("productCard");
  const tc = useTranslations("common");

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setProduct(null);
    setNotFound(false);
    fetchProduct(slug)
      .then(({ product }) => {
        setProduct(product);
        setSize(product.sizes[0] || "");
        setColor(product.colors[0] || "");
        const catSlug =
          typeof product.category === "string" ? "" : product.category?.slug;
        if (catSlug) {
          fetchProducts({ category: catSlug, limit: 4 }).then((d) =>
            setRelated(d.products.filter((p) => p._id !== product._id).slice(0, 4))
          );
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const categoryName = useMemo(
    () => (product && typeof product.category !== "string" ? product.category?.name : ""),
    [product]
  );
  const categorySlug = useMemo(
    () => (product && typeof product.category !== "string" ? product.category?.slug : ""),
    [product]
  );

  function handleAddToCart() {
    if (!product) return;
    addItem(product, { size, color, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">{t("notFound.title")}</h1>
        <p className="mt-4 text-muted">{t("notFound.body")}</p>
        <div className="mt-8">
          <Button href="/shop">{tc("backToShop")}</Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="h-screen animate-pulse bg-cream/40" />;
  }

  const soldOut = product.stock <= 0;
  
  console.log("product.images[0]", product.images[0]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="text-xs uppercase tracking-[0.15em] text-muted">
        <Link href="/" className="hover:text-ink">{t("home")}</Link>
        {" / "}
        <Link href={`/shop${categorySlug ? `?category=${categorySlug}` : ""}`} className="hover:text-ink">
          {categoryName || t("shop")}
        </Link>
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <div className="grid grid-cols-[72px_1fr] gap-4">
          <div className="flex flex-col gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`aspect-[4/5] overflow-hidden border ${i === 0 ? "border-ink" : "border-line"}`}
              >
                <Image src={imageUrl(img)} alt={`${product.name} ${i + 1}`} width={72} height={90} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-cream/40">
            <Image
              src={imageUrl(product.images[0])}
              alt={product.name}
              unoptimized
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
           
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.isNewArrival && (
                <span className="bg-white/90 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">{tp("new")}</span>
              )}
              {product.isSale && (
                <span className="bg-dark px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-bg">{tp("sale")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">{categoryName}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-muted">
              ★ {product.rating.toFixed(1)} {t("reviews", { count: product.reviewCount })}
            </span>
            <span className={`text-xs uppercase tracking-wider ${soldOut ? "text-red-600" : "text-muted"}`}>
              {soldOut ? t("soldOut") : t("inStock", { stock: product.stock })}
            </span>
          </div>

          <div className="mt-4">
            <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
          </div>

          <p className="mt-6 leading-relaxed text-muted">{product.description}</p>

          {/* Color */}
          <div className="mt-8">
            <p className="text-xs font-medium uppercase tracking-[0.2em]">{t("color", { color })}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`border px-3 py-1.5 text-xs transition-colors ${
                    color === c ? "border-ink bg-dark text-bg" : "border-line bg-white hover:border-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.2em]">{t("size", { size })}</p>
              <button className="text-xs text-muted underline underline-offset-2">{t("sizeGuide")}</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-11 border px-3 py-2 text-xs transition-colors ${
                    size === s ? "border-ink bg-dark text-bg" : "border-line bg-white hover:border-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock} />
            <Button onClick={handleAddToCart} disabled={soldOut} className="flex-1 sm:flex-none sm:min-w-56">
              {soldOut ? t("soldOut") : added ? t("added") : t("addToCart")}
            </Button>
          </div>

          {/* Details */}
          <dl className="mt-10 grid grid-cols-2 gap-px border border-line bg-line text-sm">
            <div className="bg-bg p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-muted">{t("details.material")}</dt>
              <dd className="mt-1">{product.material || "—"}</dd>
            </div>
            <div className="bg-bg p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-muted">{t("details.brand")}</dt>
              <dd className="mt-1">{product.brand}</dd>
            </div>
            <div className="bg-bg p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-muted">{t("details.sku")}</dt>
              <dd className="mt-1">{product.sku}</dd>
            </div>
            <div className="bg-bg p-4">
              <dt className="text-xs uppercase tracking-[0.2em] text-muted">{t("details.category")}</dt>
              <dd className="mt-1">{product.subCategory || categoryName}</dd>
            </div>
          </dl>

          <p className="mt-6 text-xs leading-relaxed text-muted">{t("shippingNote")}</p>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl">{t("related")}</h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}