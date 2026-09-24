import Image from "next/image";
import Link from "next/link";
import { getClinics } from "@/lib/clinics";

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
            <h3 className="clinic-card-title">{clinic.title}</h3>
            {clinic.blurb && <p className="clinic-card-blurb">{clinic.blurb}</p>}

            <div className="clinic-card-action">
              {clinic.registerHref === null ? (
                <span className="clinic-card-soon">Registration opening soon</span>
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
          </div>
        </article>
      ))}
    </div>
  );
}
