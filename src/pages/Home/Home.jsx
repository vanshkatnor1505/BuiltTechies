import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  HeartPulse,
  Hospital,
  Languages,
  MapPin,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import styles from "./Home.module.css";

import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Personalized Matching",
    description:
      "Find hospitals based on your healthcare needs, location, budget, insurance, facilities, and preferences.",
  },
  {
    icon: Hospital,
    title: "Compare Hospitals",
    description:
      "Compare relevant hospitals side by side using treatment availability, cost, distance, facilities, and more.",
  },
  {
    icon: MapPin,
    title: "Location-Aware",
    description:
      "Discover suitable hospitals around you and understand distance, travel time, and navigation options.",
  },
  {
    icon: ShieldCheck,
    title: "Insurance & Schemes",
    description:
      "Identify hospitals that support relevant insurance providers and government healthcare schemes.",
  },
  {
    icon: FileText,
    title: "Understand Reports",
    description:
      "Upload a medical report and get a simpler explanation of relevant information and possible care pathways.",
  },
  {
    icon: Languages,
    title: "Built for Everyone",
    description:
      "Healthcare discovery designed to be accessible across languages, locations, and different user needs.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Tell us what you need",
    description:
      "Describe your health problem, treatment requirement, or medical specialty.",
    icon: HeartPulse,
  },
  {
    number: "02",
    title: "Set your requirements",
    description:
      "Add your location, budget, insurance, facilities, distance, and other preferences.",
    icon: SlidersIcon,
  },
  {
    number: "03",
    title: "Discover suitable hospitals",
    description:
      "Vital filters and matches hospitals according to the requirements you provide.",
    icon: Hospital,
  },
  {
    number: "04",
    title: "Compare & take action",
    description:
      "Compare your options and move forward with contact, directions, or emergency assistance.",
    icon: ArrowRight,
  },
];

const QUICK_SEARCHES = [
  "Find a hospital",
  "Compare hospitals",
  "Understand my report",
  "Emergency help",
];

const STATS = [
  {
    value: "10K+",
    label: "Hospitals & healthcare data",
  },
  {
    value: "40+",
    label: "Healthcare specialties",
  },
  {
    value: "24/7",
    label: "Healthcare guidance",
  },
  {
    value: "1",
    label: "Personalized search",
  },
];

const HOSPITALS = [
  {
    name: "CityCare Multispeciality Hospital",
    location: "Chandigarh",
    specialty: "Multispeciality",
    match: "94%",
    distance: "4.2 km",
    cost: "₹₹",
    insurance: "Insurance supported",
  },
  {
    name: "LifePoint Medical Centre",
    location: "Mohali",
    specialty: "Advanced Care",
    match: "91%",
    distance: "7.8 km",
    cost: "₹₹₹",
    insurance: "Insurance supported",
  },
  {
    name: "PrimeCare Hospital",
    location: "Chandigarh",
    specialty: "Specialized Care",
    match: "88%",
    distance: "10.4 km",
    cost: "₹₹",
    insurance: "Scheme available",
  },
];

function SlidersIcon({ size = 24, strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </svg>
  );
}

