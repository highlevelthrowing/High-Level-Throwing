import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Contact</div>
        <h2>Get In Touch</h2>
        <p>Our team is here to help you improve your Strength, Throwing &amp; Pitching Performance!</p>
      </div>

      <div className="split">
        <div className="col-text">
          <form
            className="contact-form"
            method="post"
            action="https://highlevelthrowing.com/contact#ContactForm"
            acceptCharset="UTF-8"
            target="_blank"
          >
            <input type="hidden" name="form_type" value="contact" />
            <input type="hidden" name="utf8" value="✓" />
            <div className="contact-form-row">
              <div className="contact-field">
                <label htmlFor="first-name">First Name</label>
                <input type="text" id="first-name" name="contact[First Name]" autoComplete="given-name" />
              </div>
              <div className="contact-field">
                <label htmlFor="last-name">Last Name</label>
                <input type="text" id="last-name" name="contact[Last Name]" autoComplete="family-name" />
              </div>
            </div>
            <div className="contact-form-row">
              <div className="contact-field">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="contact[Phone number]" autoComplete="tel" />
              </div>
              <div className="contact-field">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="contact[email]" autoComplete="email" required />
              </div>
            </div>
            <div className="contact-field">
              <label htmlFor="comment">Comment</label>
              <textarea id="comment" name="contact[Comment]" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }}>
              Send Message
            </button>
          </form>
        </div>

        <div className="contact-info-card">
          <div className="contact-info-row">
            <div className="contact-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" opacity="0" />
                <path d="M22 6 12 13 2 6" />
                <path d="M2 6h20v12H2z" />
              </svg>
            </div>
            <div>
              <h4>General Inquiries</h4>
              <a href="mailto:austin@highlevelthrowing.com">austin@highlevelthrowing.com</a>
            </div>
          </div>
          <div className="contact-info-row">
            <div className="contact-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" opacity="0" />
                <path d="M22 6 12 13 2 6" />
                <path d="M2 6h20v12H2z" />
              </svg>
            </div>
            <div>
              <h4>Clinic Inquiries</h4>
              <a href="mailto:highlevelthrowinghlt@gmail.com">highlevelthrowinghlt@gmail.com</a>
            </div>
          </div>
          <div className="contact-info-row">
            <div className="contact-info-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h4>Address</h4>
              <p>7000 W Palmetto Park Rd., Boca Raton, FL 33433</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
