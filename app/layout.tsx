import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ATELIER — Quiet Luxury Clothing",
    template: "%s · ATELIER",
  },
  description:
    "ATELIER is a premium clothing store — timeless essentials in natural fabrics. Shop women, men, dresses and more.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { var theme = localStorage.getItem('atelier-theme'); if (!theme) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; } catch {}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}