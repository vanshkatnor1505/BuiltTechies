function HospitalFinderHeader({
  getUserLocation,
  locationStatus,
  userLocation,
}) {
  return (
    <header className="hospital-finder-header">
      <div>
        <div className="eyebrow">HEALTHCARE DISCOVERY</div>
        <h1>Find the right healthcare facility</h1>
        <p>
          Search by health problem, treatment, or specialty. We match your
          requirement with mapped healthcare data around your location.
        </p>
      </div>

      <button
        className="location-button"
        onClick={getUserLocation}
        disabled={locationStatus === "loading"}
      >
        <span className="location-icon">⌖</span>
        {locationStatus === "loading"
          ? "Detecting..."
          : userLocation
            ? "Location detected"
            : "Use my location"}
      </button>
    </header>
  );
}

export default HospitalFinderHeader;
