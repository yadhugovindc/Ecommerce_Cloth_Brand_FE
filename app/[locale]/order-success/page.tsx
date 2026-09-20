"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import { Link } from "@/i18n/navigation";
import { fetchOrder, verifyCheckoutSession } from "@/lib/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import type { Order } from "@/types";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "";
  const sessionId = searchParams.get("session_id") || "";
  const { clearCart } = useCart();
  const t = useTranslations("orderSuccess");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId && !sessionId) {
      setError("No order reference provided");
      return;
    }
    setError("");

    let cancelled = false;
    // A Stripe return is confirmed against the session rather than trusted from
    // the URL, which also settles the order when the webhook is still in flight.
    const request = sessionId
      ? verifyCheckoutSession(sessionId)
      : fetchOrder(orderId);

    request
      .then(({ order: loaded }) => {
        if (cancelled) return;
        setOrder(loaded);
        // Only empty the basket once a card payment is confirmed; abandoning the
        // Stripe page must leave the cart intact.
        if (sessionId && loaded.paymentStatus === "paid") clearCart();
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your order");
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId, clearCart]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dark text-bg">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mt-6 font-display text-4xl">{t("title")}</h1>
      <p className="mt-3 text-muted">
        {order ? (
          t("received", { id: order._id.slice(-8).toUpperCase() })
        ) : error ? (
          error
        ) : (
          t("loading")
        )}
      </p>

      {order && (
        <div className="mt-10 border border-line bg-white p-6 text-left">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("orderTotal")}</p>
              <p className="mt-1 text-2xl font-medium">{formatINR(order.total)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("paymentLabel")}</p>
              <div className="mt-2 flex justify-end">
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{t("statusLabel")}</p>
              <p className="mt-1 text-sm capitalize">{order.status}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>
                  {item.name}
                  {item.size && <span className="text-muted"> · {item.size}</span>}
                  <span className="text-muted"> × {item.quantity}</span>
                </span>
                <span>{formatINR(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            {t("shippingTo", {
              name: order.shippingAddress.fullName,
              line1: order.shippingAddress.line1,
              city: order.shippingAddress.city,
              pincode: order.shippingAddress.pincode,
            })}
          </p>
        </div>
      )}

      <div className="mt-10 flex justify-center gap-4">
        <Button href="/shop">{t("continue")}</Button>
        <Button href="/orders" variant="outline">
          {t("viewOrders")}
        </Button>
      </div>
      <p className="mt-8 text-xs text-muted">
        <Link href="/" className="underline underline-offset-2">
          {t("backHome")}
        </Link>
      </p>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-cream/40" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}