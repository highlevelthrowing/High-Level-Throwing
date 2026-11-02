import Image from "next/image";
import type { ClinicSession, NativeClinic } from "@/lib/native-clinics";
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

export default function ClinicRegistration({ clinic }: { clinic: NativeClinic }) {
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
    parts.push(`- ${clinic.sport}`);
    return parts.join(" ");
  };

  const rows = [
    ...clinic.sessions.map((s) => ({
      key: s.product ?? `${s.name}-${s.time}`,
      label: sessionLabel(s),
      product: s.product,
      closed: Boolean(s.closed),
    })),
    {
      key: clinic.coach.product,
      label: `${clinic.coach.label} - ${clinic.coach.price}`,
      product: clinic.coach.product,
      closed: false,
    },
  ];

  return (
    <div className="clinic-reg">
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
          This clinic will be run by Owner/Founder, Austin Wasserman with sessions focusing on the
          Foundations &amp; Advanced Concepts of High Level Throwing® for Softball Athletes!
        </p>
        <ul>
          {clinic.sessions.map((s) => (
            <li key={s.product ?? `${s.name}-${s.time}`}>
              {s.name}: {s.day ?? clinic.dayAndDate} @ {s.time}
              {s.note ? ` – ${s.note}` : ""}
              {s.ages ? ` (${s.ages})` : ""} - {clinic.sport}
            </li>
          ))}
          <li>Coach Access: Choose any session to attend and learn!</li>
        </ul>
        <p>
          <em>
            *We limit each session to 18 players! Athletes should wear softball training apparel or
            uniform. Each athlete will receive a FREE High Level Throwing® Getting Started Training
            Guide sent via email!
          </em>
        </p>
      </section>

      <section className="clinic-reg-venue">
        <div className="clinic-reg-venue-text">
          {clinic.venue.name && (
            <p className="clinic-reg-address clinic-reg-venue-name">{clinic.venue.name}</p>
          )}
          <p className="clinic-reg-address">{clinic.venue.street}</p>
          <p className="clinic-reg-address">{clinic.venue.cityLine}</p>
          <p className="clinic-reg-format-title">
            <em>
              <strong>FORMAT</strong>
            </em>
          </p>
          <ul>
            {FORMAT.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        {clinic.venueLogo && (
          <Image
            className="clinic-reg-venue-img"
            src={clinic.venueLogo.src}
            alt={clinic.venueLogo.alt}
            width={clinic.venueLogo.width}
            height={clinic.venueLogo.height}
            priority
          />
        )}
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
      </section>
    </div>
  );
}
