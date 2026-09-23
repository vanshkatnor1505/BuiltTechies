import { useState } from "react";
import { Link } from "react-router-dom";
import SiteNavbar from "../../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../../components/composed/Footer/Footer";
import { useHospitalSearch } from "../../context/HospitalSearchContext";
import "./HospitalComparison.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const body = await response.text();
    throw new Error(
      body.includes("<!DOCTYPE")
        ? "The research API was not reached. Restart the Vite app and backend, then try again."
        : `Research API returned an unexpected response (${response.status}).`,
    );
  }
  return response.json();
}

const comparisonRows = [
  ["Requirement match", (facility) => `${facility.match}%`],
  ["Facility type", (facility) => facility.type],
  ["Distance", (facility) => `${facility.distanceKm.toFixed(1)} km`],
  ["Estimated drive", (facility) => facility.travelMinutes ? `~${facility.travelMinutes} min` : "Data not available"],
  ["Specialties", (facility) => facility.specialties || "Data not available"],
  ["Emergency care", (facility) => facility.emergency ? "Listed in map data" : "Not verified"],
  ["Phone", (facility) => facility.phone || "Data not available"],
  ["Patients treated", (facility) => facility.research?.metrics?.patientsTreated || "Data not available"],
  ["Success / outcome rate", (facility) => facility.research?.metrics?.successRate || "Data not available"],
  ["Average treatment cost", (facility) => facility.research?.metrics?.treatmentCost || "Data not available"],
  ["Insurance / schemes", (facility) => facility.research?.metrics?.insurance || "Data not available"],
];

