import { formatINR } from "@/lib/format";
import { effectivePrice } from "@/types";

export default function Price({
  price,
  discountPrice,
  className = "",
  size = "md",
}: {
  price: number;
  discountPrice?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const onSale = discountPrice && discountPrice < price;
  const effective = effectivePrice({ price, discountPrice });

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <span className={`${textSizes[size]} ${className}`}>
      <span className="font-medium">{formatINR(effective)}</span>
      {onSale && (
        <span className="ml-2 text-sm text-muted line-through">
          {formatINR(price)}
        </span>
      )}
    </span>
  );
}