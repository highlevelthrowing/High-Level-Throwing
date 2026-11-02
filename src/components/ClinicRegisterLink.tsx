"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackLead } from "@/lib/tracking";

/**
 * Same as next/link, except clicking it reports a Lead to Meta and Google
 * first. This is the actual conversion intent HLT advertises toward — a
 * generic AddToCart on the product page downstream doesn't carry which
 * session or clinic it came from.
 */
export default function ClinicRegisterLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => trackLead({ leadType: "clinic_registration", label })}
    >
      {children}
    </Link>
  );
}
