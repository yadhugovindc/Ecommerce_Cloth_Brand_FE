"use client";

import { Suspense, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter as useNextRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const nextRouter = useNextRouter();
  const i18nRouter = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const next = searchParams.get("next") || "/";

  const t = useTranslations("auth");
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      if (next.startsWith("/admin")) {
        // /admin lives outside the locale segment — navigate with next/navigation
        nextRouter.push(next);
      } else {
        i18nRouter.push(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setSubmitting(false);
    }
  }

  const input =
    "h-11 w-full border border-line bg-white px-3 text-sm outline-none focus:border-muted";
  const label = "mb-1 block text-xs uppercase tracking-[0.15em] text-muted";

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-center font-display text-4xl">{t("signInTitle")}</h1>
      <p className="mt-3 text-center text-sm text-muted">{t("signInSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className={label}>{t("email")}</label>
          <input
            type="email"
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className={label}>{t("password")}</label>
          <input
            type="password"
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t("signingIn") : t("submitSignIn")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <a
          href={`/${locale}/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="underline underline-offset-2"
        >
          {t("createLink")}
        </a>
      </p>
      <p className="mt-6 text-center text-xs text-muted">{t("demo")}</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen animate-pulse bg-cream/40" />}>
      <LoginForm />
    </Suspense>
  );
}