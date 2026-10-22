#!/usr/bin/env python3
"""
Run: python3 scripts/article-image-check.py

Austin's rule: no image is ever used by more than one article. That covers both
the cover shown on /articles and every photo embedded in an article body, and it
has to hold across the whole blog, not just the most recent batch — so this
checks all of them and exits non-zero if any image appears twice.

Also lists site images no article has claimed yet, so the next article has a
pool to choose from instead of reaching for one already in use.
"""
import json, os, re, sys, urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def env(name):
    for line in open(os.path.join(ROOT, ".env.local"), encoding="utf-8"):
        if line.startswith(name + "="):
            return line.split("=", 1)[1].strip()
    return None

DOMAIN = env("SHOPIFY_STORE_DOMAIN")
TOKEN = env("SHOPIFY_STOREFRONT_ACCESS_TOKEN")
VERSION = env("SHOPIFY_API_VERSION") or "2025-01"
HEADER = ("Shopify-Storefront-Private-Token" if TOKEN.startswith("shpat_")
          else "X-Shopify-Storefront-Access-Token")

QUERY = """
query($after: String) {
  blog(handle: "news") {
    articles(first: 50, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { title handle contentHtml }
    }
  }
}"""

def fetch_articles():
    out, after = [], None
    while True:
        req = urllib.request.Request(
            f"https://{DOMAIN}/api/{VERSION}/graphql.json",
            data=json.dumps({"query": QUERY, "variables": {"after": after}}).encode(),
            headers={"Content-Type": "application/json", HEADER: TOKEN})
        with urllib.request.urlopen(req) as r:
            d = json.load(r)
        a = d["data"]["blog"]["articles"]
        out += a["nodes"]
        if not a["pageInfo"]["hasNextPage"]:
            return out
        after = a["pageInfo"]["endCursor"]

IMG = re.compile(r"/images/([A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp))", re.I)

owners = defaultdict(set)          # image -> {article labels}

# covers declared on the articles page
page = open(os.path.join(ROOT, "src/app/articles/page.tsx"), encoding="utf-8").read()
for block in re.findall(r"\{[^{}]*?href:\s*\"([^\"]+)\"[^{}]*?\}", page, re.S):
    pass
for m in re.finditer(r"image:\s*\"/images/([^\"]+)\"[\s\S]{0,200}?href:\s*\"([^\"]+)\"", page):
    owners[m.group(1)].add("cover:" + m.group(2).rsplit("/", 1)[-1])

# photos embedded in every article body
articles = fetch_articles()
for a in articles:
    for name in set(IMG.findall(a["contentHtml"] or "")):
        owners[name].add("body:" + a["handle"])

# Two different problems, so report them apart. An image used as a cover and
# again inside that same article only repeats a picture for one reader; the same
# image in two different articles is the rule Austin actually cares about.
def article_of(label):
    return label.split(":", 1)[1]

cross, within = {}, {}
for img, who in owners.items():
    if len(who) < 2:
        continue
    if len({article_of(w) for w in who}) > 1:
        cross[img] = sorted(who)
    else:
        within[img] = sorted(who)

print(f"articles checked : {len(articles)}")
print(f"images claimed   : {len(owners)}")

if cross:
    print(f"\nFAIL - {len(cross)} image(s) shared by DIFFERENT articles:")
    for img, who in sorted(cross.items()):
        print(f"  {img}")
        for w in who:
            print(f"      {w}")
else:
    print("\nok - no image is shared between two articles")

if within:
    print(f"\nnote - {len(within)} image(s) used as both cover and body of the same article:")
    for img, who in sorted(within.items()):
        print(f"  {img}  ({article_of(who[0])})")

local = {f for f in os.listdir(os.path.join(ROOT, "public/images"))
         if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))}
free = sorted(local - set(owners))
print(f"\nunclaimed images available for the next article: {len(free)}")
for f in free[:25]:
    print("   ", f)
if len(free) > 25:
    print(f"    ... and {len(free)-25} more")

sys.exit(1 if cross else 0)
