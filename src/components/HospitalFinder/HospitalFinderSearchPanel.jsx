function HospitalFinderSearchPanel({
  fetchNearbyFacilities,
  handleSearchScopeChange,
  isSearching,
  loadStateRecommendations,
  search,
  searchQuery,
  searchScope,
  setFacilities,
  setSearchQuery,
  userLocation,
}) {
  return (
    <section className="finder-search-panel">
      <div className="search-main">
        <label htmlFor="health-search">What healthcare do you need?</label>

        <div className="search-row">
          <div className="search-input-wrapper">
            <span className="search-symbol">⌕</span>

            <input
              id="health-search"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  search();
                }
              }}
              placeholder="e.g. kidney treatment, heart, cancer, eye..."
            />
          </div>

          <button
            className="primary-search-button"
            onClick={search}
            disabled={isSearching || (searchScope === "nearby" && !userLocation)}
          >
            {isSearching ? "Searching..." : "Find healthcare"}
          </button>
        </div>

        <div className="search-scope-toggle" role="group" aria-label="Search scope">
          <button
            type="button"
            className={searchScope === "india" ? "active" : ""}
            onClick={() => handleSearchScopeChange("india")}
          >
            Best researched in India
          </button>
          <button
            type="button"
            className={searchScope === "nearby" ? "active" : ""}
            onClick={() => handleSearchScopeChange("nearby")}
          >
            Nearby hospitals
          </button>
        </div>

        <div className="search-chips">
          {[
            "Kidney treatment",
            "Heart",
            "Cancer",
            "Eye",
            "Orthopedic",
            "Children",
            "Emergency",
          ].map((keyword) => (
            <button
              key={keyword}
              className="search-chip"
              onClick={() => {
                setSearchQuery(keyword);

                if (searchScope === "nearby" && userLocation) {
                  fetchNearbyFacilities(keyword);
                } else if (searchScope === "india") {
                  setFacilities([]);
                  loadStateRecommendations(keyword);
                }
              }}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HospitalFinderSearchPanel;
