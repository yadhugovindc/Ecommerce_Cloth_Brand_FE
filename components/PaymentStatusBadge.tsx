import { useTranslations } from "next-intl";

const PAYMENT_KEY: Record<string, string> = {
  paid: "paid",
  pending: "pending",
  failed: "failed",
  refunded: "refunded",
};

const badgeStyles: Record<string, string> = {
  paid: "border-green-200 bg-green-50 text-green-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  failed: "border-red-200 bg-red-50 text-red-600",
  refunded: "border-line bg-cream/60 text-muted",
};

/** Colored pill reflecting an order's paymentStatus; green check for paid. */
export default function PaymentStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const t = useTranslations("paymentStatus");
  const key = PAYMENT_KEY[status] ?? "pending";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-0.5 text-xs font-medium ${badgeStyles[key]} ${className}`}
    >
      {key === "paid" && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          aria-hidden
        >
          <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {t(key)}
    </span>
  );
}
