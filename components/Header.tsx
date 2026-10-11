"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const t = useTranslations("header");
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const locale = useLocale();
  const pathname = usePathname();

  const NAV = [
    { label: t("women"), href: "/shop?category=women" },
    { label: t("men"), href: "/shop?category=men" },
    { label: t("dresses"), href: "/shop?category=dresses" },
    { label: t("shopAll"), href: "/shop" },
  ];

  function switchLocale(next: string) {
    // Remember the choice so later unprefixed navigations keep the language,
    // then hard-navigate to the same page under the target locale.
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    const search = typeof window !== "undefined" ? window.location.search : "";
    window.location.assign(`/${next}${pathname}${search}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t("menuAria")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="font-display text-xl tracking-[0.35em]">
          ATELIER
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              aria-label={t("languageAria")}
              className="flex items-center gap-1 border border-line px-2 py-1 text-[11px] font-medium tracking-widest text-muted hover:text-ink"
            >
              {locale === "ml" ? "ML" : "EN"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 border border-line bg-white py-1 text-sm shadow-lg">
                {routing.locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`block w-full px-3 py-1.5 text-left text-xs hover:bg-bg ${
                      locale === l ? "bg-bg font-semibold text-ink" : "text-muted"
                    }`}
                  >
                    {l === "ml" ? "മലയാളം" : "English"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="text-xs uppercase tracking-[0.18em] text-muted hover:text-ink"
              aria-label={t("accountAria")}
            >
              <svg className="hidden sm:block" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" strokeLinecap="round" />
              </svg>
              <span className="sm:hidden">{user ? user.name.split(" ")[0] : t("accountAria")}</span>
            </button>
            {accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 border border-line bg-white py-2 text-sm shadow-lg">
                {user ? (
                  <>
                    <p className="border-b border-line px-4 py-2 text-muted">{user.email}</p>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-bg"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t("orders")}
                    </Link>
                    {user.role === "admin" && (
                      /* Plain next/link: /admin lives outside the locale segment */
                      <NextLink
                        href="/admin"
                        className="block px-4 py-2 hover:bg-bg"
                        onClick={() => setAccountOpen(false)}
                      >
                        {t("admin")}
                      </NextLink>
                    )}
                    <button
                      className="block w-full px-4 py-2 text-left hover:bg-bg"
                      onClick={() => {
                        setAccountOpen(false);
                        logout();
                      }}
                    >
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 hover:bg-bg"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t("signIn")}
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 hover:bg-bg"
                      onClick={() => setAccountOpen(false)}
                    >
                      {t("register")}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative text-muted hover:text-ink" aria-label={t("cartAria")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 7h12l1 13H5L6 7z" strokeLinejoin="round" />
              <path d="M9 10V6a3 3 0 0 1 6 0v4" strokeLinecap="round" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-dark text-[10px] font-medium text-bg">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="border-t border-line bg-bg px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm uppercase tracking-[0.18em] text-muted"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}