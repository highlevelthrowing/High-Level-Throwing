# Adding a clinic page by copying an existing one

Copying is the fast way and it is how every page on this store was made. The
catch is that the copy keeps the old clinic's product links, so the new page
sells the previous clinic's sessions until they are repointed.

On 26 October 2026 **all eight live registration pages were doing exactly
that** — Crystal Lake's "Player Session 7" sold a Houston coach pass,
Lebanon's "Coach Access" sold Livermore's. Several had taken real orders. Two
scripts exist so that cannot happen quietly again.

## After you copy a page

```bash
set -a && . ./.env.local && set +a
python3 scripts/new-clinic.py <the-new-page-handle>
```

It prints every button on the page, what it sells now, what it should sell,
and the block to paste into `PAGE_BUTTON_BY_LABEL` in
`src/app/api/embed/[...path]/route.ts`. Then `npx next build && git push`.

Three things it may tell you:

- **"Nothing to do"** — the copy was repointed correctly already.
- **"pick one below"** — two products could match, usually a coach row where
  both a *Coach Access* and a *COACH Session* product exist. It lists both
  with their handles and refuses to guess. Guessing is how the original bug
  survived three repair attempts.
- **"N button(s) have no label above them"** — the copied template carries an
  extra first block with a live button and no label. Add the page handle to
  `STRANDED_FIRST_BUTTON` in the same file and the row disappears.

If no products are found, the clinic's products are titled something other
than the city in the handle — Fresno's are titled *Clovis*. Pass the name
actually used on the products:

```bash
python3 scripts/new-clinic.py <handle> --city "Clovis"
```

## Listing it on /clinics

A clinic appears on `/clinics` from the Tockify feed. If its entry still says
*"Registration opens soon!"* with no link while the products are live, the
card shows with nothing to click. Either fix the calendar entry — better — or
add an override in `src/lib/clinics.ts`, keyed `YYYY-MM-DD|Title` exactly as
the schedule renders it:

```ts
"2026-12-29|Beaufort, SC": {
  blurb: "Registration is open!",
  registerHref: "/pages/high-level-throwing-clinic-beaufort-sc-december-2026",
  registerLabel: "Athlete & Coach Registration",
},
```

Point `registerHref` at our own page, never the `myshopify.com` one — the
Shopify page still carries the broken links; only our proxy repairs them.

## Before the clinic goes live

```bash
python3 scripts/clinic-button-check.py
```

Runs as part of `scripts/health-check.sh`. It reads every clinic page linked
from `/clinics` and fails if any label disagrees with the **title** of the
product it buys.

## The one rule worth remembering

**Identify a clinic product by its title, never its handle.** Handles on this
store are meaningless: Houston's November sessions live under `katy-tx`
handles, Poland's February 2027 under `warren-oh`, Fresno's December products
under `fresno-*` with Clovis titles, and Lebanon's product *titled* "Session
3" has a handle saying `session-1`. Reading pages by handle is what hid a
site-wide wrong-session bug.

## Set the product Category

Shopify assigns a Category to a new product by guessing from the title, and it
only gets it right sometimes — of five Littleton products created together,
one was categorised and four came back `null`. The field drives tax rates and
cross-channel search, so it is worth setting explicitly:

```
Sporting Goods > Athletics > Baseball & Softball
gid://shopify/TaxonomyCategory/sg-1-2
```

Every clinic product should carry it. `clinic-button-check.py` cannot verify
this — it runs on the Storefront API, which does not expose `category` at all;
that field is Admin-only. Check it in the Shopify admin, or with an Admin API
query, when you create the products.
