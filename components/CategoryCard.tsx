import { Link } from "@/i18n/navigation";
import type { Category } from "@/types";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative block overflow-hidden bg-cream/50"
    >
      <div className="flex aspect-[3/4] items-end p-5">
        <div>
          <p className="font-display text-2xl tracking-wide group-hover:underline">
            {category.name}
          </p>
          {category.description && (
            <p className="mt-1 text-sm text-muted">{category.description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}