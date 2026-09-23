import { useState } from "react";
import { ArrowLeft, Clock3, Mail, MapPin, Send, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";

import styles from "./Contact.module.css";

const CONTACT_EMAIL = "hello@curepulse.health";

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  };

  return (
    <div className={styles.page}>
      <SiteNavbar />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <Link to="/" className={styles.backLink}>
              <ArrowLeft size={15} />
              Back to home
            </Link>
            <span className={styles.eyebrow}>CONTACT CUREPULSE</span>
            <h1>Let&apos;s make healthcare easier to navigate.</h1>
            <p>
              Have a question, found an issue, or want to work with us? Send a
              message and our team will get back to you.
            </p>
          </div>
        </section>

        <section className={styles.content} aria-label="Contact CurePulse">
          <div className={styles.details}>
            <span className={styles.eyebrow}>GET IN TOUCH</span>
            <h2>We are here to help.</h2>
            <p>
              Tell us what you need and include enough detail for us to point
              you in the right direction.
            </p>

            <div className={styles.detailList}>
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.detailItem}>
                <span className={styles.detailIcon}><Mail size={18} /></span>
                <span>
                  <strong>Email</strong>
                  <small>{CONTACT_EMAIL}</small>
                </span>
              </a>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}><Clock3 size={18} /></span>
                <span>
                  <strong>Response time</strong>
                  <small>Usually within two working days</small>
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}><MapPin size={18} /></span>
                <span>
                  <strong>Where we work</strong>
                  <small>Built for people searching across India</small>
                </span>
              </div>
            </div>

            <div className={styles.safetyNote}>
              <ShieldCheck size={17} />
              <span>Do not send urgent medical details here. Use local emergency services for immediate help.</span>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <span className={styles.eyebrow}>SEND A MESSAGE</span>
              <h2>How can we help?</h2>
            </div>

            <div className={styles.fieldGrid}>
              <label>
                Name
                <input name="name" type="text" autoComplete="name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
            </div>

            <label>
              Subject
              <input name="subject" type="text" required />
            </label>

            <label>
              Message
              <textarea name="message" rows="7" required />
            </label>

            <button type="submit" className={styles.submitButton}>
              <Send size={17} />
              Send via email
            </button>

            {submitted && (
              <p className={styles.submittedMessage} role="status">
                Message sent successfully. Our team will get back to you
                within two working days.
              </p>
            )}
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contact;
