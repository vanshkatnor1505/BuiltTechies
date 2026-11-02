import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Globe2,
  HeartPulse,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";
import Container from "../../components/layout/Container/Container";
import Section from "../../components/layout/Section/Section";
import Heading from "../../components/common/Heading/Heading";

import styles from "./About.module.css";

const capabilities = [
  {
    icon: <MapPin size={22} aria-hidden="true" />,
    title: "Discover nearby care",
    description:
      "Search by healthcare need and location, review nearby facilities, and use maps to plan where to go.",
  },
  {
    icon: <Scale size={22} aria-hidden="true" />,
    title: "Compare with clarity",
    description:
      "Compare facility details side by side. Specialty matching is a discovery aid—not a rating of clinical quality.",
  },
  {
    icon: <FileSearch size={22} aria-hidden="true" />,
    title: "Research your options",
    description:
      "Explore available hospital information and source links, then verify important details directly with providers.",
  },
  {
    icon: <MessageCircle size={22} aria-hidden="true" />,
    title: "Ask the healthcare assistant",
    description:
      "Get general information and plain-language help with text-based medical reports. It does not provide a diagnosis.",
  },
  {
    icon: <Activity size={22} aria-hidden="true" />,
    title: "Share public healthcare feedback",
    description:
      "Submit a report about a public hospital service issue. Reports stay private while reviewed; only approved category totals appear.",
  },
  {
    icon: <Globe2 size={22} aria-hidden="true" />,
    title: "Use your preferred language",
    description:
      "Switch the interface between English, Hindi, and Punjabi, with your language choice remembered on this device.",
  },
];

const steps = [
  {
    icon: <Search size={21} aria-hidden="true" />,
    title: "Describe the care you need",
    description:
      "Search in your own words for a condition, treatment, specialty, or type of facility.",
  },
  {
    icon: <CheckCircle2 size={21} aria-hidden="true" />,
    title: "Review and compare options",
    description:
      "Explore available details, locations, and specialty information to build a shortlist that suits your search.",
  },
  {
    icon: <Navigation size={21} aria-hidden="true" />,
    title: "Choose your next step",
    description:
      "Open directions, contact a provider, or continue researching. Confirm current services and availability with the facility.",
  },
];

const principles = [
  {
    icon: <HeartPulse size={21} aria-hidden="true" />,
    title: "Built around people",
    description:
      "We bring search, comparison, maps, and guidance together to make the first steps in healthcare discovery easier to navigate.",
  },
  {
    icon: <ShieldCheck size={21} aria-hidden="true" />,
    title: "Clear about our limits",
    description:
      "CurePulse does not diagnose, prescribe, or replace a healthcare professional. Recommendations and facility data may be incomplete or out of date.",
  },
];

function About() {
  return (
    <div className={styles.page}>
      <SiteNavbar />

      <main>
        <Section spacing="large" className={styles.heroSection}>
          <Container>
            <div className={styles.hero}>
              <span className={styles.eyebrow}>ABOUT CUREPULSE</span>
              <Heading
                title="Make the search for care a little clearer."
                description="CurePulse brings healthcare discovery, hospital comparison, maps, research, and guided assistance together—so people can move from a question toward a practical next step."
                align="center"
                size="hero"
                as="h1"
              />
              <div className={styles.heroActions}>
                <Link to="/find-hospitals" className={styles.primaryAction}>
                  Find hospitals
                  <ArrowRight size={17} />
                </Link>
                <a href="#our-approach" className={styles.secondaryAction}>
                  See how CurePulse works
                </a>
              </div>
              <p className={styles.heroNote}>
                A healthcare discovery tool for people and families exploring
                care options across India.
              </p>
            </div>
          </Container>
        </Section>

        <Section id="our-approach" className={styles.storySection}>
          <Container>
            <div className={styles.story}>
              <div className={styles.storyHeading}>
                <span className={styles.eyebrow}>THE CHALLENGE</span>
                <h2>Finding a place to start can be hard.</h2>
              </div>
              <div className={styles.storyCopy}>
                <p>
                  People looking for care may need to piece together information
                  from map listings, hospital websites, and search results.
                  Important details can be difficult to compare, and the next
                  step is not always obvious.
                </p>
                <p>
                  CurePulse offers one place to search for facilities, explore
                  locations, compare available information, and find further
                  guidance. It is designed to support a person’s research—not
                  to make healthcare decisions for them.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section className={styles.capabilitiesSection}>
          <Container>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>WHAT YOU CAN DO</span>
              <h2>Practical tools for exploring healthcare options.</h2>
              <p>
                Use the parts of CurePulse that fit your search, and verify
                time-sensitive information with the relevant provider.
              </p>
            </div>
            <div className={styles.capabilities}>
              {capabilities.map(({ icon, title, description }, index) => (
                <article className={styles.capability} key={title}>
                  <div className={styles.capabilityTop}>
                    <span className={styles.capabilityNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {icon}
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section className={styles.stepsSection}>
          <Container>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>HOW IT WORKS</span>
              <h2>A simple path from search to next step.</h2>
            </div>
            <div className={styles.steps}>
              {steps.map(({ icon, title, description }, index) => (
                <article className={styles.step} key={title}>
                  <div className={styles.stepTop}>
                    <span className={styles.capabilityNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.stepIcon}>{icon}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        <Section className={styles.principlesSection}>
          <Container>
            <div className={styles.principles}>
              <div className={styles.principlesIntro}>
                <span className={styles.eyebrow}>WHO IT’S FOR</span>
                <h2>Support for people at the start of their search.</h2>
                <p>
                  CurePulse can help patients and families researching
                  facilities, people comparing care options, and anyone looking
                  for a clearer way to begin.
                </p>
              </div>
              <div className={styles.principleList}>
                {principles.map(({ icon, title, description }) => (
                  <article className={styles.principle} key={title}>
                    <span className={styles.principleIcon}>
                      {icon}
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Container>
        </Section>

        <Section className={styles.safetySection}>
          <Container>
            <div className={styles.safety}>
              <div className={styles.safetyIcon}>
                <UsersRound size={23} aria-hidden="true" />
              </div>
              <div>
                <span className={styles.eyebrow}>A NOTE ON HEALTH INFORMATION</span>
                <h2>Use CurePulse as a starting point, not a medical decision.</h2>
                <p>
                  Facility listings and recommendations can be incomplete or
                  change over time. Confirm services, costs, appointments, and
                  availability with the provider. The assistant offers general
                  information only; speak with a qualified professional about
                  symptoms, reports, and treatment. If you may need urgent
                  medical attention, contact local emergency services.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section spacing="large" className={styles.ctaSection}>
          <Container>
            <div className={styles.cta}>
              <span className={styles.eyebrow}>TAKE THE NEXT STEP</span>
              <h2>Start with the question on your mind.</h2>
              <p>
                Search for facilities, compare options, or get answers about
                using CurePulse.
              </p>
              <div className={styles.heroActions}>
                <Link to="/find-hospitals" className={styles.primaryAction}>
                  Explore hospitals
                  <ArrowRight size={17} />
                </Link>
                <Link to="/faq" className={styles.secondaryAction}>
                  Visit the FAQ
                </Link>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

export default About;
