import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link / useRouter / usePathname for storefront routes.
// Importing next/link or next/navigation directly inside the storefront
// would lose the locale prefix — use these instead.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);