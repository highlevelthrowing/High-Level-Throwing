# High Level Throwing — Headless Storefront

A headless storefront for [highlevelthrowing.com](https://highlevelthrowing.com), built with Next.js (App Router)
and the Shopify Storefront API. This replaces the old static HTML pages (`index.html`,
`college-consulting.html`, `high-level-throwing-showcase.html`) with a real, componentized site that can also
sell products directly against the existing Shopify store.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) — deploys cleanly to Vercel, same host as before.
- **Shopify Storefront API** (GraphQL) — product catalog, cart, and checkout handoff. No Shopify theme/Liquid
  involved; this is a fully decoupled frontend.
- Plain CSS design system in `src/app/globals.css`, ported 1:1 from the original site's black / lime (`#c6ff2e`) /
  pink (`#ff2ecb`) / sky (`#38bdf8`) look.

## Pages

| Route | Content |
|---|---|
| `/` | Home — Clinics & On-Site Sessions (was `index.html`) |
| `/college-consulting` | College Consulting (was `college-consulting.html`) |
| `/showcase` | Program Partnership (was `high-level-throwing-showcase.html`) |
| `/shop` | Product grid, pulled live from Shopify |
| `/products/[handle]` | Product detail page, add to cart |
| `/cart` | Cart, quantity/remove, hands off to Shopify checkout |

## Connecting to Shopify

The site runs without any Shopify credentials — the marketing pages work, and `/shop`, `/products/*`, and `/cart`
show a "Connect this storefront to Shopify" notice until you configure it.

1. Copy the env file:
   ```
   cp .env.local.example .env.local
   ```
2. In Shopify Admin: **Settings → Apps and sales channels → Develop apps → Create an app**.
3. Under **Configuration**, set Storefront API scopes to at least:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_checkouts` / `unauthenticated_write_checkouts` (or the newer `_carts` equivalents)
4. Install the app, then reveal the **Storefront API access token**.
5. Fill in `.env.local`:
   - `SHOPIFY_STORE_DOMAIN` — your `*.myshopify.com` domain (not the custom domain).
   - `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — the token from step 4.
6. Restart the dev server.

Cart state is stored in an httpOnly cookie holding the Shopify cart ID — no separate database needed. Checkout is
handed off to Shopify's own hosted checkout (`cart.checkoutUrl`), so payments, taxes, and shipping continue to be
handled by Shopify exactly as they are today.

## Development

```
npm install
npm run dev
```

## What's intentionally not migrated yet

- The `/pages/contact` and `/pages/leaderboard` links still point at the existing `highlevelthrowing.com` Shopify
  pages rather than being rebuilt here — call these out if you want them pulled into the headless site too.
- Product reviews, blog/content pages, and account/login are not part of this build.
- Deployment: point a new Vercel project at this `storefront/` directory (or move it to the repo root) and set the
  two `SHOPIFY_*` env vars in Vercel's project settings before going live.
