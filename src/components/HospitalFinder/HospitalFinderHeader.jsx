import { useState } from "react";

function HospitalFinderHeader({
  getUserLocation,
  locationStatus,
  locationLabel,
  onSelectLocation,
  userLocation,
}) {
  const [manualLocation, setManualLocation] = useState("");
  const [isSubmittingLocation, setIsSubmittingLocation] = useState(false);

  const submitManualLocation = async (event) => {
    event.preventDefault();
    setIsSubmittingLocation(true);
    try {
      await onSelectLocation(manualLocation);
    } finally {
      setIsSubmittingLocation(false);
    }
  };

  return (
    <header className="hospital-finder-header">
      <div>
        <div className="eyebrow">HEALTHCARE DISCOVERY</div>
        <h1>Find healthcare near you</h1>
        <p>
          Search hospitals by specialty, treatment, or condition.
        </p>
      </div>

      <div className="finder-location-controls">
        <button
          className="location-button"
          onClick={getUserLocation}
          disabled={locationStatus === "loading" || isSubmittingLocation}
        >
          <span className="location-icon">⌖</span>
          {locationStatus === "loading"
            ? "Detecting..."
            : userLocation
              ? "Use my location"
              : "Detect my location"}
        </button>
        <form className="manual-location-form" onSubmit={submitManualLocation}>
          <label htmlFor="manual-hospital-location">Or choose a location</label>
          {locationLabel && (
            <span className="manual-location-current" aria-live="polite">
              Currently using: {locationLabel}
            </span>
          )}
          <div>
            <input
              id="manual-hospital-location"
              type="text"
              value={manualLocation}
              onChange={(event) => setManualLocation(event.target.value)}
              placeholder="City, address, or postal code"
              autoComplete="street-address"
            />
            <button type="submit" disabled={isSubmittingLocation || !manualLocation.trim()}>
              {isSubmittingLocation ? "Finding..." : "Use location"}
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}

export default HospitalFinderHeader;
