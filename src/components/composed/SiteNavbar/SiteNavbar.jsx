import Navbar from "../Navbar/Navbar";

function SiteNavbar() {
  return (
    <Navbar
      logo="HackX"
      variant="glass"
      position="sticky"
      links={[
        {
          label: "Home",
          href: "/",
        },
        {
          label: "Features",
          href: "/#features",
        },
        {
          label: "How It Works",
          href: "/#how-it-works",
        },
        {
          label: "Team",
          href: "/team",
        },
      ]}
      cta={{
        label: "Back Home",
        variant: "outline",
        onClick: () => {
          window.location.href = "/";
        },
      }}
    />
  );
}

export default SiteNavbar;
