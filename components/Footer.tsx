import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations("footer");
  const th = await getTranslations("header");

  const SHOP_LINKS = [
    { label: th("women"), href: "/shop?category=women" },
    { label: th("men"), href: "/shop?category=men" },
    { label: th("dresses"), href: "/shop?category=dresses" },
    { label: th("shopAll"), href: "/shop" },
  ];

  const HELP_LINKS = [
    { label: t("contact"), href: "/contact" },
    { label: t("sizeGuide"), href: "/size-guide" },
    { label: t("shipping"), href: "/shipping-returns" },
  ];

  return (
    <footer className="mt-24 border-t border-line bg-dark text-bg">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <p className="font-display text-xl tracking-[0.35em]">ATELIER</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-bg/60">{t("tagline")}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bg/50">{t("shopTitle")}</p>
          <ul className="mt-4 space-y-3">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-bg/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bg/50">{t("helpTitle")}</p>
          <ul className="mt-4 space-y-3">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-bg/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-bg/50">{t("newsletterTitle")}</p>
          <p className="mt-4 text-sm text-bg/80">{t("newsletterText")}</p>
          <p className="mt-6 text-xs text-bg/40">{t("rights", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}