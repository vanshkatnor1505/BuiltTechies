function HospitalFinderToolbar({
  clearFilters,
  emergencyOnly,
  facilityType,
  facilityTypes,
  fetchNearbyFacilities,
  isHealthcareSearch,
  loadStateRecommendations,
  radius,
  searchQuery,
  searchScope,
  schemeFilter,
  setEmergencyOnly,
  setFacilityType,
  setRadius,
  setSchemeFilter,
  setSortBy,
  setViewMode,
  sortBy,
  userLocation,
  viewMode,
}) {
  return (
    <section className="finder-toolbar">
      <div className="toolbar-left">
        {searchScope === "nearby" && (
          <div className="filter-group">
            <label>Radius</label>
            <select
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            >
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={50}>50 km</option>
              <option value={100}>State level (100 km)</option>
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Facility</label>
          <select
            value={facilityType}
            onChange={(event) => setFacilityType(event.target.value)}
          >
            <option value="all">All facilities</option>
            {facilityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="scheme-filter">Insurance / scheme</label>
          <select
            id="scheme-filter"
            value={schemeFilter}
            onChange={(event) => setSchemeFilter(event.target.value)}
          >
            <option value="all">Any scheme status</option>
            <option value="pmjay-candidates">PM-JAY candidates</option>
            <option value="scheme-info">PM-JAY status available</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort</label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="match">Requirement match</option>
            <option value="distance">Nearest first</option>
            <option value="name">Name</option>
          </select>
        </div>

        <label className="emergency-toggle">
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(event) => {
              const nextEmergencyMode = event.target.checked;

              setEmergencyOnly(nextEmergencyMode);

              if (searchScope === "nearby" && userLocation) {
                fetchNearbyFacilities(searchQuery, nextEmergencyMode);
              } else if (searchScope === "india" && isHealthcareSearch(searchQuery)) {
                loadStateRecommendations(searchQuery, "india");
              }
            }}
          />
          <span className="toggle-track"><span /></span>
          Emergency only
        </label>

        <button className="clear-button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      <div className="view-switcher">
        <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
          List
        </button>
        <button className={viewMode === "split" ? "active" : ""} onClick={() => setViewMode("split")}>
          Split
        </button>
        <button className={viewMode === "map" ? "active" : ""} onClick={() => setViewMode("map")}>
          Map
        </button>
      </div>
    </section>
  );
}

export default HospitalFinderToolbar;
