"use client";

import { useTranslations } from "next-intl";

export default function QuantitySelector({
  quantity,
  onChange,
  max = 99,
  size = "md",
}: {
  quantity: number;
  onChange: (q: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const t = useTranslations("quantity");
  const btn = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-base";

  return (
    <div className="inline-flex items-center border border-line bg-white">
      <button
        type="button"
        className={`${btn} hover:bg-bg disabled:opacity-30`}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label={t("decrease")}
      >
        −
      </button>
      <span className={`${size === "sm" ? "w-8" : "w-12"} text-center text-sm`}>
        {quantity}
      </span>
      <button
        type="button"
        className={`${btn} hover:bg-bg disabled:opacity-30`}
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        aria-label={t("increase")}
      >
        +
      </button>
    </div>
  );
}