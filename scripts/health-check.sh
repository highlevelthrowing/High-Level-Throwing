#!/usr/bin/env bash
# Storefront health check.
#
# Every assertion here exists because something actually broke in production.
# Add to it when something new does; do not add speculative checks.
#
#   ./scripts/health-check.sh            # production
#   SITE=http://localhost:3000 ./...     # a local build
#
# Exits non-zero if anything fails, so it can gate a deploy.

set -uo pipefail
SITE="${SITE:-https://www.highlevelthrowing.com}"
fails=0
pass(){ printf '  \033[32mok\033[0m   %s\n' "$1"; }
fail(){ printf '  \033[31mFAIL\033[0m %s\n' "$1"; fails=$((fails+1)); }

PAGES=( "" shop books cart video-assessment clinics leaderboard articles about
        products/lightning-ball-plyo-set products/softball-throwing-book
        products/hlt-softball-bundle )

# Registration pages are proxied, so they carry their own failure modes.
EMBEDS=( high-level-throwing-clinic-lebanon-in-2026
         high-level-throwing-clinic-tracy-ca-december-2026
         high-level-throwing-clinic-houston-tx-november-2026 )

echo "health check: $SITE"
echo
echo "pages respond"
for p in "${PAGES[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE/$p")
  [ "$code" = "200" ] && pass "/$p" || fail "/$p returned $code"
done

echo
echo "registration pages respond"
for h in "${EMBEDS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE/pages/$h")
  [ "$code" = "200" ] && pass "/pages/$h" || fail "/pages/$h returned $code"
done

echo
echo "no Shopify analytics in proxied markup"
# These post to myshopify.com/api/collect. Cross-origin from this domain, so
# every beacon is refused and the bundle retries until the page stalls.
for h in "${EMBEDS[@]}"; do
  body=$(curl -s "$SITE/api/embed/$h")
  bad=""
  for pat in wpmLoader trekkie shopify-perf-kit "api/collect"; do
    grep -q "$pat" <<<"$body" && bad="$bad $pat"
  done
  [ -z "$bad" ] && pass "$h clean" || fail "$h still ships:$bad"
done

echo
echo "proxied pages kept what they need"
for h in "${EMBEDS[@]}"; do
  body=$(curl -s "$SITE/api/embed/$h")
  missing=""
  for pat in global.js sections-script "/products/"; do
    grep -q "$pat" <<<"$body" || missing="$missing $pat"
  done
  [ -z "$missing" ] && pass "$h intact" || fail "$h lost:$missing"
done

echo
echo "scroll lock and pop-up suppression are in the stylesheet"
# Klaviyo locks <body> when its form opens. Where the form is hidden the lock
# must be overridden or the page silently stops scrolling.
# Next hashes this filename and the alphabet has included hyphens since the
# chunk move, so the class has to allow them — a too-narrow pattern here fails
# the check while the site is perfectly healthy.
css=$(curl -s "$SITE" | grep -oE '/_next/static/(chunks|css)/[A-Za-z0-9_-]+\.css' | head -1)
if [ -z "$css" ]; then
  fail "could not find the stylesheet"
else
  sheet=$(curl -s "$SITE$css")
  # The `html ` prefix is the whole point. Klaviyo ships the identical selector
  # body.klaviyo-prevent-body-scrolling{overflow:hidden!important} from its own
  # CDN, injected after ours, so without the extra qualifier theirs wins on
  # equal specificity and the page silently freezes. Grepping for the class
  # alone passed while the site was broken, which is how this was missed.
  grep -q 'html body\.klaviyo-prevent-body-scrolling' <<<"$sheet" \
    && pass "scroll-lock override outranks Klaviyo" \
    || fail "scroll-lock override MISSING or too weak to beat Klaviyo"
  grep -q 'no-klaviyo-forms' <<<"$sheet" \
    && pass "pop-up suppression present" || fail "pop-up suppression MISSING"
fi

echo
echo "internal links resolve"
all=$(for p in "" shop books clinics video-assessment; do curl -s "$SITE/$p"; done)
links=$(grep -o 'href="/[^"#?]*"' <<<"$all" | sed 's/href="//;s/"//' | sort -u | grep -v '^/$')
broken=0
while read -r l; do
  [ -z "$l" ] && continue
  code=$(curl -s -o /dev/null -w '%{http_code}' "$SITE$l")
  [ "$code" = "200" ] || { fail "$l -> $code"; broken=$((broken+1)); }
done <<<"$links"
[ "$broken" = "0" ] && pass "$(wc -l <<<"$links" | tr -d ' ') links all 200"

echo
if [ "$fails" -gt 0 ]; then echo "FAILED: $fails check(s)"; exit 1; fi
echo "all checks passed"
