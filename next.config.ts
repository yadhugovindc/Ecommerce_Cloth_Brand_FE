import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Product uploads may be SVG; without this the optimizer 400s on them.
    dangerouslyAllowSVG: true,
    // The local backend resolves to localhost/127.0.0.1 during development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Product images uploaded through the admin API
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);