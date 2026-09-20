"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchAllOrders, OrderWithUser } from "@/lib/admin";
import { formatINR } from "@/lib/format";

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("all");
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAllOrders(status)
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="mt-1 text-sm text-muted">{orders.length} order{orders.length === 1 ? "" : "s"}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`border px-4 py-1.5 text-xs capitalize transition-colors ${
              status === s
                ? "border-dark bg-dark text-bg"
                : "border-line bg-white text-muted hover:border-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        {loading ? (
          <div className="h-48 animate-pulse bg-cream/40" />
        ) : orders.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No {status === "all" ? "" : status + " "}orders.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-[0.15em] text-muted">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-line/60 last:border-0 hover:bg-bg/50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o._id}`} className="font-medium hover:underline">
                      #{o._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <p>{o.user?.name || "—"}</p>
                    <p className="text-xs text-muted">{o.user?.email || ""}</p>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {o.items.reduce((n, i) => n + i.quantity, 0)}
                  </td>
                  <td className="px-5 py-3 font-medium">{formatINR(o.total)}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs uppercase tracking-wider text-muted">
                      {o.paymentMethod}
                    </span>
                  </td>
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