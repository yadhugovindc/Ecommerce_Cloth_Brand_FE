"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats, OrderWithUser, AdminStats } from "@/lib/admin";
import { formatINR } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then((d) => {
        setStats(d.stats);
        setRecent(d.recentOrders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Products", value: stats?.productCount ?? "—", href: "/admin/products" },
    { label: "Orders", value: stats?.orderCount ?? "—", href: "/admin/orders" },
    { label: "Revenue", value: stats ? formatINR(stats.revenue) : "—", href: "/admin/orders" },
    { label: "Customers", value: stats?.customerCount ?? "—", href: "/admin" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Store overview</p>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-cream/60" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="border border-line bg-white p-5 transition-shadow hover:shadow-md">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{c.label}</p>
              <p className="mt-2 text-3xl font-medium">{c.value}</p>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-12 font-display text-xl">Recent Orders</h2>
      <div className="mt-4 overflow-x-auto border border-line bg-white">
        {loading ? (
          <div className="h-32 animate-pulse bg-cream/40" />
        ) : recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No orders yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-[0.15em] text-muted">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o._id} className="border-b border-line/60 last:border-0 hover:bg-bg/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-medium hover:underline">
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{o.user?.name || "—"}</td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-3 font-medium">{formatINR(o.total)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}