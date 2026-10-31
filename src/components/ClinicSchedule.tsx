import Image from "next/image";
import Link from "next/link";
import { formatClinicDate, getClinics } from "@/lib/clinics";
import { isClinicSoldOut } from "@/lib/clinic-products";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export default async function ClinicSchedule() {
  const schedule = await getClinics();

  // Asked for so a full clinic says so here rather than sending someone to a
  // page of unavailable buttons. Checked per clinic because each sells its own
  // products; all resolve together so one slow lookup does not hold up the rest.
  const clinics = await Promise.all(
    schedule.map(async (clinic) => {
      const page = clinic.registerHref?.startsWith("/pages/")
        ? clinic.registerHref.slice("/pages/".length)
        : null;
      return page ? { ...clinic, soldOut: await isClinicSoldOut(page) } : clinic;
    })
  );

  if (clinics.length === 0) {
    return (
      <p style={{ color: "var(--muted)", textAlign: "center" }}>
        Our schedule is being updated — <Link href="/contact" style={{ color: "var(--lime)", fontWeight: 700 }}>get in touch</Link>{" "}
        and we&apos;ll let you know what&apos;s coming to your area.
      </p>
    );
  }

  return (
    <>
      {/* Each upcoming clinic as an Event, so dates and locations can surface
          directly in search for people looking for a clinic near them. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: clinics.map((clinic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Event",
              name: `High Level Throwing® Clinic — ${clinic.title}`,
              startDate: clinic.start,
              endDate: clinic.end,
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: { "@type": "Place", name: clinic.title, address: clinic.title },
              image: clinic.image ?? undefined,
              description: clinic.blurb || "High Level Throwing® on-site clinic.",
              url: clinic.registerHref
                ? clinic.external
                  ? clinic.registerHref
                  : `${SITE_URL}${clinic.registerHref}`
                : `${SITE_URL}/clinics`,
              organizer: {
                "@type": "Organization",
                name: "High Level Throwing®",
                url: SITE_URL,
              },
            },
          })),
        }}
      />
      <div className="clinic-grid">
      {clinics.map((clinic) => (
        <article className="clinic-card" key={clinic.id}>
          <div className="clinic-card-media">
            {clinic.image ? (
              <Image
                src={clinic.image}
                alt={clinic.title}
                width={640}
                height={640}
                sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
              />
            ) : (
              <div className="clinic-card-media--empty" aria-hidden="true" />
            )}
          </div>

          <div className="clinic-card-body">
            <div className="clinic-card-when">{formatClinicDate(clinic)}</div>
            <h3 className="clinic-card-title">{clinic.title}</h3>
            {clinic.blurb && <p className="clinic-card-blurb">{clinic.blurb}</p>}

            {clinic.registerHref !== null && (
              <div className="clinic-card-action">
                {clinic.soldOut ? (
                  // Still a link: someone may want the details, or a coach
                  // pass that sold out after they were told about it.
                  <Link className="btn btn-soldout" href={clinic.registerHref}>
                    Sold out
                  </Link>
                ) : clinic.external ? (
                  <a className="btn btn-primary" href={clinic.registerHref} target="_blank" rel="noopener">
                    {clinic.registerLabel}
                  </a>
                ) : (
                  <Link className="btn btn-primary" href={clinic.registerHref}>
                    {clinic.registerLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
      </div>
    </>
  );
}
