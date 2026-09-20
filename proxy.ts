import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed the "middleware" convention to "proxy".
export default createMiddleware(routing);

export const config = {
  // All routes except the API, Next internals, the (unlocalized) admin
  // section, and files with extensions.
  matcher: ["/", "/((?!api|_next|admin|.*\\..*).*)"],
};