function Home() {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    // Basic implementation for now.
    // Connect this to your chatbot / hospital search flow later.
    console.log("Healthcare search:", searchValue);
  };

  const handleQuickSearch = (value) => {
    setSearchValue(value);
  };

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.ambient} />

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <SiteNavbar />

      <main>
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className={styles.hero}>
          <div className={styles.heroGrid} />

          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span className={styles.eyebrowPulse} />
              <span>SMARTER HEALTHCARE DISCOVERY</span>
            </div>

            <h1 className={styles.heroTitle}>
              Find healthcare
              <span> that fits you.</span>
            </h1>

            <p className={styles.heroDescription}>
              Tell Vital what you need, where you are, and what matters to
              you. We help you discover and compare healthcare options based
              on your requirements.
            </p>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => scrollTo("#find")}
              >
                Find a hospital
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => scrollTo("#how-it-works")}
              >
                How it works
                <ChevronRight size={17} />
              </button>
            </div>

            <div className={styles.heroTrust}>
              <div className={styles.trustPeople}>
                <span>V</span>
                <span>+</span>
              </div>

              <div>
                <strong>Built around your requirements</strong>
                <p>
                  Location · Budget · Insurance · Treatment · Preferences
                </p>
              </div>
            </div>
          </div>

          {/* HERO SEARCH CARD */}

          <div className={styles.heroVisual}>
            <div className={styles.searchCard}>
              <div className={styles.searchCardHeader}>
                <div>
                  <span className={styles.cardLabel}>START HERE</span>
                  <h2>What healthcare do you need?</h2>
                </div>

                <div className={styles.cardIcon}>
                  <HeartPulse size={21} />
                </div>
              </div>

              <form
                className={styles.searchBox}
                onSubmit={handleSearch}
              >
                <Search size={20} />

                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(event.target.value)
                  }
                  placeholder="e.g. kidney treatment, dental care..."
                  aria-label="Healthcare requirement"
                />

                <button type="submit">
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className={styles.searchSuggestions}>
                <span>Try:</span>

                {QUICK_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickSearch(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className={styles.searchDivider} />

              <div className={styles.locationRow}>
                <div className={styles.locationIcon}>
                  <MapPin size={17} />
                </div>

                <div>
                  <span>Your location</span>
                  <strong>Chandigarh, India</strong>
                </div>

                <button type="button" className={styles.changeButton}>
                  Change
                </button>
              </div>
            </div>

            {/* FLOATING MATCH CARD */}

            <div className={styles.floatingMatch}>
              <div className={styles.matchIcon}>
                <CheckCircle2 size={18} />
              </div>

              <div>
                <span>Personalized match</span>
                <strong>94% requirement match</strong>
              </div>

              <div className={styles.matchMiniGraph}>
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className={styles.floatingLocation}>
              <MapPin size={16} />
              <span>4.2 km away</span>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className={styles.statsSection}>
          <div className={styles.statsContainer}>
            {STATS.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            FIND SECTION
        ===================================================== */}

        <section className={styles.findSection} id="find">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                HEALTHCARE MATCHING
              </span>

              <h2>
                Don't search for the
                <span> “best” hospital.</span>
              </h2>
            </div>

            <p>
              Find the hospital that makes sense for your particular
              situation, requirements, and priorities.
            </p>
          </div>

          <div className={styles.matchingPanel}>
            <div className={styles.matchingIntro}>
              <div className={styles.aiBadge}>
                <Sparkles size={15} />
                AI-assisted matching
              </div>

              <h3>
                Your requirements.
                <br />
                Your healthcare options.
              </h3>

              <p>
                Vital considers multiple factors instead of relying on a
                single ranking.
              </p>

              <button
                type="button"
                className={styles.textButton}
                onClick={() => scrollTo("#assistant")}
              >
                Start with Vital Assistant
                <ArrowRight size={17} />
              </button>
            </div>

            <div className={styles.requirementGrid}>
              <Requirement
                icon={HeartPulse}
                title="Health need"
                value="Kidney treatment"
              />

              <Requirement
                icon={MapPin}
                title="Location"
                value="Within 15 km"
              />

              <Requirement
                icon={ShieldCheck}
                title="Insurance"
                value="Government scheme"
              />

              <Requirement
                icon={Users}
                title="Preference"
                value="Specialist available"
              />

              <Requirement
                icon={Clock3}
                title="Travel"
                value="Shorter ETA"
              />

              <Requirement
                icon={Hospital}
                title="Facilities"
                value="Required facilities"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            HOSPITAL PREVIEW
        ===================================================== */}

        <section className={styles.hospitalsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                EXAMPLE RESULTS
              </span>

              <h2>
                Healthcare options,
                <span> clearly compared.</span>
              </h2>
            </div>

            <button
              type="button"
              className={styles.outlineButton}
              onClick={() => scrollTo("#find")}
            >
              Explore hospitals
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className={styles.hospitalGrid}>
            {HOSPITALS.map((hospital, index) => (
              <article
                className={`${styles.hospitalCard} ${
                  index === 0 ? styles.featuredHospital : ""
                }`}
                key={hospital.name}
              >
                {index === 0 && (
                  <div className={styles.recommendedBadge}>
                    <Sparkles size={13} />
                    High requirement match
                  </div>
                )}

                <div className={styles.hospitalTop}>
                  <div className={styles.hospitalLogo}>
                    <Hospital size={21} />
                  </div>

                  <button
                    type="button"
                    className={styles.cardArrow}
                    aria-label={`View ${hospital.name}`}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>

                <div className={styles.hospitalInfo}>
                  <h3>{hospital.name}</h3>

                  <p>
                    <MapPin size={14} />
                    {hospital.location}
                  </p>
                </div>

                <div className={styles.hospitalTags}>
                  <span>{hospital.specialty}</span>
                  <span>{hospital.distance}</span>
                </div>

                <div className={styles.hospitalDetails}>
                  <div>
                    <span>Match</span>
                    <strong>{hospital.match}</strong>
                  </div>

                  <div>
                    <span>Cost</span>
                    <strong>{hospital.cost}</strong>
                  </div>

                  <div>
                    <span>Coverage</span>
                    <strong>{hospital.insurance}</strong>
                  </div>
                </div>

                <button type="button" className={styles.viewHospital}>
                  View details
                  <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className={styles.howSection} id="how-it-works">
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionEyebrow}>HOW VITAL WORKS</span>

            <h2>
              From confusion to
              <span> a clear next step.</span>
            </h2>

            <p>
              Healthcare decisions can involve dozens of variables. Vital
              brings the important ones together into one simple flow.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {STEPS.map((step) => {
              const Icon = step.icon;

              return (
                <article className={styles.stepCard} key={step.number}>
                  <div className={styles.stepTop}>
                    <span>{step.number}</span>

                    <div className={styles.stepIcon}>
                      <Icon size={21} />
                    </div>
                  </div>

                  <h3>{step.title}</h3>

                  <p>{step.description}</p>

                  <div className={styles.stepLine} />
                </article>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            AI ASSISTANT
        ===================================================== */}

        <section className={styles.assistantSection} id="assistant">
          <div className={styles.assistantGlow} />

          <div className={styles.assistantContent}>
            <div className={styles.aiBadge}>
              <Bot size={15} />
              VITAL ASSISTANT
            </div>

            <h2>
              Not sure where
              <span> to start?</span>
            </h2>

            <p>
              Talk to Vital. Describe your healthcare requirement in your
              own words and let the assistant guide you through the next
              steps.
            </p>

            <div className={styles.assistantCapabilities}>
              <span>
                <CheckCircle2 size={15} />
                Understand your requirement
              </span>

              <span>
                <CheckCircle2 size={15} />
                Find relevant specialties
              </span>

              <span>
                <CheckCircle2 size={15} />
                Compare hospitals
              </span>

              <span>
                <CheckCircle2 size={15} />
                Explain available options
              </span>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => console.log("Open Vital Assistant")}
            >
              Talk to Vital Assistant
              <ArrowRight size={18} />
            </button>
          </div>

          <div className={styles.assistantPreview}>
            <div className={styles.chatHeader}>
              <div className={styles.chatAvatar}>
                <HeartPulse size={18} />
              </div>

              <div>
                <strong>Vital Assistant</strong>
                <span>
                  <i />
                  Ready to help
                </span>
              </div>
            </div>

            <div className={styles.chatMessages}>
              <div className={styles.userBubble}>
                I need a hospital for kidney treatment near Chandigarh.
              </div>

              <div className={styles.aiBubble}>
                <div className={styles.aiBubbleIcon}>
                  <Sparkles size={14} />
                </div>

                I can help you find suitable options. I’ll consider your
                location, treatment needs, budget, insurance, and other
                preferences.
              </div>

              <div className={styles.aiQuestion}>
                <span>What matters most to you?</span>

                <div>
                  <button type="button">Budget</button>
                  <button type="button">Insurance</button>
                  <button type="button">Distance</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section className={styles.featuresSection} id="about">
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionEyebrow}>BUILT AROUND YOU</span>

            <h2>
              More than a hospital
              <span> search.</span>
            </h2>

            <p>
              A healthcare discovery experience designed to reduce the
              complexity of finding and choosing care.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className={styles.featureCard} key={feature.title}>
                  <div className={styles.featureIcon}>
                    <Icon size={21} />
                  </div>

                  <h3>{feature.title}</h3>

                  <p>{feature.description}</p>

                  <div className={styles.featureArrow}>
                    <ArrowUpRight size={17} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            EMERGENCY CTA
        ===================================================== */}

        <section className={styles.emergencySection}>
          <div className={styles.emergencyIcon}>
            <Siren size={25} />
          </div>

          <div className={styles.emergencyContent}>
            <span>NEED URGENT HELP?</span>

            <h2>
              Get emergency information
              <br />
              when every second matters.
            </h2>

            <p>
              Quickly access emergency guidance, nearby emergency facilities,
              ambulance information, and location-based options.
            </p>
          </div>

          <button
            type="button"
            className={styles.emergencyButton}
            onClick={() => console.log("Emergency help")}
          >
            Emergency help
            <ArrowRight size={18} />
          </button>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className={styles.finalCta}>
          <div className={styles.finalCtaGrid} />

          <div className={styles.finalCtaContent}>
            <div className={styles.finalIcon}>
              <HeartPulse size={25} />
            </div>

            <span className={styles.sectionEyebrow}>
              YOUR HEALTHCARE JOURNEY STARTS HERE
            </span>

            <h2>
              Make your next
              <span> healthcare decision clearer.</span>
            </h2>

            <p>
              Start with what you know. Vital helps organize the rest.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => scrollTo("#find")}
            >
              Find suitable care
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer
        logo="Vital"
        description="A healthcare discovery platform designed to help people find, understand, compare, and access suitable healthcare options."
        email="hello@vitalhealthcare.dev"
        columns={[
          {
            title: "Explore",
            links: [
              { label: "Home", href: "/" },
              { label: "Find Hospitals", href: "#find" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Assistant", href: "#assistant" },
            ],
          },
          {
            title: "Healthcare",
            links: [
              { label: "Hospital Search", href: "#find" },
              { label: "Compare Hospitals", href: "#find" },
              { label: "Emergency Help", href: "#emergency" },
              { label: "Report Understanding", href: "#assistant" },
            ],
          },
          {
            title: "Vital",
            links: [
              { label: "About", href: "#about" },
              { label: "Contact", href: "#contact" },
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ],
          },
        ]}
      />
    </div>
  );
}

function Requirement({ icon: Icon, title, value }) {
  return (
    <div className={styles.requirement}>
      <div className={styles.requirementIcon}>
        <Icon size={18} />
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <CheckCircle2 size={17} className={styles.requirementCheck} />
    </div>
  );
}

export default Home;