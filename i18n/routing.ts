import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ml"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];