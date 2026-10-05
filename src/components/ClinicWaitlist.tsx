"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { subscribe, type SubscribeState } from "@/app/actions/subscribe";

const INITIAL: SubscribeState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Sending…" : "Notify Me"}
    </button>
  );
}

/**
 * Most people who land on /clinics are looking for a city that is not on the
 * schedule, and today they leave without a trace. This catches them, and the
 * requested location tells us where the next clinic should be booked.
 */
export default function ClinicWaitlist() {
  const [state, formAction] = useActionState(subscribe, INITIAL);
  const locationRef = useRef<HTMLInputElement>(null);

  // The "Request a Clinic" buttons point here; land the cursor in the field
  // rather than leaving the visitor to find it.
  useEffect(() => {
    const focusIfTargeted = () => {
      if (window.location.hash === "#clinic-waitlist") {
        window.setTimeout(() => locationRef.current?.focus({ preventScroll: true }), 450);
      }
    };
    focusIfTargeted();
    window.addEventListener("hashchange", focusIfTargeted);
    return () => window.removeEventListener("hashchange", focusIfTargeted);
  }, []);

  if (state.status === "ok") {
    return (
      <div className="clinic-waitlist" role="status">
        <h2>Got it.</h2>
        <p>
          We&apos;ll email you as soon as a High Level Throwing® clinic is scheduled near you — and your city now
          counts toward where we go next.
        </p>
      </div>
    );
  }

  return (
    <div className="clinic-waitlist">
      <h2>No clinic near you yet?</h2>
      <p>
        Tell us where you are and we&apos;ll let you know the moment one is scheduled in your area. Every request
        helps decide where we travel next.
      </p>
      <form className="clinic-waitlist-form" action={formAction}>
        <input type="hidden" name="source" value="Clinic waitlist" />

        <div className="clinic-waitlist-field">
          <label htmlFor="cw-location">City &amp; State</label>
          <input
            type="text"
            id="cw-location"
            name="location"
            ref={locationRef}
            placeholder="Worcester, MA"
            autoComplete="address-level2"
            required
          />
        </div>

        <div className="clinic-waitlist-field">
          <label htmlFor="cw-email">Email</label>
          <input
            type="email"
            id="cw-email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="clinic-waitlist-field">
          <label htmlFor="cw-role">I&apos;m a…</label>
          <select id="cw-role" name="role" defaultValue="Parent / Athlete">
            <option>Parent / Athlete</option>
            <option>Coach</option>
            <option>Organization / Facility</option>
          </select>
        </div>

        {/* Bots fill every field; people never see this one. */}
        <div aria-hidden="true" className="sr-only">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <SubmitButton />
      </form>
      {state.status === "error" && (
        <p className="email-capture-error" role="alert">
          {state.message}
        </p>
      )}
      <p className="email-capture-legal">
        We&apos;ll only email you about clinics and training. Unsubscribe any time.
      </p>
    </div>
  );
}
