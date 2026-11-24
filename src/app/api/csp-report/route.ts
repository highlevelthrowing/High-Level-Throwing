import { NextResponse } from "next/server";

/**
 * Collector for Content-Security-Policy violation reports.
 *
 * The policy ships in report-only mode, so nothing is ever blocked; browsers
 * just POST here describing what *would* have been. That is the point: this
 * site pulls scripts from Google, Meta, Klaviyo, Shopify, Vimeo, Tockify and
 * the velocity widget, and several of those inject further hosts at runtime
 * that never appear in the served HTML. Guessing the full list would mean
 * guessing wrong and breaking checkout or analytics; collecting it first makes
 * the real list observable.
 *
 * Reports land in the Vercel runtime logs. Read them there, fold any legitimate
 * host into the policy, then switch the header from report-only to enforcing.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Browsers send either the legacy {"csp-report": {...}} shape or the
    // Reporting API's array of {type, body}. Normalise enough to be readable.
    const legacy = body?.["csp-report"];
    const entries = Array.isArray(body) ? body : legacy ? [{ body: legacy }] : [body];

    for (const entry of entries) {
      const r = entry?.body ?? entry ?? {};
      const blocked = r["blocked-uri"] ?? r.blockedURL ?? "unknown";
      const directive = r["violated-directive"] ?? r.effectiveDirective ?? "unknown";
      const doc = r["document-uri"] ?? r.documentURL ?? "unknown";
      console.warn(`[csp-report] ${directive} blocked=${blocked} on=${doc}`);
    }
  } catch {
    console.warn("[csp-report] unparseable report body");
  }
  // 204: the browser does not care about the response, and an empty body keeps
  // these cheap however many arrive.
  return new NextResponse(null, { status: 204 });
}
