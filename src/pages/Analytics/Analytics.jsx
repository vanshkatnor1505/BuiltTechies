import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  Clock3,
  Hospital,
  Search,
  Users,
} from "lucide-react";
import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";
import styles from "./Analytics.module.css";

const periods = ["7 days", "30 days", "90 days"];

const metrics = [
  {
    label: "Unique visitors",
    value: "18,642",
    change: "+12.8%",
    trend: "up",
    detail: "vs. previous period",
    icon: Users,
  },
  {
    label: "Hospital searches",
    value: "7,426",
    change: "+8.4%",
    trend: "up",
    detail: "searches completed",
    icon: Search,
  },
  {
    label: "Comparison sessions",
    value: "2,184",
    change: "+16.2%",
    trend: "up",
    detail: "facilities compared",
    icon: BarChart3,
  },
  {
    label: "Assistant conversations",
    value: "1,906",
    change: "-3.1%",
    trend: "down",
    detail: "completed sessions",
    icon: Bot,
  },
];

const trafficSources = [
  { label: "Organic search", value: "46.8%", amount: "8,724", width: "78%", color: "teal" },
  { label: "Direct visits", value: "28.4%", amount: "5,295", width: "51%", color: "blue" },
  { label: "Social referrals", value: "14.7%", amount: "2,740", width: "31%", color: "violet" },
  { label: "Partner referrals", value: "10.1%", amount: "1,883", width: "22%", color: "amber" },
];

const activity = [
  { icon: Search, title: "Hospital search completed", detail: "Bengaluru, Karnataka", time: "2 min ago", tone: "teal" },
  { icon: Hospital, title: "Facility added to comparison", detail: "Apollo Hospitals · 3 facilities", time: "8 min ago", tone: "blue" },
  { icon: Bot, title: "Assistant session completed", detail: "Care navigation", time: "14 min ago", tone: "violet" },
  { icon: ChartNoAxesCombined, title: "Research report opened", detail: "Fortis Memorial Research Institute", time: "22 min ago", tone: "amber" },
];

const trendData = [
  { day: "Mon", value: 62, label: "2.4k" },
  { day: "Tue", value: 74, label: "2.9k" },
  { day: "Wed", value: 58, label: "2.2k" },
  { day: "Thu", value: 86, label: "3.3k" },
  { day: "Fri", value: 78, label: "3.0k" },
  { day: "Sat", value: 48, label: "1.8k" },
  { day: "Sun", value: 68, label: "2.6k" },
];

function Analytics() {
  return (
    <div className={styles.page}>
      <SiteNavbar />
      <main className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>CUREPULSE ANALYTICS</span>
            <h1>See how people find care.</h1>
            <p>
              A clear view of discovery, comparison, and assistant activity across the CurePulse experience.
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.dateButton} type="button">
              <CalendarDays size={16} aria-hidden="true" />
              <span>Sep 17 - Sep 23, 2026</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            <div className={styles.liveStatus}>
              <span aria-hidden="true" /> Live data
            </div>
          </div>
        </header>

        <section className={styles.dashboard} aria-label="Website analytics overview">
          <div className={styles.periodBar}>
            <div>
              <span className={styles.sectionLabel}>OVERVIEW</span>
              <h2>Performance snapshot</h2>
            </div>
            <div className={styles.periods} role="tablist" aria-label="Analytics period">
              {periods.map((period, index) => (
                <button
                  className={`${styles.period} ${index === 1 ? styles.periodActive : ""}`}
                  key={period}
                  type="button"
                  role="tab"
                  aria-selected={index === 1}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.metricGrid}>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
              return (
                <article className={styles.metricCard} key={metric.label}>
                  <div className={`${styles.metricIcon} ${styles[metric.trend]}`}>
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <strong className={styles.metricValue}>{metric.value}</strong>
                  <div className={styles.metricMeta}>
                    <span className={`${styles.change} ${styles[metric.trend]}`}>
                      <TrendIcon size={14} aria-hidden="true" /> {metric.change}
                    </span>
                    <span>{metric.detail}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.mainGrid}>
            <section className={`${styles.panel} ${styles.trendPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionLabel}>VISITOR ACTIVITY</span>
                  <h2>Discovery sessions</h2>
                </div>
                <div className={styles.panelLegend}><span /> Sessions</div>
              </div>
              <div className={styles.chart} aria-label="Discovery sessions from Monday to Sunday">
                <div className={styles.chartScale}><span>4k</span><span>3k</span><span>2k</span><span>1k</span><span>0</span></div>
                <div className={styles.chartArea}>
                  <div className={styles.chartLines}><i /><i /><i /><i /><i /></div>
                  <div className={styles.bars}>
                    {trendData.map((item) => (
                      <div className={styles.barGroup} key={item.day}>
                        <span className={styles.barValue}>{item.label}</span>
                        <div className={styles.barTrack}><div className={styles.bar} style={{ height: `${item.value}%` }} /></div>
                        <span className={styles.barDay}>{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionLabel}>ACQUISITION</span>
                  <h2>Where visitors come from</h2>
                </div>
                <Activity size={18} className={styles.panelIcon} aria-hidden="true" />
              </div>
              <div className={styles.sources}>
                {trafficSources.map((source) => (
                  <div className={styles.source} key={source.label}>
                    <div className={styles.sourceTop}><span>{source.label}</span><strong>{source.value}</strong></div>
                    <div className={styles.sourceBar}><div className={`${styles.sourceFill} ${styles[source.color]}`} style={{ width: source.width }} /></div>
                    <span className={styles.sourceAmount}>{source.amount} visitors</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.lowerGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionLabel}>POPULAR JOURNEYS</span>
                  <h2>What people explore</h2>
                </div>
                <span className={styles.updated}>Updated 5m ago</span>
              </div>
              <div className={styles.journeys}>
                <div className={styles.journey}><span>Find a hospital</span><strong>7,426 <small>38.6%</small></strong></div>
                <div className={styles.journey}><span>Compare facilities</span><strong>2,184 <small>11.4%</small></strong></div>
                <div className={styles.journey}><span>Ask the assistant</span><strong>1,906 <small>9.9%</small></strong></div>
                <div className={styles.journey}><span>Read FAQs</span><strong>1,372 <small>7.1%</small></strong></div>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionLabel}>RECENT ACTIVITY</span>
                  <h2>Latest events</h2>
                </div>
                <Clock3 size={18} className={styles.panelIcon} aria-hidden="true" />
              </div>
              <div className={styles.activityList}>
                {activity.map((item) => {
                  const Icon = item.icon;
                  return <div className={styles.activityItem} key={item.title}>
                    <span className={`${styles.activityIcon} ${styles[item.tone]}`}><Icon size={15} aria-hidden="true" /></span>
                    <div><strong>{item.title}</strong><span>{item.detail}</span></div>
                    <time>{item.time}</time>
                  </div>;
                })}
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Analytics;