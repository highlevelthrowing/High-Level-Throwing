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
 * Drops only the escape runs that fail to decode on their own, so a valid
 * `%C2%AE` elsewhere in the same path survives untouched. Returns null when
 * nothing could be repaired.
 */
export function repairPath(pathname: string): string | null {
  if (pathDecodes(pathname)) return null;

  const repaired = pathname.replace(/(?:%[0-9A-Fa-f]{2})+/g, (run) => {
    try {
      decodeURIComponent(run);
      return run;
    } catch {
      return "";
    }
  });

  if (repaired === pathname || !pathDecodes(repaired)) return null;
  return repaired;
}
