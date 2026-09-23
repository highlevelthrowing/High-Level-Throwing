import Image from "next/image";
import Link from "next/link";
import { formatClinicDate, getClinics } from "@/lib/clinics";

export default async function ClinicSchedule() {
  const clinics = await getClinics();

  if (clinics.length === 0) {
    return (
      <p style={{ color: "var(--muted)", textAlign: "center" }}>
        Our schedule is being updated — <Link href="/contact" style={{ color: "var(--lime)", fontWeight: 700 }}>get in touch</Link>{" "}
        and we&apos;ll let you know what&apos;s coming to your area.
      </p>
    );
  }

  return (
    <div className="clinic-list">
      {clinics.map((clinic) => (
        <article className="clinic-row" key={clinic.id}>
          {clinic.image ? (
            <Image
              className="clinic-row-img"
              src={clinic.image}
              alt={clinic.title}
              width={320}
              height={320}
            />
          ) : (
            <div className="clinic-row-img clinic-row-img--empty" aria-hidden="true" />
          )}

          <div className="clinic-row-body">
            <div className="clinic-row-date">{formatClinicDate(clinic)}</div>
            <h3 className="clinic-row-title">{clinic.title}</h3>
            {clinic.blurb && <p className="clinic-row-blurb">{clinic.blurb}</p>}
          </div>

          <div className="clinic-row-action">
            {clinic.registerHref === null ? (
              <span className="clinic-row-soon">Registration opening soon</span>
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
        </article>
      ))}
    </div>
  );
}
