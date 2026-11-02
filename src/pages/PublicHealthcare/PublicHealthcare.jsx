import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";
import { PUBLIC_HEALTHCARE_ISSUES } from "../../data/publicHealthcareIssues";
import {
  fetchPublicHealthcareIssueTrends,
  submitPublicHealthcareReport,
} from "../../services/publicHealthcareReports";
import styles from "./PublicHealthcare.module.css";

function PublicHealthcare() {
  const [searchParams] = useSearchParams();
  const initialHospital = searchParams.get("hospital") || "";
  const initialLocation = searchParams.get("location") || "";
  const [hospitalName, setHospitalName] = useState(initialHospital);
  const [hospitalLocation, setHospitalLocation] = useState(initialLocation);
  const [category, setCategory] = useState(PUBLIC_HEALTHCARE_ISSUES[0].id);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState("");

  const issueLabels = useMemo(
    () => new Map(PUBLIC_HEALTHCARE_ISSUES.map((issue) => [issue.id, issue.label])),
    [],
  );

  useEffect(() => {
    let active = true;

    fetchPublicHealthcareIssueTrends()
      .then((issues) => {
        if (active) setTrends(issues);
      })
      .catch((error) => {
        if (active) setTrendsError(error.message);
      })
      .finally(() => {
        if (active) setTrendsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await submitPublicHealthcareReport({
        hospitalName: hospitalName.trim(),
        hospitalLocation: hospitalLocation.trim(),
        category,
        details: details.trim(),
      });
      setSubmitted(true);
      setDetails("");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
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
            <span className={styles.eyebrow}>PUBLIC HEALTHCARE VOICE</span>
            <h1>Help make hospital service issues visible.</h1>
            <p>
              Report a service problem at a public hospital, such as a doctor
              being unavailable, missing medicines, or a long wait. Reports
              help surface recurring issues; they do not replace official
              grievance channels.
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.formColumn}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>SHARE A SERVICE ISSUE</span>
              <h2>What happened?</h2>
              <p>
                You can submit anonymously. Reports stay private while pending
                review; only approved issue totals appear publicly.
              </p>
            </div>

            {submitted ? (
              <div className={styles.successCard} role="status">
                <CheckCircle2 size={24} />
                <div>
                  <h3>Report received</h3>
                  <p>
                    Thank you. Your report is pending review and won&apos;t be
                    shown publicly unless approved.
                  </p>
                </div>
                <button type="button" onClick={() => setSubmitted(false)}>
                  Submit another
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  Hospital name
                  <input
                    value={hospitalName}
                    onChange={(event) => setHospitalName(event.target.value)}
                    maxLength={160}
                    autoComplete="organization"
                    required
                  />
                </label>

                <label>
                  City or area
                  <input
                    value={hospitalLocation}
                    onChange={(event) => setHospitalLocation(event.target.value)}
                    maxLength={160}
                    autoComplete="address-level2"
                    placeholder="e.g. Ludhiana, Punjab"
                    required
                  />
                </label>

                <label>
                  Issue
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  >
                    {PUBLIC_HEALTHCARE_ISSUES.map((issue) => (
                      <option key={issue.id} value={issue.id}>
                        {issue.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Additional details <span>(optional)</span>
                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    maxLength={1000}
                    rows={4}
                    placeholder="Share a brief description without names or personal medical information."
                  />
                  <small>{details.length}/1000 characters</small>
                </label>

                <p className={styles.privacyNote}>
                  <ShieldCheck size={16} />
                  No name or contact details are collected. Please don&apos;t
                  include patient names, contact details, or private medical
                  information. Reports are reviewed before public trends update.
                </p>

                {submitError && (
                  <p className={styles.errorMessage} role="alert">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  <ClipboardList size={17} />
                  {isSubmitting ? "Submitting..." : "Submit report"}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </div>

          <aside className={styles.trendsCard} aria-labelledby="trends-title">
            <span className={styles.eyebrow}>COMMUNITY TRENDS</span>
            <h2 id="trends-title">Issues reported</h2>
            <p>
              Counts include reviewed reports only. They are community
              submissions, not verified measures of hospital performance.
            </p>

            {trendsLoading ? (
              <p className={styles.trendStatus} role="status">
                Loading reviewed reports...
              </p>
            ) : trendsError ? (
              <p className={styles.errorMessage} role="alert">
                {trendsError}
              </p>
            ) : trends.length === 0 ? (
              <p className={styles.trendStatus}>
                No reviewed reports yet. Reports will appear here after review.
              </p>
            ) : (
              <ul className={styles.trendList}>
                {trends.map((trend) => (
                  <li key={trend.category}>
                    <span>{issueLabels.get(trend.category)}</span>
                    <strong>{trend.count}</strong>
                  </li>
                ))}
              </ul>
            )}

            <a
              className={styles.grievanceLink}
              href="https://pgportal.gov.in/"
              target="_blank"
              rel="noreferrer"
            >
              Visit the official CPGRAMS grievance portal
              <ArrowRight size={15} />
            </a>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PublicHealthcare;
