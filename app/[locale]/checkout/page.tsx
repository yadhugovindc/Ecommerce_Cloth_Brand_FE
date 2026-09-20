"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Button from "@/components/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { api, imageUrl } from "@/lib/api";
import { formatINR } from "@/lib/format";
import type { Order } from "@/types";

interface AddressForm {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

const emptyAddress: AddressForm = {
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("checkout");
  const tc = useTranslations("common");
  const ts = useTranslations("cart");
  const th = useTranslations("header");

  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">{t("loginTitle")}</h1>
        <p className="mt-4 text-muted">{t("loginBody")}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/login?next=%2Fcheckout">{th("signIn")}</Button>
          <Button href="/register?next=%2Fcheckout" variant="outline">
            {th("register")}
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl">{t("emptyTitle")}</h1>
        <p className="mt-4 text-muted">{t("emptyBody")}</p>
        <div className="mt-8">
          <Button href="/shop">{tc("backToShop")}</Button>
        </div>
      </div>
    );
  }

  const shippingFee = subtotal >= 1999 ? 0 : 99;
  const total = subtotal + shippingFee;

  function update<K extends keyof AddressForm>(key: K, value: string) {
    setAddress((a) => ({ ...a, [key]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { line2, ...required } = address;
      void line2;
      const orderItems = items.map((i) => ({
        product: i.productId,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));

      if (paymentMethod === "stripe") {
        const session = await api<{ url: string }>("/orders/stripe-session", {
          method: "POST",
          body: JSON.stringify({ items: orderItems, shippingAddress: required }),
        });
        if (!session.url) throw new Error("Stripe checkout could not be started");
        window.location.assign(session.url);
        return;
      }

      const data = await api<{ order: Order }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: required,
          paymentMethod,
        }),
      });
      clearCart();
      router.push(`/order-success?id=${data.order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      setSubmitting(false);
    }
  }

  const input =
    "h-11 w-full border border-line bg-white px-3 text-sm outline-none focus:border-muted";
  const label = "mb-1 block text-xs uppercase tracking-[0.15em] text-muted";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl">{t("title")}</h1>

      <form onSubmit={placeOrder} className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          {/* Contact */}
          <section>
            <h2 className="font-display text-xl">{t("contactTitle")}</h2>
            <p className="mt-1 text-sm text-muted">{t("contactBody", { email: user?.email || "" })}</p>
          </section>

          {/* Shipping address */}
          <section>
            <h2 className="font-display text-xl">{t("shippingTitle")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={label}>{t("fullName")}</label>
                <input
                  className={input}
                  value={address.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  required
                  placeholder="Jane Doe"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>{t("line1")}</label>
                <input
                  className={input}
                  value={address.line1}
                  onChange={(e) => update("line1", e.target.value)}
                  required
                  placeholder="House no, street, area"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={label}>{t("line2")}</label>
                <input
                  className={input}
                  value={address.line2}
                  onChange={(e) => update("line2", e.target.value)}
                  placeholder="Apartment, landmark"
                />
              </div>
              <div>
                <label className={label}>{t("city")}</label>
                <input
                  className={input}
                  value={address.city}
                  onChange={(e) => update("city", e.target.value)}
                  required
                  placeholder="Bengaluru"
                />
              </div>
              <div>
                <label className={label}>{t("state")}</label>
                <input
                  className={input}
                  value={address.state}
                  onChange={(e) => update("state", e.target.value)}
                  required
                  placeholder="Karnataka"
                />
              </div>
              <div>
                <label className={label}>{t("pincode")}</label>
                <input
                  className={input}
                  value={address.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  required
                  pattern="[0-9]{6}"
                  placeholder="560001"
                />
              </div>
              <div>
                <label className={label}>{t("phone")}</label>
                <input
                  className={input}
                  value={address.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-display text-xl">{t("paymentTitle")}</h2>
            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 border border-line bg-white p-4">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-dark"
                />
                <span className="text-sm">{t("cod")}</span>
                <span className="ml-auto text-xs text-muted">{t("codDesc")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 border border-line bg-white p-4">
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                  className="accent-dark"
                />
                <span className="text-sm">{t("card")}</span>
                <span className="ml-auto text-xs text-muted">{t("cardDesc")}</span>
              </label>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-line bg-white p-6">
          <h2 className="font-display text-xl">{t("orderTitle")}</h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-cream/40">
                  {item.image && (
                    <Image src={imageUrl(item.image)} alt={item.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.color && <span className="mr-2">{item.color}</span>}
                    {item.size && <span>{item.size}</span>} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatINR(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">{ts("subtotal")}</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{ts("shipping")}</dt>
              <dd>
                {shippingFee === 0 ? <span className="text-green-700">{tc("free")}</span> : formatINR(shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-medium">
              <dt>{ts("total")}</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <Button type="submit" disabled={submitting} className="mt-6 w-full">
            {submitting ? t("placingOrder") : t("placeOrder", { total: formatINR(total) })}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            <Link href="/cart" className="underline underline-offset-2">
              {t("editCart")}
            </Link>
          </p>
        </aside>
      </form>
    </div>
  );
}