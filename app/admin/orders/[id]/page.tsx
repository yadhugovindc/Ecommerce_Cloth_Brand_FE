"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchOrderAdmin, updateOrderStatus, OrderWithUser } from "@/lib/admin";
import { imageUrl } from "@/lib/api";
import { formatINR } from "@/lib/format";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENTS = ["pending", "paid", "failed", "refunded"];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function load() {
    if (!id) return;
    fetchOrderAdmin(id)
      .then((d) => setOrder(d.order))
      .catch(() => {});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(status: string) {
    if (!order) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const d = await updateOrderStatus(order._id, { status });
      setOrder(d.order);
      setMessage(`Status updated to “${status}”`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function setPayment(paymentStatus: string) {
    if (!order) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const d = await updateOrderStatus(order._id, { paymentStatus });
      setOrder(d.order);
      setMessage(`Payment marked “${paymentStatus}”`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (!order) {
    return <div className="h-64 animate-pulse bg-cream/40" />;
  }

  const addr = order.shippingAddress;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="text-xs uppercase tracking-[0.15em] text-muted hover:text-ink">
        ← All orders
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">#{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed{" "}
            {new Date(order.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {(error || message) && (
        <p
          className={`mt-4 border px-3 py-2 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Items */}
          <section className="border border-line bg-white">
            <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted">
              Items ({order.items.reduce((n, i) => n + i.quantity, 0)})
            </p>
            <ul className="divide-y divide-line/60">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-cream/40">
                    {item.image && (
                      <Image src={imageUrl(item.image)} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted">
                      {item.color && <span className="mr-2">Color: {item.color}</span>}
                      {item.size && <span>Size: {item.size}</span>}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatINR(item.price)} × {item.quantity}</p>
                    <p className="font-medium">{formatINR(item.price * item.quantity)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Items total</dt>
                <dd>{formatINR(order.itemsTotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd>{order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-medium">
                <dt>Total</dt>
                <dd>{formatINR(order.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Shipping */}
          <section className="border border-line bg-white">
            <p className="border-b border-line px-5 py-3 text-xs uppercase tracking-[0.2em] text-muted">
              Shipping Address
            </p>
            <div className="px-5 py-4 text-sm">
              <p className="font-medium">{addr.fullName}</p>
              <p className="text-muted">{addr.line1}</p>
              {addr.line2 && <p className="text-muted">{addr.line2}</p>}
              <p className="text-muted">
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="text-muted">{addr.phone}</p>
            </div>
          </section>
        </div>

        {/* Management panel */}
        <aside className="space-y-6">
          <section className="border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Fulfilment status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  disabled={saving}
                  className={`border px-3 py-1.5 text-xs capitalize transition-colors disabled:opacity-50 ${
                    order.status === s
                      ? "border-dark bg-dark text-bg"
                      : "border-line bg-bg text-muted hover:border-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="border border-line bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Payment</p>
            <p className="mt-2 text-sm">
              Method: <span className="uppercase">{order.paymentMethod}</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PAYMENTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPayment(s)}
                  disabled={saving}
                  className={`border px-3 py-1.5 text-xs capitalize transition-colors disabled:opacity-50 ${
                    order.paymentStatus === s
                      ? "border-dark bg-dark text-bg"
                      : "border-line bg-bg text-muted hover:border-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="border border-line bg-white p-5 text-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Customer</p>
            <p className="mt-2 font-medium">{order.user?.name || "—"}</p>
            <p className="text-muted">{order.user?.email || ""}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}