function HospitalComparison() {
  const {
    searchState,
    setSearchState,
    toggleCompare,
    clearComparison,
  } = useHospitalSearch();
  const [loadingId, setLoadingId] = useState("");
  const [facilitiesPage, setFacilitiesPage] = useState(0);
  const FACILITIES_PER_PAGE = 5;
  const facilities = searchState.facilities || [];
  const compareIds = (searchState.compareIds || []).filter((id) =>
    facilities.some((facility) => facility.id === id),
  );
  const researchById = searchState.researchById || {};
  const selectedFacilities = facilities
    .filter((facility) => compareIds.includes(facility.id))
    .map((facility) => ({ ...facility, research: researchById[facility.id] }));
  const totalFacilitiesPages = Math.max(
    1,
    Math.ceil(facilities.length / FACILITIES_PER_PAGE),
  );
  const visibleFacilities = facilities.slice(
    facilitiesPage * FACILITIES_PER_PAGE,
    (facilitiesPage + 1) * FACILITIES_PER_PAGE,
  );

  const researchFacility = async (facility) => {
    if (researchById[facility.id] || loadingId) return;
    setLoadingId(facility.id);
    try {
      const response = await fetch(`${API_URL}/api/hospital-research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: facility.name,
          address: facility.address,
          website: facility.website,
        }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Research failed.");
      setSearchState((current) => ({
        ...current,
        researchById: { ...(current.researchById || {}), [facility.id]: data },
      }));
    } catch (error) {
      const message = error instanceof TypeError
        ? "Research service is unavailable. Start the backend with npm run server and try again."
        : error.message;
      setSearchState((current) => ({
        ...current,
        researchById: {
          ...(current.researchById || {}),
          [facility.id]: { error: message },
        },
      }));
    } finally {
      setLoadingId("");
    }
  };

  return (
    <div className="comparison-page">
      <SiteNavbar />
      <main className="comparison-shell">
        <header className="comparison-hero">
          <div>
            <span className="comparison-eyebrow">COMPARE & RESEARCH</span>
            <h1>Make a clearer healthcare decision.</h1>
            <p>
              Select up to three facilities from your latest search, compare the
              available details side by side, and request source-backed research.
            </p>
          </div>
          <Link className="comparison-back-link" to="/find-hospitals">Find hospitals</Link>
        </header>

        {facilities.length === 0 ? (
          <section className="comparison-empty">
            <h2>Start with a hospital search</h2>
            <p>Your selected hospitals will appear here after you search nearby healthcare facilities.</p>
            <Link className="comparison-primary-button" to="/find-hospitals">Search hospitals</Link>
          </section>
        ) : (
          <>
            <section className="comparison-picker">
              <div className="comparison-section-heading">
                <div>
                  <span className="comparison-eyebrow">YOUR SEARCH RESULTS</span>
                  <h2>Choose hospitals to compare</h2>
                </div>
                <span className="comparison-count">{compareIds.length} of 3 selected</span>
              </div>
              <div className="comparison-picker-grid">
                {visibleFacilities.map((facility) => (
                  <button
                    className={`comparison-picker-card ${compareIds.includes(facility.id) ? "selected" : ""}`}
                    key={facility.id}
                    onClick={() => toggleCompare(facility)}
                  >
                    <span>{facility.type}</span>
                    <strong>{facility.name}</strong>
                    <small>{facility.distanceKm.toFixed(1)} km · {facility.match}% match</small>
                  </button>
                ))}
              </div>
              {facilities.length > FACILITIES_PER_PAGE && (
                <div className="comparison-picker-pagination">
                  <button
                    onClick={() => setFacilitiesPage((page) => Math.max(0, page - 1))}
                    disabled={facilitiesPage === 0}
                  >
                    Previous
                  </button>
                  <span>Page {facilitiesPage + 1} of {totalFacilitiesPages}</span>
                  <button
                    onClick={() => setFacilitiesPage((page) => Math.min(totalFacilitiesPages - 1, page + 1))}
                    disabled={facilitiesPage === totalFacilitiesPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>

            {selectedFacilities.length > 0 ? (
              <section className="comparison-table-section">
                <div className="comparison-section-heading">
                  <div>
                    <span className="comparison-eyebrow">SIDE-BY-SIDE VIEW</span>
                    <h2>Hospital comparison</h2>
                  </div>
                  <button className="comparison-clear-button" onClick={clearComparison}>
                    Clear selection
                  </button>
                </div>
                <div className="comparison-image-grid">
                  {selectedFacilities.map((facility) => {
                    const images = facility.research?.images || [];
                    const visibleImages = images.slice(0, 3);

                    return (
                      <article className="comparison-image-card" key={facility.id}>
                        {visibleImages.length > 0 ? (
                          <div className="comparison-image-list">
                            {visibleImages.map((image) => (
                              <a
                                href={image.sourceUrl || image.url}
                                target="_blank"
                                rel="noreferrer"
                                className="comparison-image-link"
                                key={image.url}
                              >
                                <img
                                  src={image.url}
                                  alt={`${facility.name} hospital`}
                                  loading="lazy"
                                />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="comparison-image-placeholder">
                            {facility.research
                              ? "No public image found"
                              : "Verify data to search for images"}
                          </div>
                        )}
                        <strong>{facility.name}</strong>
                        {visibleImages.length > 0 && (
                          <small>
                            Image source: {visibleImages[0].source || "Public web image"}
                            {visibleImages[0].artist ? ` · ${visibleImages[0].artist}` : ""}
                          </small>
                        )}
                      </article>
                    );
                  })}
                </div>
                <div className="comparison-table-wrap">
                  <table className="comparison-table">
                    <thead>
                      <tr><th>Details</th>{selectedFacilities.map((facility) => <th key={facility.id}>{facility.name}</th>)}</tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map(([label, value]) => (
                        <tr key={label}><th>{label}</th>{selectedFacilities.map((facility) => <td key={facility.id}>{value(facility)}</td>)}</tr>
                      ))}
                      <tr>
                        <th>Research</th>
                        {selectedFacilities.map((facility) => (
                          <td key={facility.id}>
                            <button className="research-button" onClick={() => researchFacility(facility)}>
                              {loadingId === facility.id ? "Researching..." : facility.research ? "Research checked" : "Research hospital"}
                            </button>
                            {facility.research?.error && <small className="research-error">{facility.research.error}</small>}
                            {facility.research?.summary && <p className="research-summary">{facility.research.summary}</p>}
                            {facility.research?.sources?.length > 0 && (
                              <div className="research-sources">
                                {facility.research.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title || "Source"}</a>)}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="comparison-note">Only source-backed information is displayed. “Data not available” means it could not be verified from the available sources.</p>
              </section>
            ) : (
              <section className="comparison-empty compact"><h2>Select hospitals above to compare</h2><p>Choose up to three facilities to see all available data together.</p></section>
            )}
          </>
        )}
      </main>
      <Footer
        logo="CurePulse"
        description="Discover, compare, and research healthcare options that fit your needs."
        columns={[{ title: "Explore", links: [{ label: "Home", href: "/" }, { label: "Find Hospitals", href: "/find-hospitals" }, { label: "Compare & Research", href: "/compare" }, { label: "AI Assistant", href: "/chatbot" }] }]}
      />
    </div>
  );
}

export default HospitalComparison;
