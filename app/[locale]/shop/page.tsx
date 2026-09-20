"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import ProductGrid from "@/components/ProductGrid";
import { fetchCategories, fetchProducts } from "@/lib/products";
import type { Category, Product } from "@/types";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("shop");
  const tc = useTranslations("common");

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";
  const priceRange = searchParams.get("price") || "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(search);
  const [loading, setLoading] = useState(true);

  const SORTS = [
    { value: "newest", label: t("sort.newest") },
    { value: "price-asc", label: t("sort.priceAsc") },
    { value: "price-desc", label: t("sort.priceDesc") },
    { value: "rating", label: t("sort.topRated") },
    { value: "popular", label: t("sort.popular") },
  ];

  const PRICE_RANGES = [
    { label: t("price0"), value: "0-999" },
    { label: t("price1"), value: "1000-2500" },
    { label: t("price2"), value: "2501-5000" },
    { label: t("price3"), value: "5001-1000000" },
  ];

  useEffect(() => {
    fetchCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const [min, max] = priceRange
      ? priceRange.split("-").map(Number)
      : [undefined, undefined];
    fetchProducts({
      category: category || undefined,
      sort: sort || undefined,
      search: search || undefined,
      min,
      max,
      page,
      limit: 12,
    })
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch((err) => console.error("Shop load failed:", err))
      .finally(() => setLoading(false));
  }, [category, sort, search, priceRange, page]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === category),
    [categories, category]
  );

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">{t("eyebrow")}</p>
          <h1 className="mt-2 font-display text-4xl">
            {activeCategory ? activeCategory.name : t("allProducts")}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {loading ? tc("loading") : t("pieces", { count: total })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setParam("search", searchInput.trim());
            }}
            className="flex items-center border border-line bg-white focus-within:border-muted"
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search")}
              className="h-10 w-40 bg-transparent px-3 text-sm outline-none sm:w-52"
            />
            <button type="submit" className="px-3 text-muted" aria-label={t("search")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-10 border border-line bg-white px-3 text-sm outline-none focus:border-muted"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Filters */}
        <aside className="space-y-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em]">{t("category")}</p>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              <button
                onClick={() => setParam("category", "")}
                className={`text-left text-sm hover:underline ${
                  !category ? "font-medium underline" : "text-muted"
                }`}
              >
                {t("allCategories")}
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setParam("category", c.slug)}
                  className={`text-left text-sm hover:underline ${
                    category === c.slug ? "font-medium underline" : "text-muted"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em]">{t("price")}</p>
            <div className="mt-3 flex flex-col gap-1">
              <button
                onClick={() => setParam("price", "")}
                className={`text-left text-sm hover:underline ${
                  !priceRange ? "font-medium underline" : "text-muted"
                }`}
              >
                {t("allPrices")}
              </button>
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setParam("price", r.value)}
                  className={`text-left text-sm hover:underline ${
                    priceRange === r.value ? "font-medium underline" : "text-muted"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse bg-cream/60" />
              ))}
            </div>
          ) : (
            <>
              <ProductGrid products={products} cols={3} />
              {pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="text-xs uppercase tracking-[0.2em] disabled:opacity-30"
                  >
                    {t("prev")}
                  </button>
                  <span className="text-sm text-muted">{t("pageOf", { page, pages })}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page >= pages}
                    className="text-xs uppercase tracking-[0.2em] disabled:opacity-30"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-cream/40" />}>
      <ShopContent />
    </Suspense>
  );
}