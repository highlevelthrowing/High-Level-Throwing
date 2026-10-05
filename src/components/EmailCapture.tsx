"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { subscribe, type SubscribeState } from "@/app/actions/subscribe";

const INITIAL: SubscribeState = { status: "idle" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? "Joining…" : label}
    </button>
  );
}

/**
 * The only email capture on the site outside of checkout. The Klaviyo pop-up is
 * suppressed on the clinic and product pages because it swallowed button taps
 * on mobile, so this has to be inline and never block the page.
 */
export default function EmailCapture({
  source = "Footer signup",
  heading = "Get throwing drills, clinic dates and new releases!",
  cta = "Sign Up",
}: {
  source?: string;
  heading?: string;
  cta?: string;
}) {
  const [state, formAction] = useActionState(subscribe, INITIAL);

  if (state.status === "ok") {
    return (
      <div className="email-capture" role="status">
        <h3>You&apos;re in.</h3>
        <p>You&apos;ll hear from us when new clinic dates, drills and releases go out.</p>
      </div>
    );
  }

  return (
    <div className="email-capture">
      <h3>{heading}</h3>
      <form className="email-capture-form" action={formAction}>
        <input type="hidden" name="source" value={source} />
        <label className="sr-only" htmlFor={`ec-email-${source}`}>
          Email address
        </label>
        <input
          type="email"
          id={`ec-email-${source}`}
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        {/* Bots fill every field; people never see this one. */}
        <div aria-hidden="true" className="sr-only">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <SubmitButton label={cta} />
      </form>
      {state.status === "error" && (
        <p className="email-capture-error" role="alert">
          {state.message}
        </p>
      )}
      <p className="email-capture-legal">
        By signing up you agree to receive emails from High Level Throwing®. Unsubscribe any time.
      </p>
    </div>
  );
}
