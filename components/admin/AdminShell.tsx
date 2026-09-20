"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "▦" },
  { label: "Products", href: "/admin/products", icon: "◈" },
  { label: "Orders", href: "/admin/orders", icon: "☰" },
  { label: "Categories", href: "/admin/categories", icon: "◍" },
];

function Loading() {
  return <div className="h-screen animate-pulse bg-cream/40" />;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) return <Loading />;

  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="font-display text-4xl">Admins only</h1>
        <p className="mt-4 text-muted">
          You&apos;re signed in as <span className="font-medium">{user.email}</span>,
          which doesn&apos;t have admin access.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm underline underline-offset-4">
          ← Back to the store
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1efe9]">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-dark text-bg">
        <Link href="/admin" className="border-b border-bg/10 px-6 py-5">
          <p className="font-display text-lg tracking-[0.3em]">ATELIER</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-bg/50">
            Admin
          </p>
        </Link>
        <nav className="flex-1 py-4">
          {NAV.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? "bg-bg/10 font-medium text-white"
                    : "text-bg/60 hover:bg-bg/5 hover:text-white"
                }`}
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-bg/10 px-6 py-4 text-xs text-bg/50">
          <p className="truncate">{user.email}</p>
          <Link href="/" className="mt-1 inline-block underline-offset-4 hover:underline">
            View store →
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line bg-white px-8 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {NAV.find((n) =>
              n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
            )?.label || "Admin"}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.15em] text-muted hover:text-ink"
            >
              View store
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="text-xs uppercase tracking-[0.15em] text-muted hover:text-ink"
            >
              Logout
            </button>
          </div>
        </div>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}