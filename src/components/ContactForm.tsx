"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/contact/actions";

const INITIAL: ContactState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
      {pending ? "Sending…" : "Send Message"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContact, INITIAL);
  const [toast, setToast] = useState(false);

  // A confirmation dialog over the page, on top of the panel that replaces the
  // form — it stays until dismissed so it cannot be missed.
  useEffect(() => {
    if (state.status !== "sent") return;
    setToast(true);

    // Escape closes it, like any other dialog.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setToast(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.status]);

  const sentModal = toast ? (
    <div className="contact-modal-backdrop" role="presentation" onClick={() => setToast(false)}>
      <div
        className="contact-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="contact-sent-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="contact-sent-title">Sent!</h2>
        <p>Thanks — we will be in touch shortly.</p>
        <button type="button" className="btn btn-primary" onClick={() => setToast(false)} autoFocus>
          Close
        </button>
      </div>
    </div>
  ) : null;

  if (state.status === "sent") {
    return (
      <>
        {sentModal}
      <div className="contact-sent" role="status">
        <h3>Message sent</h3>
        <p>{state.message ?? "Thanks for reaching out — we'll get back to you shortly."}</p>
        <p className="contact-sent-note">
          Need us sooner? Email <a href="mailto:austin@highlevelthrowing.com">austin@highlevelthrowing.com</a>.
        </p>
      </div>
      </>
    );
  }

  return (
    <form className="contact-form" action={formAction}>
      {state.status === "error" && (
        <p className="contact-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="contact-form-row">
        <div className="contact-field">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" autoComplete="given-name" />
        </div>
        <div className="contact-field">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" autoComplete="family-name" />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-field">
          <label htmlFor="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" autoComplete="tel" />
        </div>
        <div className="contact-field">
          <label htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" autoComplete="email" required />
        </div>
      </div>

      <div className="contact-field">
        <label htmlFor="comment">Comment</label>
        <textarea id="comment" name="comment" rows={6} />
      </div>

      {/* Bots fill every field; people never see this one. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="company">Company</label>
        <input type="text" id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />
    </form>
  );
}
