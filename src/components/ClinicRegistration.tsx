import Image from "next/image";
import type { ClinicSession, NativeClinic } from "@/lib/native-clinics";
import { nativeClinicProducts } from "@/lib/native-clinics";
import { soldOutProducts } from "@/lib/clinic-products";
import ClinicRegisterLink from "./ClinicRegisterLink";

/**
 * A clinic registration page, rendered here rather than embedded from Shopify.
 *
 * Built to match the theme's clinic pages section for section — same order
 * (intro, venue, instructor, registration), same artwork, same black-and-green
 * palette — so a visitor moving between clinics sees one site. Copying the
 * theme template itself is not possible from here: writes to the published
 * theme are refused, so the layout is reproduced rather than cloned.
 *
 * Two differences are deliberate. Every label is built from the same record as
 * the product it links to, so the two cannot disagree — the drift that had
 * eight live pages selling the wrong session. And this is real HTML, not an
 * iframe a crawler reads as empty.
 */

const CDN = "https://cdn.shopify.com/s/files/1/0771/2948/2547/files";
const INSTRUCTOR = `${CDN}/Screen_Shot_2024-04-15_at_9.15.32_PM.png?v=1713230154`;

const FORMAT = [
  "Introduction + Discussion",
  "Dynamic Warm Up + Prep Drills",
  "Arm Care, Med Ball + HLT Patterns",
  "Drills & Progressions",
  "Overhand Throwing Velocity Testing",
  "Join the Velocity Leaderboard",
  "Win Prizes!",
];


/**
 * Event markup for a clinic, so a search result can carry the date, the venue
 * and whether a session is still buyable rather than just a blue link.
 *
 * One Event per clinic with an offer per session. Availability comes from the
 * same live lookup the buttons use, so a filled session is advertised as sold
 * out instead of drawing clicks that cannot convert.
 *
 * This renders a JSON-LD <script>, which browsers parse as data and never
 * execute — it cannot interfere with the analytics and pixels on the page.
 */
