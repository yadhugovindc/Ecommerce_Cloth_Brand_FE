"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import CategoryCard from "@/components/CategoryCard";
import ProductGrid from "@/components/ProductGrid";
import { Link } from "@/i18n/navigation";
import { fetchCategories, fetchFeatured, fetchProducts } from "@/lib/products";
import type { Category, Product } from "@/types";

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchFeatured(), fetchProducts({ sort: "newest", limit: 4 })])
      .then(([catData, featData, newData]) => {
        setCategories(catData.categories);
        setFeatured(featData.products);
        setNewArrivals(newData.products);
      })
      .catch((err) => console.error("Failed to load home:", err))
      .finally(() => setLoading(false));
  }, []);

  const skeleton = Array.from({ length: 4 });

  return (
    <div>
      {/* ── Hero ─────────────────────────────── */}
      <section className="border-b border-line bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">{t("hero.eyebrow")}</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              {t("hero.title1")}
              <br />
              {t("hero.title2")}
            </h1>
            <p className="mt-6 max-w-md text-muted">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/shop?category=women">{t("hero.shopWomen")}</Button>
              <Button href="/shop?category=men" variant="outline">
                {t("hero.shopMen")}
              </Button>
            </div>
          </div>
          <div className="hidden aspect-[4/5] max-h-[560px] w-full bg-dark md:block">
            <div className="flex h-full flex-col items-center justify-center gap-6 p-10 text-center text-bg">
              <p className="text-xs uppercase tracking-[0.35em] text-bg/60">{t("heroCard.season")}</p>
              <p className="font-display text-4xl leading-tight">{t("heroCard.title")}</p>
              <p className="max-w-xs text-sm text-bg/70">{t("heroCard.text")}</p>
              <Link
                href="/shop"
                className="border-b border-bg/50 pb-0.5 text-xs uppercase tracking-[0.2em] hover:border-bg"
              >
                {t("heroCard.cta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by category ─────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">{t("categoriesTitle")}</h2>
          <Link href="/shop" className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink">
            {tc("viewAll")}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <CategoryCard key={cat._id} category={cat} />
          ))}
        </div>
      </section>

      {/* ── Best sellers ─────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl">{t("bestSellersTitle")}</h2>
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {skeleton.map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse bg-cream/60" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featured} />
          )}
        </div>
      </section>

      {/* ── New arrivals ─────────────────────── */}
      <section className="border-t border-line bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl">{t("newArrivalsTitle")}</h2>
            <Link
              href="/shop?sort=newest"
              className="text-xs uppercase tracking-[0.2em] text-muted hover:text-ink"
            >
              {t("newIn")}
            </Link>
          </div>
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {skeleton.map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse bg-cream/60" />
                ))}
              </div>
            ) : (
              <ProductGrid products={newArrivals} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}