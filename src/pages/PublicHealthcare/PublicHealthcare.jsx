import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileCheck2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
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
            <div className={styles.heroCopy}>
              <Link to="/" className={styles.backLink}>
                <ArrowLeft size={15} />
                Back to home
              </Link>
              <span className={styles.eyebrow}>PUBLIC HEALTHCARE VOICE</span>
              <h1>Help make hospital service issues visible.</h1>
              <p>
                Share what you experienced at a public hospital—such as a
                doctor being unavailable, missing medicines, or a long wait.
                Your report can help highlight recurring service gaps.
              </p>
              <div className={styles.heroActions}>
                <a href="#report-form">
                  Share an experience
                  <ArrowRight size={16} />
                </a>
                <a className={styles.secondaryHeroAction} href="#how-reports-work">
                  How reports are used
                </a>
              </div>
            </div>

            <aside className={styles.heroCallout}>
              <div className={styles.heroCalloutIcon}>
                <Eye size={21} />
              </div>
              <span className={styles.eyebrow}>COMMUNITY-LED VISIBILITY</span>
              <h2>Small reports can reveal recurring issues.</h2>
              <ul>
                <li><ShieldCheck size={15} /> Anonymous submissions</li>
                <li><FileCheck2 size={15} /> Review before approval</li>
                <li><MapPin size={15} /> Hospital and area context</li>
              </ul>
              <p>Reports are not emergency requests or official complaints.</p>
            </aside>
          </div>
        </section>

        <section className={styles.content} id="report-form">
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

        <section
          className={styles.guide}
          id="how-reports-work"
          aria-labelledby="guide-title"
        >
          <div className={styles.guideHeader}>
            <span className={styles.eyebrow}>FROM EXPERIENCE TO INSIGHT</span>
            <h2 id="guide-title">How community reports work.</h2>
            <p>
              The goal is to make common service challenges easier to notice,
              without exposing the people who report them.
            </p>
          </div>

          <div className={styles.guideGrid}>
            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>01</span>
              <div className={styles.guideIcon}><ClipboardList size={19} /></div>
              <h3>Describe what you experienced</h3>
              <p>
                Choose an issue, name the hospital and area, and add only
                non-identifying details that help explain the service gap.
              </p>
            </article>
            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>02</span>
              <div className={styles.guideIcon}><FileCheck2 size={19} /></div>
              <h3>Report is reviewed</h3>
              <p>
                New submissions stay private while pending. A reviewer checks
                them before deciding whether they can contribute to trends.
              </p>
            </article>
            <article className={styles.guideCard}>
              <span className={styles.guideNumber}>03</span>
              <div className={styles.guideIcon}><Eye size={19} /></div>
              <h3>Approved totals inform the picture</h3>
              <p>
                Only approved issue-category totals are shown. They are
                community signals—not proof, rankings, or a measure of care
                quality.
              </p>
            </article>
          </div>

          <div className={styles.guideFooter}>
            <ShieldCheck size={18} />
            <p>
              Keep reports respectful and factual. Do not include patient or
              staff names, phone numbers, records, or private medical details.
            </p>
            <a href="https://pgportal.gov.in/" target="_blank" rel="noreferrer">
              For official grievances, visit CPGRAMS
              <ArrowUpRight size={15} />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default PublicHealthcare;
