import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

/* =========================================================
   FEATURES
========================================================= */

const FEATURES = [
  {
    icon: Sparkles,
    title: "Personalized Matching",
    description:
      "Find healthcare options based on your treatment needs, location, budget, insurance, facilities, and preferences.",
  },
  {
    icon: Hospital,
    title: "Compare Hospitals",
    description:
      "Compare relevant hospitals using treatment availability, cost, distance, facilities, specialists, and coverage.",
  },
  {
    icon: MapPin,
    title: "Location-Aware",
    description:
      "Understand nearby healthcare options, distance, travel time, and available navigation support.",
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
      "Get simpler explanations of medical reports and understand information that may help you discuss care with professionals.",
  },
  {
    icon: Languages,
    title: "Built for Everyone",
    description:
      "Healthcare discovery designed to support different languages, locations, accessibility needs, and preferences.",
  },
];

/* =========================================================
   HOW IT WORKS
========================================================= */

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
      "Add location, budget, insurance, facilities, distance, and other preferences.",
    icon: SlidersIcon,
  },
  {
    number: "03",
    title: "Discover suitable hospitals",
    description:
      "Vital filters available options according to the requirements you provide.",
    icon: Hospital,
  },
  {
    number: "04",
    title: "Compare & take action",
    description:
      "Compare your options and move forward with contact, directions, or further assistance.",
    icon: ArrowRight,
  },
];

/* =========================================================
   COMPARISON DATA
========================================================= */

/* =========================================================
   TEAM
========================================================= */

const TEAM = [
  {
    name: "Vanshdeep Katnor",
    role: "Product & Development",
    initial: "V",
  },
  {
    name: "Eshav Chumber",
    role: "Data Base / AI Engineer",
    initial: "E",
  },
  {
    name: "Sakshi Choudhary",
    role: "Presentator / Graphics Designer",
    initial: "S",
  },
  {
    name: "Manjot Sandhu",
    role: "Tech Presentator / Team Organizer",
    initial: "M",
  },
];

/* =========================================================
   SLIDER ICON
========================================================= */

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

/* =========================================================
   HOME
========================================================= */

