#!/usr/bin/env python3
"""Check a clinic page cloned from another one, and write the fix for it.

Copying an existing clinic page is the fast way to make a new one, and it is
how every page on this store was built. The cost is that the copy keeps the
old clinic's product links: on 2026-10-26 all eight live pages were selling
the wrong session, several of them another city's.

Give this the new page's handle and it will tell you exactly what each button
sells, what it should sell, and print the entry to paste into
PAGE_BUTTON_BY_LABEL in src/app/api/embed/[...path]/route.ts.

    python3 scripts/new-clinic.py high-level-throwing-clinic-austin-tx-may-2027

It matches on product TITLES, never handles. Handles on this store say
nothing about what a product is — Houston's sessions live under katy-tx
handles, Poland's under warren-oh, Lebanon's "Session 3" under a session-1
handle. Pass --city to search titles for something other than the city
guessed from the handle (Fresno's products are titled Clovis, for instance).
"""
import argparse
import html as H
import json
import os
import re
import sys
import urllib.request

SITE = "https://www.highlevelthrowing.com"
PAIR = re.compile(r'<div\s+class="maintxt_0">([\s\S]*?)<div\s+class="maintxt_1">([\s\S]*?)</div>')


def shopify(query):
    domain = os.environ.get("SHOPIFY_STORE_DOMAIN")
    token = os.environ.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
    if not domain or not token:
        sys.exit("set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN first:\n"
                 "  set -a && . ./.env.local && set +a")
    version = os.environ.get("SHOPIFY_API_VERSION", "2025-01")
    key = "Shopify-Storefront-Private-Token" if token.startswith("shpat_") else "X-Shopify-Storefront-Access-Token"
    req = urllib.request.Request(
        f"https://{domain}/api/{version}/graphql.json",
        data=json.dumps({"query": query}).encode(),
        headers={"Content-Type": "application/json", key: token},
    )
    return json.load(urllib.request.urlopen(req, timeout=40))["data"]


def page_rows(handle):
    """Each (label, linked handle) on the page, in the order they render."""
    url = f"{SITE}/api/embed/{handle}"
    try:
        doc = urllib.request.urlopen(url, timeout=40).read().decode("utf-8", "replace")
    except Exception as exc:
        sys.exit(f"could not load {url}\n  {exc}")
    if len(doc) < 2000:
        sys.exit(f"{url} returned almost nothing — is the handle right?")
    out = []
    for m in PAIR.finditer(doc):
        label = re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))).strip()
        href = re.search(r"/products/([a-z0-9-]+)", m.group(2))
        if not label and not href:
            continue
        out.append((label, href.group(1) if href else ""))
    return out


def city_from(handle):
    rest = handle.replace("high-level-throwing-clinic-", "")
    parts = [p for p in rest.split("-") if not re.fullmatch(r"\d{4}|[a-z]{2}", p)]
    stop = {"january", "february", "march", "april", "may", "june", "july",
            "august", "september", "october", "november", "december"}
    words = [p for p in parts if p not in stop]
    return " ".join(words).title()


def session_number(text):
    found = re.search(r"Session\s*(\d+)", text or "", re.I)
    return found.group(1) if found else None


def label_key(label):
    m = re.match(r"((?:Player |Coach )?Session\s*\d+)", label)
    if m:
        return m.group(1)
    if "coach" in label.lower():
        return "Coach Access"
    if "athlete registration" in label.lower():
        return "Athlete Registration"
    return label[:26]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("handle")
    ap.add_argument("--city", help="search product titles for this instead of the city in the handle")
    args = ap.parse_args()

    handle = args.handle.strip().strip("/").split("/")[-1]
    city = args.city or city_from(handle)

    rows = page_rows(handle)
    print(f"\npage   {handle}")
    print(f"city   searching product titles for {city!r}"
          f"{'' if args.city else '   (override with --city)'}\n")

    pool = shopify('{ products(first:60, query:"title:*%s*"){ nodes{ handle title } } }' % city)["products"]["nodes"]
    if not pool:
        sys.exit(f"no products have {city!r} in their title. Try --city with the name used on the products.")

    linked = sorted({h for _, h in rows if h})
    titles = {}
    for i in range(0, len(linked), 20):
        chunk = linked[i:i + 20]
        q = "{" + " ".join(f'p{j}: product(handle: "{h}") {{ handle title }}' for j, h in enumerate(chunk)) + "}"
        for v in shopify(q).values():
            if v:
                titles[v["handle"]] = v["title"]

    entries, problems, orphans, undecided = [], [], 0, []
    print(f"  {'LABEL ON THE PAGE':<42} {'SELLS NOW':<30} {'SHOULD SELL'}")
    print("  " + "-" * 104)
    for label, cur in rows:
        if not label:
            orphans += 1
            continue
        now = titles.get(cur, "(nothing)" if not cur else f"?? {cur}")
        if "coach" in label.lower():
            want = [p for p in pool if "coach" in p["title"].lower()]
        else:
            n = session_number(label)
            want = [p for p in pool if session_number(p["title"]) == n and "coach" not in p["title"].lower()] if n \
                else [p for p in pool if "coach" not in p["title"].lower()]
        if len(want) == 1:
            target = want[0]
            entries.append((label_key(label), target["handle"]))
            ok = now == target["title"]
            if not ok:
                problems.append(label)
            print(f"  {'ok ' if ok else 'BAD'} {label[:38]:<38} {now[:28]:<30} {target['title'][:40]}")
        else:
            problems.append(label)
            hint = "pick one below" if want else "no product matches this label"
            print(f"  ??  {label[:38]:<38} {now[:28]:<30} {hint}")
            # Never guess between candidates — guessing is how the wrong-session
            # bug survived three repair attempts. Show them and let a human choose.
            for p_ in want:
                undecided.append((label_key(label), p_["handle"], p_["title"]))
                print(f"      - {p_['title'][:62]}")
                print(f"        {p_['handle']}")

    print()
    if orphans:
        print(f"  {orphans} button(s) have no label above them — the copied template's extra first block.")
        print(f"  Add this handle to STRANDED_FIRST_BUTTON in the embed route to hide it.\n")
    if not problems and not orphans:
        print("  Nothing to do — every button already sells what its label says.\n")
        return 0

    print("  Paste into PAGE_BUTTON_BY_LABEL in src/app/api/embed/[...path]/route.ts:\n")
    print(f'  "{handle}": [')
    for key, target in entries:
        print(f'    ["{key}", "{target}"],')
    for key, h_, t_ in undecided:
        print(f'    // choose one for "{key}":  {t_[:56]}')
        print(f'    // ["{key}", "{h_}"],')
    print("  ],\n")
    print("  Then: npx next build && git push, and re-run scripts/clinic-button-check.py\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
