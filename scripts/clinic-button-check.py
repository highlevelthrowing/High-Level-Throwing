#!/usr/bin/env python3
"""Every registration button must buy the session its own label names.

Eight clinic pages were found selling the wrong session on 2026-10-26: each
was copied from one template whose blocks are shifted by a row, so "Session 1"
bought Session 2, and the last row bought a coach pass or another clinic's
product entirely. Pages had taken real orders in that state.

The check compares the label rendered above each button against the TITLE of
the product it links to. It deliberately ignores handles: Houston's sessions
live under katy-tx handles, Poland's under warren-oh, Fresno's December
products under fresno-* handles with Clovis titles, and Lebanon's product
titled "Session 3" has a handle saying session-1. A handle says nothing
reliable about what a product is, and trusting them is what hid this for so
long.

Run with no arguments. Exits non-zero on any mismatch.
"""
import html as H
import json
import os
import re
import sys
import urllib.request

SITE = "https://www.highlevelthrowing.com"
PAIR = re.compile(r'<div\s+class="maintxt_0">([\s\S]*?)<div\s+class="maintxt_1">([\s\S]*?)</div>')


def clinic_pages():
    """The clinic pages currently linked from /clinics."""
    page = urllib.request.urlopen(f"{SITE}/clinics", timeout=40).read().decode("utf-8", "replace")
    return sorted(set(re.findall(r"/pages/(high-level-throwing-clinic-[a-z0-9-]+)", page)))


def rows(handle):
    url = f"{SITE}/api/embed/{handle}"
    doc = urllib.request.urlopen(url, timeout=40).read().decode("utf-8", "replace")
    for m in PAIR.finditer(doc):
        label = re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", m.group(1)))).strip()
        href = re.search(r"/products/([a-z0-9-]+)", m.group(2))
        if not label and not href:
            continue
        yield label, (href.group(1) if href else "")


def titles(handles):
    domain = os.environ["SHOPIFY_STORE_DOMAIN"]
    token = os.environ["SHOPIFY_STOREFRONT_ACCESS_TOKEN"]
    version = os.environ.get("SHOPIFY_API_VERSION", "2025-01")
    key = "Shopify-Storefront-Private-Token" if token.startswith("shpat_") else "X-Shopify-Storefront-Access-Token"
    out = {}
    handles = sorted(handles)
    for i in range(0, len(handles), 20):
        chunk = handles[i:i + 20]
        query = "{" + " ".join(
            f'p{j}: product(handle: "{h}") {{ handle title }}' for j, h in enumerate(chunk)
        ) + "}"
        req = urllib.request.Request(
            f"https://{domain}/api/{version}/graphql.json",
            data=json.dumps({"query": query}).encode(),
            headers={"Content-Type": "application/json", key: token},
        )
        for value in json.load(urllib.request.urlopen(req, timeout=40))["data"].values():
            if value:
                out[value["handle"]] = value["title"]
    return out


def session_number(text):
    found = re.search(r"Session\s*(\d+)", text or "", re.I)
    return found.group(1) if found else None


def main():
    pages = clinic_pages()
    if not pages:
        print("could not read any clinic pages from /clinics")
        return 1

    collected = {page: list(rows(page)) for page in pages}
    known = titles({h for rs in collected.values() for _, h in rs if h})

    failures = []
    checked = 0
    for page, rs in collected.items():
        for label, handle in rs:
            checked += 1
            if not handle:
                failures.append((page, label, "no button at all"))
                continue
            title = known.get(handle)
            if not title:
                failures.append((page, label, f"links to a product that does not exist ({handle})"))
                continue
            label_coach = "coach" in label.lower()
            title_coach = "coach" in title.lower()
            if label_coach != title_coach:
                failures.append((page, label, f"buys {title}"))
                continue
            if label_coach:
                continue
            ln, tn = session_number(label), session_number(title)
            if ln and tn and ln != tn:
                failures.append((page, label, f"buys {title}"))

    print(f"clinic registration buttons: {checked} across {len(pages)} pages")
    if not failures:
        print("ok   every label buys the product its own title names")
        return 0
    print(f"FAIL {len(failures)} button(s) sell the wrong thing:\n")
    for page, label, why in failures:
        print(f"  [{page}]")
        print(f"      label: {label[:70]}")
        print(f"      {why[:90]}\n")
    return 1


if __name__ == "__main__":
    sys.exit(main())
