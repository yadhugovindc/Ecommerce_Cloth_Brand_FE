# ATELIER — Storefront (Next.js)

Next.js 16 + TypeScript + Tailwind CSS storefront for the ATELIER clothing
brand. Client-side cart state, server-backed auth and orders.

## Setup

```bash
npm install
cp .env.example .env.local   # if NEXT_PUBLIC_API_URL differs
npm run dev                  # http://localhost:3000
```

The backend must be running on `http://localhost:5000` (see `backend/`).

## Env

| Variable                | Default                    |
| ----------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL`   | `http://localhost:5000/api`|

The assistant UI sends messages to the backend `POST /api/chat` endpoint. Configure
OpenRouter credentials in the backend environment; see `backend/README.md`.

## Pages

| Route                 | Description                              |
| --------------------- | ---------------------------------------- |
| `/`                   | Home — hero, categories, best sellers, new arrivals |
| `/shop`               | Shop with category / price filters, search, sort |
| `/product/[slug]`     | Product detail — size/color/quantity, add to cart |
| `/cart`               | Cart with quantity controls + summary    |
| `/checkout`           | Address form → places order (sign in required) |
| `/order-success`      | Order confirmation by `?id=`             |
| `/orders`             | My orders list                           |
| `/login` `/register`  | Auth pages (httpOnly cookie via API)     |
| `/admin`              | Admin dashboard (admins only)            |
| `/admin/products`     | Product list, create/edit/delete          |
| `/admin/products/new` · `/admin/products/[id]/edit` | Product form with image upload |
| `/admin/orders`       | All orders + status filter                |
| `/admin/orders/[id]`  | Order detail, update fulfilment/payment   |
| `/admin/categories`   | Manage categories                         |

## Structure

```
app/            # routes (App Router)
components/     # Header, Footer, ProductCard, ProductGrid, Button…
context/        # CartContext (localStorage), AuthContext (API)
lib/            # api client, product helpers, formatting
types/          # shared TS types
public/images/  # placeholder product artwork (SVG)
```

Design follows the ATELIER system: background `#F7F5F0`, ink `#1A1815`,
cream `#E8DCC7`, serif display type (Fraunces) + Inter body.

## Admin

The admin section lives under `/admin` (layout is separated from the storefront
via the `(store)` route group). Sign in with the seeded admin account
(`admin@atelier.com` / `admin123`), then open `/admin` from the account menu or
navigate there directly — non-admins are redirected/blocked.

Uploaded product images are stored by the backend in `backend/uploads/` and
served at `http://localhost:5000/uploads/...` (allowlisted in `next.config.ts`).

## Languages (i18n)

The storefront supports **English** and **Malayalam** via `next-intl`.

- Locale-aware URLs: every storefront route exists under `/en/…` and `/ml/…`
  (e.g. `/ml/shop`). `/` redirects to the default locale; `/admin` stays
  unlocalized.
- Switching: use the **EN / ML** button in the header. The choice is kept in
  the `NEXT_LOCALE` cookie, so later visits and unprefixed links stay in the
  selected language.
- Add a language: create `messages/<locale>.json` (copy `en.json`), add the
  locale to `locales` in `i18n/routing.ts`, and everything else follows.

```
i18n/
├── routing.ts      # locales, defaultLocale
├── navigation.ts   # locale-aware Link / useRouter / usePathname
└── request.ts      # loads messages for the request locale
messages/
├── en.json
└── ml.json         # Malayalam UI strings
proxy.ts            # Next 16 locale middleware/redirects
```

Storefront code imports `Link`/`useRouter` from `@/i18n/navigation` (not
`next/link` / `next/navigation`) so links keep the locale prefix. Text lives in
`messages/*.json` and is read with `useTranslations`/`getTranslations`.

## Notes

- Cart is stored client-side in `localStorage` (guest friendly). Placing an
  order requires sign-in; stock is decremented server-side.
- Products are fetched client-side from the backend API — the backend must be
  up for data to appear.
- Category names, product names/descriptions and review content come from the
  database and are not translated.