function Home() {
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState("");
  const openFinder = (
    query = requirement,
    emergency = false,
    location = null,
  ) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (emergency) params.set("emergency", "true");
    if (location) {
      params.set("lat", String(location.lat));
      params.set("lon", String(location.lon));
      params.set("accuracy", String(location.accuracy));
    }
    navigate(`/find-hospitals${params.size ? `?${params}` : ""}`);
  };
  const openEmergencyFinder = (useLocation = false) => {
    if (!useLocation || !navigator.geolocation) {
      openFinder("Emergency", true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        openFinder("Emergency", true, {
          lat: coords.latitude,
          lon: coords.longitude,
          accuracy: coords.accuracy,
        });
      },
      () => openFinder("Emergency", true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };
  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
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
        {/* ===================================================
            01 — EMERGENCY
        =================================================== */}

        <section
          className={styles.emergencySection}
          id="emergency"
          aria-labelledby="emergency-title"
        >
          <div className={styles.emergencyGlow} />

          <div className={styles.emergencyInner}>
            <div className={styles.emergencyContent}>
              <div className={styles.emergencyEyebrow}>
                <span className={styles.emergencyPulse} />
                <span>URGENT HEALTHCARE ASSISTANCE</span>
              </div>

              <h1 id="emergency-title">
                Need urgent care?
                <span> Start here.</span>
              </h1>

              <p>
                Quickly find nearby emergency healthcare options and get
                guidance on what to do next.
              </p>

              <div className={styles.emergencyActions}>
                <button
                  type="button"
                  className={styles.emergencyPrimary}
                  onClick={() => openEmergencyFinder(true)}
                >
                  <MapPin size={18} />
                  Use my location
                </button>

                <button
                  type="button"
                  className={styles.emergencySecondary}
                  onClick={() => openEmergencyFinder()}
                >
                  <Hospital size={18} />
                  Find emergency hospital
                </button>
              </div>

              <div className={styles.emergencyNotice}>
                <Siren size={16} />

                <span>
                  In a life-threatening emergency, contact your local
                  emergency services immediately.
                </span>
              </div>
            </div>

            <div className={styles.emergencyPanel}>
              <div className={styles.emergencyPanelIcon}>
                <Siren size={25} />
              </div>

              <div>
                <span>EMERGENCY SUPPORT</span>

                <h2>What do you need right now?</h2>
              </div>

              <div className={styles.emergencyOptions}>
                <button
                  type="button"
                  onClick={() => openEmergencyFinder(true)}
                >
                  <div>
                    <Hospital size={18} />
                  </div>

                  <span>
                    <strong>Nearest emergency hospital</strong>
                    <small>Find nearby emergency care</small>
                  </span>

                  <ArrowUpRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "tel:112";
                  }}
                >
                  <div>
                    <Siren size={18} />
                  </div>

                  <span>
                    <strong>Ambulance assistance</strong>
                    <small>Access available emergency resources</small>
                  </span>

                  <ArrowUpRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/chatbot")}
                >
                  <div>
                    <HeartPulse size={18} />
                  </div>

                  <span>
                    <strong>Emergency guidance</strong>
                    <small>Understand the next available step</small>
                  </span>

                  <ArrowUpRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            02 — FIND A HOSPITAL
        =================================================== */}

        <section
          className={styles.findSection}
          id="find"
          aria-labelledby="find-title"
        >
          <div className={styles.findGrid} />

          <div className={styles.findContent}>
            <div className={styles.sectionEyebrow}>
              HEALTHCARE DISCOVERY
            </div>

            <h2 id="find-title">
              Find the right
              <span> care for your situation.</span>
            </h2>

            <p>
              Tell Vital what you need. We bring together the factors that
              actually matter when choosing healthcare — not just a generic
              hospital ranking.
            </p>

            <div className={styles.findTrust}>
              <CheckCircle2 size={17} />

              <span>
                Treatment · Location · Cost · Insurance · Facilities ·
                Preferences
              </span>
            </div>
          </div>

          <div className={styles.findCard}>
            <div className={styles.findCardHeader}>
              <div>
                <span>START YOUR SEARCH</span>

                <h3>What healthcare do you need?</h3>
              </div>

              <div className={styles.findCardIcon}>
                <HeartPulse size={21} />
              </div>
            </div>

            <div className={styles.findSearch}>
              <Search size={19} />

              <input
                type="text"
                value={requirement}
                onChange={(event) => setRequirement(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && openFinder()}
                placeholder="e.g. kidney treatment, dental care..."
                aria-label="Healthcare requirement"
              />

              <button
                type="button"
                onClick={() => openFinder()}
                aria-label="Search healthcare"
              >
                <ArrowRight size={18} />
              </button>
            </div>

            <div className={styles.searchExamples}>
              <span>Popular searches</span>

              <button type="button">Kidney treatment</button>
              <button type="button">Dental care</button>
              <button type="button">Cardiology</button>
              <button type="button">Emergency care</button>
            </div>

            <div className={styles.findDivider} />

            <div className={styles.requirementRow}>
              <Requirement
                icon={MapPin}
                title="Location"
                value="Choose your area"
              />

              <Requirement
                icon={ShieldCheck}
                title="Coverage"
                value="Insurance / scheme"
              />

              <Requirement
                icon={SlidersIcon}
                title="Preferences"
                value="Add requirements"
              />
            </div>

            <button
              type="button"
              className={styles.findAdvanced}
              onClick={() => openFinder()}
            >
              Set detailed requirements
              <ChevronRight size={17} />
            </button>
          </div>
        </section>

        {/* ===================================================
            03 — PRIMARY CTA
        =================================================== */}

        <section className={styles.homeCta}>
          <div className={styles.homeCtaIcon}>
            <Stethoscope size={22} />
          </div>

          <div className={styles.homeCtaContent}>
            <span>NOT SURE WHAT TO SEARCH FOR?</span>

            <h2>Let Vital help you figure out where to start.</h2>

            <p>
              Describe your situation naturally and the Vital Assistant can
              guide you through the healthcare discovery process.
            </p>
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/chatbot")}
          >
            Talk to Vital
            <ArrowRight size={18} />
          </button>
        </section>

        {/* ===================================================
            04 — HOSPITAL COMPARISON
        =================================================== */}

        <section
          className={styles.comparisonSection}
          id="comparison"
          aria-labelledby="comparison-title"
        >
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>
                HOSPITAL COMPARISON
              </span>

              <h2 id="comparison-title">
                Compare options
                <span> side by side.</span>
              </h2>
            </div>

            <p>
              Look beyond a single rating. Understand how different options
              compare against the requirements that matter to you.
            </p>
          </div>

          <div className={styles.comparisonTable}>
            <div className={styles.comparisonHeader}>
              <div>Hospital</div>
              <div>Specialty</div>
              <div>Distance</div>
              <div>Cost</div>
              <div>Coverage</div>
              <div />
            </div>

            {[] /* Hospital rows are intentionally populated only from a live search. */.map((hospital, index) => (
              <article
                className={`${styles.comparisonRow} ${
                  index === 0 ? styles.comparisonHighlighted : ""
                }`}
                key={hospital.name}
              >
                <div className={styles.comparisonHospital}>
                  <div className={styles.hospitalLogo}>
                    <Hospital size={19} />
                  </div>

                  <div>
                    <strong>{hospital.name}</strong>

                    <span>
                      <MapPin size={13} />
                      {hospital.location}
                    </span>
                  </div>
                </div>

                <div>
                  <span className={styles.mobileComparisonLabel}>
                    Specialty
                  </span>

                  <strong>{hospital.specialty}</strong>
                </div>

                <div>
                  <span className={styles.mobileComparisonLabel}>
                    Distance
                  </span>

                  <strong>{hospital.distance}</strong>
                </div>

                <div>
                  <span className={styles.mobileComparisonLabel}>Cost</span>

                  <strong>{hospital.cost}</strong>
                </div>

                <div>
                  <span className={styles.mobileComparisonLabel}>
                    Coverage
                  </span>

                  <strong>{hospital.coverage}</strong>
                </div>

                <button
                  type="button"
                  className={styles.comparisonAction}
                  onClick={() => console.log(`View ${hospital.name}`)}
                >
                  <ArrowUpRight size={17} />
                </button>
              </article>
            ))}
            <article className={styles.comparisonRow}>
              <div className={styles.comparisonHospital}>
                <div className={styles.hospitalLogo}><Hospital size={19} /></div>
                <div><strong>Start a nearby hospital search</strong><span><MapPin size={13} />No hospital information is pre-filled</span></div>
              </div>
              <div><strong>Live data</strong></div>
              <div><strong>Live distance</strong></div>
              <div><strong>Data not available</strong></div>
              <div><strong>Verify after search</strong></div>
              <button type="button" className={styles.comparisonAction} onClick={() => openFinder()}><ArrowUpRight size={17} /></button>
            </article>
          </div>

          <div className={styles.comparisonFooter}>
            <span>
              <CheckCircle2 size={16} />
              Compare based on your own requirements
            </span>

            <button
              type="button"
              onClick={() => openFinder()}
            >
              Start a personalized search
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ===================================================
            05 — HOW IT WORKS
        =================================================== */}

        <section
          className={styles.howSection}
          id="how-it-works"
          aria-labelledby="how-title"
        >
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionEyebrow}>HOW VITAL WORKS</span>

            <h2 id="how-title">
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

        {/* ===================================================
            06 — VIRTUAL ASSISTANT
        =================================================== */}

        <section
          className={styles.assistantSection}
          id="assistant"
          aria-labelledby="assistant-title"
        >
          <div className={styles.assistantGlow} />

          <div className={styles.assistantContent}>
            <div className={styles.aiBadge}>
              <Bot size={15} />
              VITAL ASSISTANT
            </div>

            <h2 id="assistant-title">
              Healthcare guidance,
              <span> in plain language.</span>
            </h2>

            <p>
              Describe your healthcare requirement in your own words. Vital
              can help organize the information, identify relevant options,
              and guide you through the next step.
            </p>

            <div className={styles.assistantCapabilities}>
              <span>
                <CheckCircle2 size={15} />
                Understand your requirement
              </span>

              <span>
                <CheckCircle2 size={15} />
                Identify relevant specialties
              </span>

              <span>
                <CheckCircle2 size={15} />
                Find suitable hospitals
              </span>

              <span>
                <CheckCircle2 size={15} />
                Explain available options
              </span>
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate("/chatbot")}
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

                I can help you explore suitable options. I’ll consider your
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

        {/* ===================================================
            07 — FEATURES
        =================================================== */}

        <section
          className={styles.featuresSection}
          id="features"
          aria-labelledby="features-title"
        >
          <div className={styles.sectionHeaderCentered}>
            <span className={styles.sectionEyebrow}>THE VITAL EXPERIENCE</span>

            <h2 id="features-title">
              Built around
              <span> your healthcare needs.</span>
            </h2>

            <p>
              A healthcare discovery experience designed to reduce the
              complexity of finding, understanding, and comparing care.
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

        {/* ===================================================
            08 — TEAM
        =================================================== */}

        <section
          className={styles.teamSection}
          id="team"
          aria-labelledby="team-title"
        >
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionEyebrow}>THE TEAM</span>

              <h2 id="team-title">
                The people behind
                <span> Vital.</span>
              </h2>
            </div>

            <div className={styles.teamHeaderSide}>
              <p>
                Four people, one idea, and a lot of building — focused on
                making healthcare discovery simpler.
              </p>

              <button
                type="button"
                className={styles.outlineButton}
                onClick={() => console.log("Open team page")}
              >
                Meet the team
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>

          <div className={styles.teamGrid}>
            {TEAM.map((member) => (
              <article className={styles.teamCard} key={member.name + member.role}>
                <div className={styles.teamAvatar}>{member.initial}</div>

                <div className={styles.teamInfo}>
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                </div>

                <ArrowUpRight
                  size={17}
                  className={styles.teamArrow}
                />
              </article>
            ))}
          </div>
        </section>

        {/* ===================================================
            09 — FINAL CTA
        =================================================== */}

        <section className={styles.finalCta} id="start">
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
        email="hello@curepulse.health"
        columns={[
          {
            title: "Explore",
            links: [
              { label: "Home", href: "/" },
              { label: "Find Hospitals", href: "#find" },
              { label: "Compare & Research", href: "/compare" },
              { label: "How It Works", href: "#how-it-works" },
            ],
          },
          {
            title: "Healthcare",
            links: [
              { label: "Hospital Search", href: "#find" },
              { label: "Virtual Assistant", href: "#assistant" },
              { label: "Emergency Help", href: "#emergency" },
              { label: "Features", href: "#features" },
            ],
          },
          {
            title: "Vital",
            links: [
              { label: "Team", href: "#team" },
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

/* =========================================================
   REQUIREMENT
========================================================= */

function Requirement({ icon, title, value }) {
  const Icon = icon;

  return (
    <div className={styles.requirement}>
      <div className={styles.requirementIcon}>
        <Icon size={18} />
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>

      <CheckCircle2
        size={16}
        className={styles.requirementCheck}
      />
    </div>
  );
}

export default Home;
