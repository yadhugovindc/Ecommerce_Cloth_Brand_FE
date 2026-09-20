import type { Product } from "@/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  cols = 4,
}: {
  products: Product[];
  cols?: 2 | 3 | 4;
}) {
  const colClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted">
        No products found. Try adjusting your filters.
      </p>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-x-6 gap-y-10 ${colClasses[cols]}`}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}