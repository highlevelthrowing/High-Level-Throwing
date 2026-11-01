import Link from "next/link";
import type { NativeClinic } from "@/lib/native-clinics";

/**
 * A clinic registration page, rendered here rather than embedded from Shopify.
 *
 * Laid out to match the theme's clinic pages — the same order, the same
 * wording, the same yellow pill buttons — so a visitor moving between clinics
 * sees one site. The differences are deliberate: every label is built from the
 * same record as the product it links to, so the two cannot disagree, and the
 * whole thing is real HTML rather than an iframe a crawler sees as empty.
 */
export default function ClinicRegistration({ clinic }: { clinic: NativeClinic }) {
  const rows = [
    ...clinic.sessions.map((s) => ({
      label: `${s.name}: ${clinic.dayAndDate} @ ${s.time} – ${s.price} (${s.ages}) - ${clinic.sport}`,
      product: s.product,
    })),
    { label: `${clinic.coach.label} - ${clinic.coach.price}`, product: clinic.coach.product },
  ];

  return (
    <section className="clinic-reg">
      <h1>
        High Level Throwing<em>®</em> Clinic – {clinic.city} {clinic.dayAndDate.split(", ")[1]}{" "}
        {clinic.year}
      </h1>

      <div className="clinic-reg-intro">
        <p>
          Welcome to the registration page for the{" "}
          <strong>
            <em>High Level Throwing® Clinic in {clinic.city}</em>
          </strong>{" "}
          <em>on {clinic.dayAndDate}!</em> We are excited to bring you some informative throwing
          sessions!
        </p>
        <p>
          This clinic will be run by Owner/Founder, Austin Wasserman with sessions focusing on the
          Foundations &amp; Advanced Concepts of High Level Throwing® for Softball Athletes!
        </p>

        <ul>
          {clinic.sessions.map((s) => (
            <li key={s.product}>
              {s.name}: {clinic.dayAndDate} @ {s.time} ({s.ages}) - {clinic.sport}
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
      </div>

      <div className="clinic-reg-details">
        <p>
          <strong>REGISTRATION DETAILS</strong> When you register, you will receive an email
          confirming your acceptance to the clinic and to the specific session you signed up for.
          *There are NO refunds. You can transfer your spot to another athlete OR get the HLT Book
          for FREE.
        </p>
      </div>

      <div className="clinic-reg-sessions">
        {rows.map((row) => (
          <div className="clinic-reg-row" key={row.product}>
            <p className="clinic-reg-label">{row.label}</p>
            <Link className="btn btn-primary" href={`/products/${row.product}`}>
              I WANT THIS
            </Link>
          </div>
        ))}
      </div>

      <div className="clinic-reg-venue">
        <div>
          <h2>{clinic.venue.name}</h2>
          <p>{clinic.venue.street}</p>
          <p>{clinic.venue.cityLine}</p>
        </div>
        <div>
          <h3>FORMAT</h3>
          <ul>
            <li>Introduction + Discussion</li>
            <li>Dynamic Warm Up + Prep Drills</li>
            <li>Arm Care, Med Ball + HLT Patterns</li>
            <li>Drills &amp; Progressions</li>
            <li>Overhand Throwing Velocity Testing</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
