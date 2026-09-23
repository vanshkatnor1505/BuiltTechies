import { ArrowLeft, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";

import styles from "./FAQ.module.css";

const sections = [
  {
    title: "Finding care",
    questions: [
      {
        question: "How does hospital search work?",
        answer:
          "Allow location access, describe the care you need, and choose a search radius. CurePulse uses nearby healthcare data to show facilities that may match your request.",
      },
      {
        question: "What can I search for?",
        answer:
          "You can search for hospitals, clinics, emergency care, treatments, and specialties such as cardiology, kidney care, oncology, eye care, and more.",
      },
      {
        question: "Why can some facility details be missing?",
        answer:
          "Facility information comes from map and healthcare data sources and may be incomplete or outdated. Missing information is shown as unavailable rather than inferred.",
      },
    ],
  },
  {
    title: "Comparisons",
    questions: [
      {
        question: "How many facilities can I compare?",
        answer:
          "You can select up to three facilities. Your selections are available on the comparison page and remain saved when you reload the app.",
      },
      {
        question: "What does the requirement match mean?",
        answer:
          "It is an estimate based on the healthcare categories and specialty information available for a facility and the words in your search. It is not a clinical recommendation or quality rating.",
      },
      {
        question: "Can I verify facility information?",
        answer:
          "Use Verify data or Research hospital to request source-backed information when the research service is available. Information that cannot be verified is marked as unavailable.",
      },
    ],
  },
  {
    title: "Reports and assistant",
    questions: [
      {
        question: "Can I upload a medical report?",
        answer:
          "Yes. Open the AI Assistant and upload a text-based PDF smaller than 10 MB. Scanned or image-only PDFs may require OCR and cannot always be read.",
      },
      {
        question: "Is the report explanation medical advice?",
        answer:
          "No. The assistant provides general informational explanations and does not diagnose conditions, prescribe treatment, or replace a qualified healthcare professional.",
      },
      {
        question: "What happens to my uploaded report?",
        answer:
          "The report is sent to the configured analysis service to extract text and prepare an explanation. Do not upload information you are not comfortable processing through the configured service.",
      },
    ],
  },
  {
    title: "Location and safety",
    questions: [
      {
        question: "Why does CurePulse ask for my location?",
        answer:
          "Location helps calculate nearby facilities, distance, estimated travel time, and map position. You can deny access, but nearby search and navigation features may be limited.",
      },
      {
        question: "Does CurePulse diagnose medical conditions?",
        answer:
          "No. CurePulse helps with healthcare discovery, navigation, and general information. Always discuss symptoms, reports, and treatment decisions with a qualified professional.",
      },
      {
        question: "What should I do in an emergency?",
        answer:
          "Call your local emergency service or go to the nearest emergency department. Do not wait for this application when urgent medical attention may be needed.",
      },
    ],
  },
];

function FAQ() {
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
            <span className={styles.eyebrow}>HELP CENTER</span>
            <h1>Answers for finding care with more clarity.</h1>
            <p>
              Learn how CurePulse searches healthcare options, handles report
              explanations, and keeps recommendations grounded in available data.
            </p>
          </div>
        </section>

        <section className={styles.questions} aria-label="Frequently asked questions">
          <div className={styles.questionInner}>
            {sections.map((section) => (
              <section key={section.title} className={styles.group}>
                <div className={styles.groupHeading}>
                  <span className={styles.groupNumber}>
                    {String(sections.indexOf(section) + 1).padStart(2, "0")}
                  </span>
                  <h2>{section.title}</h2>
                </div>

                <div className={styles.list}>
                  {section.questions.map((item, index) => (
                    <details key={item.question} className={styles.item} open={index === 0}>
                      <summary>
                        <span>{item.question}</span>
                        <ChevronDown className={styles.chevron} size={19} />
                      </summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            <div className={styles.contactPanel}>
              <div>
                <span className={styles.eyebrow}>STILL UNSURE?</span>
                <h2>Start with the care you need.</h2>
                <p>
                  Search nearby facilities or ask the assistant for help
                  organizing your next step.
                </p>
              </div>
              <div className={styles.actions}>
                <Link to="/find-hospitals" className={styles.primaryAction}>
                  Find hospitals
                </Link>
                <Link to="/chatbot" className={styles.secondaryAction}>
                  Open assistant
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default FAQ;
