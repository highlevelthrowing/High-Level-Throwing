/**
 * `%AE` is a syntactically valid percent-escape that decodes to a byte which
 * cannot stand alone in UTF-8 — ® is `%C2%AE`, and something upstream (an old
 * email, a crawler, a link rewriter) drops the lead byte. Next decodes dynamic
 * route params before any handler runs, so the throw happens inside routing and
 * the visitor gets a 500 on what is really a bad URL.
 *
 * Deleting the undecodable escape is the right repair here rather than a
 * guess: the ® was removed from every product handle, so
 * `high-level-pitching%AE-youth` repairs to exactly `high-level-pitching-youth`.
 * Where it repairs to nothing real the route 404s on its own, which is the
 * honest answer for a malformed address.
 */
export function pathDecodes(pathname: string): boolean {
  try {
    decodeURIComponent(pathname);
    return true;
  } catch {
    return false;
  }
}

/**
 * Repairs the escape runs that fail to decode, leaving valid ones alone.
 *
 * A lone `%80`-`%BF` is a Latin-1 character that was percent-encoded without
 * being UTF-8 encoded first: byte 0xAE is U+00AE, ®, whose UTF-8 form is
 * `%C2%AE`. Restoring the dropped lead byte is a real transformation rather
 * than a guess, and it matters here — deleting the byte instead turns
 * `high-level-pitching%AE-bundle` into `high-level-pitching-bundle`, which is
 * a different live product (the $655 team bundle, not the $252 player/coach
 * one). Sending a buyer to the wrong product is worse than the 500 this is
 * replacing.
 *
 * Anything outside that range is dropped, which is the old behaviour and still
 * the right answer when the byte cannot be reconstructed.
 *
 * Returns null when nothing could be repaired.
 */
export function repairPath(pathname: string): string | null {
  if (pathDecodes(pathname)) return null;

  const repaired = pathname.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
    if (pathDecodes(run)) return run;

    // Re-encode a bare Latin-1 byte as the UTF-8 sequence it should have been.
    const rebuilt = run.replace(/%([89AaBb][0-9A-Fa-f])/g, (_m, hex) => `%C2%${hex}`);
    return pathDecodes(rebuilt) ? rebuilt : "";
  });

  if (repaired === pathname || !pathDecodes(repaired)) return null;
  return repaired;
}