function ClinicJsonLd({
  clinic,
  rows,
}: {
  clinic: NativeClinic;
  rows: { label: string; product?: string; closed: boolean; price?: string; soldOut?: boolean }[];
}) {
  const SITE = "https://www.highlevelthrowing.com";
  const address = {
    "@type": "PostalAddress",
    ...(clinic.venue.street ? { streetAddress: clinic.venue.street } : {}),
    addressLocality: clinic.city.split(",")[0].trim(),
    addressRegion: clinic.city.split(",")[1]?.trim(),
    addressCountry: "US",
  };

  const data = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `High Level Throwing Clinic - ${clinic.city} ${clinic.year}`,
    startDate: clinic.isoDate,
    ...(clinic.endIsoDate ? { endDate: clinic.endIsoDate } : { endDate: clinic.isoDate }),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    sport: "Softball",
    image: [clinic.venueLogo.src.startsWith("http") ? clinic.venueLogo.src : SITE + clinic.venueLogo.src],
    description:
      `High Level Throwing® clinic in ${clinic.city} on ${clinic.dayAndDate}, ${clinic.year}. ` +
      `${clinic.sessions.length} throwing sessions` +
      (clinic.venue.name ? ` at ${clinic.venue.name}` : "") +
      ".",
    location: {
      "@type": "Place",
      name: clinic.venue.name ?? clinic.city,
      address,
    },
    organizer: { "@type": "Organization", name: "High Level Throwing®", url: SITE },
    performer: { "@type": "Person", name: "Austin Wasserman" },
    offers: rows
      .filter((r) => r.product)
      .map((r) => ({
        "@type": "Offer",
        name: r.label,
        url: `${SITE}/products/${r.product}`,
        // From the record, not scraped off the label — a coach pass has no
        // price in its wording and was being advertised at the session price.
        price: (r.price ?? "").replace(/[^0-9.]/g, "") || undefined,
        priceCurrency: "USD",
        availability: r.closed
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      })),
  };

  return (
    <script
      type="application/ld+json"
      // Built from this site's own clinic records; no visitor input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function ClinicRegistration({ clinic }: { clinic: NativeClinic }) {
  // Read live so a session that fills says so, and says the opposite again the
  // moment spots are added back.
  const soldOut = await soldOutProducts(nativeClinicProducts(clinic.handle));
  /**
   * One label per row, built from the same record as the product it links to
   * so the two cannot drift apart. Price, ages and the note are each optional:
   * a multi-day clinic carries its own day per session, a clinic that does not
   * split by age omits that part, and a closed session shows a note like
   * "PRIVATE TEAM SESSION" where the price would be.
   */
  const sessionLabel = (s: ClinicSession) => {
    const parts = [`${s.name}: ${s.day ?? clinic.dayAndDate} @ ${s.time}`];
    if (s.note) parts.push(`– ${s.note}`);
    else if (s.price) parts.push(`– ${s.price}`);
    if (s.ages) parts.push(`(${s.ages})`);
    const sport = s.sport ?? clinic.sport;
    if (sport) parts.push(`- ${sport}`);
    return parts.join(" ");
  };

  const rows = [
    ...clinic.sessions.map((s) => ({
      key: s.product ?? `${s.name}-${s.time}`,
      label: sessionLabel(s),
      product: s.product,
      price: s.price,
      closed: Boolean(s.closed) || (!!s.product && soldOut.has(s.product)),
      soldOut: !!s.product && soldOut.has(s.product),
    })),
    // A clinic whose coach pass is not sold separately points `coach` at a
    // session product; listing it again would sell the same thing twice.
    ...(clinic.sessions.some((s) => s.product === clinic.coach.product)
      ? []
      : [
          {
            key: clinic.coach.product,
            label: `${clinic.coach.label} - ${clinic.coach.price}`,
            product: clinic.coach.product,
            price: clinic.coach.price,
            closed: soldOut.has(clinic.coach.product),
            soldOut: soldOut.has(clinic.coach.product),
          },
        ]),
  ];

  return (
    <div className="clinic-reg">
      <ClinicJsonLd clinic={clinic} rows={rows} />
      <section className="clinic-reg-intro">
        <h1>
          High Level Throwing Clinic - {clinic.city} {clinic.year}
        </h1>
        <p>
          Welcome to the registration page for the{" "}
          <strong>
            <em>High Level Throwing® Clinic in {clinic.city}</em>
          </strong>{" "}
          <em>
            on {clinic.dayAndDate}, {clinic.year}!
          </em>{" "}
          We are excited to bring you some informative throwing sessions!
        </p>
        <p>
          {clinic.partner ? `We teamed up with ${clinic.partner} to bring you some informative throwing sessions! ` : ""}
          {/* Not every clinic is Austin and not every clinic is softball-only:
              Tracy is led by Sarah O'Brien, Crystal Lake covers baseball and
              softball. A clinic that says so carries its own sentence. */}
          {clinic.instructorLine ??
            `This clinic will be run by Owner/Founder, Austin Wasserman with sessions focusing on the Foundations & Advanced Concepts of High Level Throwing®${clinic.partner ? "." : " for Softball Athletes!"}`}
        </p>
        <ul>
          {clinic.sessions.map((s) => (
            <li key={s.product ?? `${s.name}-${s.time}`}>
              {s.name}: {s.day ?? clinic.dayAndDate} @ {s.time}
              {s.note ? ` – ${s.note}` : ""}
              {s.ages ? ` (${s.ages})` : ""}
              {s.sport ?? clinic.sport ? ` - ${s.sport ?? clinic.sport}` : ""}
            </li>
          ))}
          <li>Coach Access: Choose any session to attend and learn!</li>
        </ul>
        <p>
          <em>
            {clinic.attireNote ??
              "*We limit each session to 18 players! Athletes should wear softball training apparel or uniform. Each athlete will receive a FREE High Level Throwing® Getting Started Training Guide sent via email!"}
          </em>
        </p>
      </section>

      <section className="clinic-reg-venue">
        <div className="clinic-reg-venue-text">
          {clinic.venue.name && (
            <p className="clinic-reg-address clinic-reg-venue-name">{clinic.venue.name}</p>
          )}
          {clinic.venue.street && <p className="clinic-reg-address">{clinic.venue.street}</p>}
          <p className="clinic-reg-address">{clinic.venue.cityLine}</p>
          <p className="clinic-reg-format-title">
            <em>
              <strong>FORMAT</strong>
            </em>
          </p>
          <ul>
            {(clinic.format ?? FORMAT).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <Image
          className="clinic-reg-venue-img"
          src={clinic.venueLogo.src}
          alt={clinic.venueLogo.alt}
          width={clinic.venueLogo.width}
          height={clinic.venueLogo.height}
          priority
        />
      </section>

      <section className="clinic-reg-instructor">
        <Image
          className="clinic-reg-instructor-img"
          src={INSTRUCTOR}
          alt="Austin Wasserman"
          width={614}
          height={876}
        />
        <div>
          <h2>AUSTIN WASSERMAN</h2>
          <p>
            <strong>Austin Wasserman</strong> is the Owner &amp; Founder of Wasserman Strength, High
            Level Throwing® and High Level Pitching®. He’s a Strength Coach, Performance Coach and
            Author from Brooklyn, New York. He’s the Author of the High Level Throwing® and High
            Level Pitching® Series E-Books!
          </p>
          <p>
            Austin works with Youth, High School, College, MiLB &amp; MLB Baseball Players as well as
            Softball Players of all ages. He has consulted for and currently consults for some of the
            top baseball and softball programs in the country such as Vanderbilt, Alabama, Arizona
            State, Minnesota, Duke, University of South Carolina, LSU, Ole Miss, University of
            Washington, UNCW, Coastal Carolina, Villanova, Texas Lutheran, Iowa and Iowa State to
            name a few.
          </p>
          <p>
            His books, High Level Throwing®, are some of the most used overhand throwing books in the
            country! These books teach baseball and softball players how to move efficiently,
            maximize throwing potential, improve accuracy and create intent based on position,
            through constraint training drills and progressions.
          </p>
        </div>
      </section>

      <section className="clinic-reg-sessions">
        <p className="clinic-reg-details">
          <strong>REGISTRATION DETAILS</strong> When you register, you will receive an email
          confirming your acceptance to the clinic and to the specific session you signed up for.
          *There are NO refunds. You can transfer your spot to another athlete OR get the HLT Book
          for FREE.
        </p>
        {rows.map((row) => (
          <div className="clinic-reg-row hlt-session" key={row.key}>
            <p className="clinic-reg-label">{row.label}</p>
            {row.closed || !row.product ? (
              <span className="btn btn-soldout" aria-disabled="true">
                Sold out
              </span>
            ) : (
              <ClinicRegisterLink
                className="btn btn-primary"
                href={`/products/${row.product}`}
                label={`${clinic.city} ${clinic.year} - ${row.label}`}
              >
                I WANT THIS
              </ClinicRegisterLink>
            )}
          </div>
        ))}
        {rows.some((r) => r.soldOut) && (
          <p className="clinic-reg-soldout-note">
            A session showing <strong>Sold out</strong> has filled. Email{" "}
            <a href="mailto:highlevelthrowinghlt@gmail.com?subject=Clinic%20waitlist%20-%20spots%20available%3F">
              highlevelthrowinghlt@gmail.com
            </a>{" "}
            to see if there are any spots available!
          </p>
        )}
      </section>
    </div>
  );
}
