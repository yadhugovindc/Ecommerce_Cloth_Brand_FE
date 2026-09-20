"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMyOrders } from "@/lib/products";
import { formatINR } from "@/lib/format";
import type { Order } from "@/types";

const STATUS_KEY: Record<string, string> = {
  pending: "pending",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

function statusColor(status: string) {
  switch (status) {
    case "delivered":
      return "text-green-700";
    case "cancelled":
      return "text-red-600";
    default:
      return "text-muted";
  }
}

export default function OrdersPage() {
  const t = useTranslations("ordersPage");
  const th = useTranslations("header");
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchMyOrders()
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">{t("signInTitle")}</h1>
        <div className="mt-8">
          <Button href="/login">{th("signIn")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl">{t("title")}</h1>

      {loading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-cream/60" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 border border-line bg-white p-10 text-center">
          <p className="text-muted">{t("empty")}</p>
          <div className="mt-6">
            <Button href="/shop">{t("startShopping")}</Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const count = order.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <Link
                key={order._id}
                href={`/order-success?id=${order._id}`}
                className="block border border-line bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {" · "}
                      {t("items", { count })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className={`text-sm capitalize ${statusColor(order.status)}`}>
                      {t(`status.${STATUS_KEY[order.status] || "pending"}`)}
                    </span>
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <span className="text-sm font-medium">{formatINR(order.total)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}