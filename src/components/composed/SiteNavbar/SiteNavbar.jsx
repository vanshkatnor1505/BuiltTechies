import Navbar from "../Navbar/Navbar";

function SiteNavbar() {
  return (
    <Navbar
      logo="CurePulse"
      variant="glass"
      position="sticky"
      links={[
        {
          label: "Home",
          href: "/",
        },
        {
          label: "Find Hospitals",
          href: "/find-hospitals",
        },
        {
          label: "Compare & Research",
          href: "/compare",
        },
        {
          label: "Assistant",
          href: "/chatbot",
        },
        {
          label: "Team",
          href: "/team",
        },
      ]}
      cta={{
        label: "Open Assistant",
        variant: "primary",
        onClick: () => {
          window.location.href = "/chatbot";
        },
      }}
    />
  );
}

export default SiteNavbar;
