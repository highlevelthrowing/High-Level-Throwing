import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/shopify/pages";
import { isShopifyConfigured } from "@/lib/shopify/client";
import SimpleEmbed from "@/components/SimpleEmbed";
import ClinicWaitlist from "@/components/ClinicWaitlist";
import ClinicRegistration from "@/components/ClinicRegistration";
import { nativeClinic } from "@/lib/native-clinics";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  if (!isShopifyConfigured()) return { title: "High Level Throwing®" };
  const { handle } = await params;
  const decoded = decodeURIComponent(handle);
  const native = nativeClinic(decoded);
  if (native) {
    const title = `High Level Throwing Clinic - ${native.city} ${native.year}`;
    return {
      title,
      description:
        `High Level Throwing® clinic in ${native.city} on ${native.dayAndDate}, ${native.year}. ` +
        `${native.sessions.length} softball throwing sessions at ${native.venue.street}, ` +
        `${native.venue.cityLine}, run by Austin Wasserman.`,
      alternates: { canonical: `https://www.highlevelthrowing.com/pages/${native.handle}` },
    };
  }
  const page = await getPage(decoded).catch(() => null);
  return { title: page?.title ?? "High Level Throwing®" };
}

/**
 * Someone who lands on a city page and finds the wrong dates, the wrong age
 * group or a sold-out session currently leaves without a trace. The waitlist
 * catches them, and because it asks for a city it also says where to go next.
 * Every clinic registration page carries "clinic" in its handle; the schedule
 * page itself is served natively at /clinics, not through here.
 */
function isClinicRegistrationPage(handle: string): boolean {
  const h = decodeURIComponent(handle).toLowerCase();
  if (h === "clinics" || h === "sample-clinics") return false;
  return h.includes("clinic");
}

// Clinic pages (and other Shopify-authored pages) are built with theme sections
// rather than page body content, so there is nothing to render natively. They
// are embedded here so visitors stay on this site instead of being sent to the
// Shopify store.
export default async function ShopifyHostedPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const decoded = decodeURIComponent(handle);

  if (isShopifyConfigured()) {
    const page = await getPage(decoded).catch(() => null);
    if (!page) notFound();
  }

  // A clinic whose Shopify page has no clinic theme template renders as an
  // empty frame. Those are built here instead, from the record that also
  // supplies their product links.
  const native = nativeClinic(decoded);

  return (
    <>
      {native ? (
        <ClinicRegistration clinic={native} />
      ) : (
        <SimpleEmbed embedKey={handle} iframeTitle="High Level Throwing" height={2400} />
      )}
      {isClinicRegistrationPage(handle) && (
        <section id="clinic-waitlist" className="waitlist-break">
          <ClinicWaitlist />
        </section>
      )}
    </>
  );
}
