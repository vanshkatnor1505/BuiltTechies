import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./HospitalFinder.css";
import SiteNavbar from "../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../components/composed/Footer/Footer";

const DEFAULT_CENTER = [30.7333, 76.7794];

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const SEARCH_GROUPS = [
  {
    key: "kidney",
    aliases: [
      "kidney",
      "renal",
      "nephrology",
      "nephrologist",
      "dialysis",
      "urology",
      "urologist",
      "renal care",
      "kidney treatment",
    ],
  },
  {
    key: "heart",
    aliases: [
      "heart",
      "cardiac",
      "cardiology",
      "cardiologist",
      "coronary",
      "heart treatment",
    ],
  },
  {
    key: "cancer",
    aliases: [
      "cancer",
      "oncology",
      "oncologist",
      "tumor",
      "chemotherapy",
      "radiotherapy",
      "radiation",
    ],
  },
  {
    key: "brain",
    aliases: [
      "brain",
      "neurology",
      "neurologist",
      "neurosurgery",
      "neurosurgeon",
      "stroke",
      "epilepsy",
    ],
  },
  {
    key: "orthopedic",
    aliases: [
      "orthopedic",
      "orthopaedic",
      "orthopedics",
      "bone",
      "joint",
      "fracture",
      "spine",
      "spinal",
    ],
  },
  {
    key: "eye",
    aliases: [
      "eye",
      "ophthalmology",
      "ophthalmologist",
      "optometry",
      "vision",
      "cataract",
      "retina",
    ],
  },
  {
    key: "dental",
    aliases: [
      "dental",
      "dentist",
      "dentistry",
      "tooth",
      "teeth",
      "oral",
      "maxillofacial",
    ],
  },
  {
    key: "skin",
    aliases: [
      "skin",
      "dermatology",
      "dermatologist",
      "acne",
      "hair",
      "cosmetic",
    ],
  },
  {
    key: "children",
    aliases: [
      "children",
      "child",
      "pediatric",
      "paediatric",
      "pediatrics",
      "paediatrics",
      "kids",
      "baby",
    ],
  },
  {
    key: "women",
    aliases: [
      "women",
      "gynecology",
      "gynaecology",
      "gynecologist",
      "obstetrics",
      "obstetrician",
      "maternity",
      "pregnancy",
      "fertility",
    ],
  },
  {
    key: "general",
    aliases: [
      "general",
      "general medicine",
      "multispeciality",
      "multispecialty",
      "hospital",
      "clinic",
      "doctor",
    ],
  },
  {
    key: "emergency",
    aliases: [
      "emergency",
      "urgent",
      "trauma",
      "accident",
      "casualty",
    ],
  },
  {
    key: "ent",
    aliases: [
      "ent",
      "ear",
      "nose",
      "throat",
      "otolaryngology",
      "otology",
    ],
  },
  {
    key: "lung",
    aliases: [
      "lung",
      "pulmonary",
      "pulmonology",
      "respiratory",
      "chest",
      "asthma",
    ],
  },
  {
    key: "gastro",
    aliases: [
      "gastro",
      "gastroenterology",
      "gastroenterologist",
      "stomach",
      "liver",
      "hepatology",
      "digestive",
      "intestine",
    ],
  },
  {
    key: "psychiatry",
    aliases: [
      "psychiatry",
      "psychiatrist",
      "mental health",
      "psychology",
      "psychologist",
      "behavioral",
    ],
  },
  {
    key: "physiotherapy",
    aliases: [
      "physiotherapy",
      "physiotherapist",
      "physical therapy",
      "rehabilitation",
      "rehab",
    ],
  },
  {
    key: "endocrine",
    aliases: [
      "endocrine",
      "endocrinology",
      "diabetes",
      "thyroid",
      "hormone",
    ],
  },
];

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s:-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function getSearchGroups(query) {
  const normalizedQuery = normalize(query);

  return SEARCH_GROUPS.filter((group) =>
    group.aliases.some(
      (alias) =>
        normalizedQuery.includes(alias) ||
        alias.includes(normalizedQuery)
    )
  );
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTravelTime(distanceKm) {
  if (!Number.isFinite(distanceKm)) return null;

  const averageSpeed = distanceKm < 5 ? 25 : 35;
  return Math.max(2, Math.round((distanceKm / averageSpeed) * 60));
}

function getElementCoordinates(element) {
  if (element.type === "node") {
    return {
      lat: element.lat,
      lon: element.lon,
    };
  }

  if (element.center) {
    return {
      lat: element.center.lat,
      lon: element.center.lon,
    };
  }

  return null;
}

function getFacilityType(tags = {}) {
  if (tags.amenity === "hospital") return "Hospital";
  if (tags.amenity === "clinic") return "Clinic";
  if (tags.amenity === "doctors") return "Doctor / Clinic";

  if (tags.healthcare === "hospital") return "Hospital";
  if (tags.healthcare === "clinic") return "Clinic";
  if (tags.healthcare === "doctor") return "Doctor / Clinic";

  return "Healthcare Facility";
}

function getSpecialties(tags = {}) {
  return [
    tags["healthcare:speciality"],
    tags["healthcare:specialties"],
    tags["medical:specialty"],
    tags["medical_specialty"],
    tags.speciality,
    tags.specialties,
    tags.description,
    tags["healthcare:speciality:en"],
  ]
    .filter(Boolean)
    .join(", ");
}

function getFacilityText(tags = {}) {
  return normalize(
    [
      tags.name,
      tags["name:en"],
      tags.amenity,
      tags.healthcare,
      tags["healthcare:speciality"],
      tags["healthcare:specialties"],
      tags["medical:specialty"],
      tags["medical_specialty"],
      tags.speciality,
      tags.specialties,
      tags.description,
      tags.operator,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function calculateRequirementMatch(tags, query) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) return 50;

  const facilityText = getFacilityText(tags);
  const groups = getSearchGroups(query);

  if (
    normalizedQuery === "hospital" ||
    normalizedQuery === "hospitals"
  ) {
    return tags.amenity === "hospital" ? 100 : 70;
  }

  if (
    normalizedQuery === "clinic" ||
    normalizedQuery === "clinics"
  ) {
    return tags.amenity === "clinic" ? 100 : 70;
  }

  let score = 35;

  if (facilityText.includes(normalizedQuery)) {
    score += 45;
  }

  if (groups.length > 0) {
    const matchedGroup = groups.find((group) =>
      group.aliases.some((alias) => facilityText.includes(alias))
    );

    if (matchedGroup) {
      score += 45;
    }

    const specialtyText = normalize(getSpecialties(tags));

    if (
      matchedGroup &&
      matchedGroup.aliases.some((alias) => specialtyText.includes(alias))
    ) {
      score += 20;
    }
  }

  const queryWords = normalizedQuery
    .split(" ")
    .filter((word) => word.length > 2);

  const matchedWords = queryWords.filter((word) =>
    facilityText.includes(word)
  );

  if (queryWords.length > 0) {
    score += Math.round((matchedWords.length / queryWords.length) * 20);
  }

  return Math.min(99, Math.max(25, score));
}

function buildAddress(tags = {}) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address not available";
}

function transformFacility(element, userLocation, searchQuery) {
  const coordinates = getElementCoordinates(element);

  if (!coordinates) return null;

  const tags = element.tags || {};

  const distanceKm = haversineDistance(
    userLocation.lat,
    userLocation.lon,
    coordinates.lat,
    coordinates.lon
  );

  const emergency =
    tags.emergency === "yes" ||
    tags["emergency:ambulance"] === "yes" ||
    normalize(tags.description).includes("emergency");

  return {
    id: `${element.type}-${element.id}`,
    osmId: element.id,
    osmType: element.type,
    name:
      tags.name ||
      tags["name:en"] ||
      "Unnamed healthcare facility",

    type: getFacilityType(tags),

    lat: coordinates.lat,
    lon: coordinates.lon,

    tags,

    address: buildAddress(tags),

    phone: tags.phone || tags["contact:phone"] || "",

    website:
      tags.website ||
      tags["contact:website"] ||
      tags.url ||
      "",

    openingHours: tags.opening_hours || "",

    operator: tags.operator || "",

    emergency,

    specialties: getSpecialties(tags),

    healthcare: tags.healthcare || "",

    amenity: tags.amenity || "",

    distanceKm,

    travelMinutes: estimateTravelTime(distanceKm),

    match: calculateRequirementMatch(tags, searchQuery),
  };
}

function createFacilityIcon(selected = false, emergency = false) {
  return L.divIcon({
    className: "hospital-marker-wrapper",
    html: `
      <div class="
        hospital-marker
        ${selected ? "is-selected" : ""}
        ${emergency ? "is-emergency" : ""}
      ">
        <span>+</span>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

function MapController({ center, selectedFacility, route }) {
  const map = useMap();

  useEffect(() => {
    if (selectedFacility) {
      map.flyTo(
        [selectedFacility.lat, selectedFacility.lon],
        15,
        {
          duration: 0.8,
        }
      );
    }
  }, [selectedFacility, map]);

  useEffect(() => {
    if (!route || route.length === 0) return;

    const bounds = L.latLngBounds(route);
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [route, map]);

  useEffect(() => {
    if (!selectedFacility && !route) {
      map.setView(center, 13);
    }
  }, [center, selectedFacility, route, map]);

  return null;
}

export default function HospitalFinder() {
  const [searchQuery, setSearchQuery] = useState("Kidney treatment");

  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const [radius, setRadius] = useState(5);

  const [facilityType, setFacilityType] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const [sortBy, setSortBy] = useState("match");

  const [viewMode, setViewMode] = useState("split");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const [compareIds, setCompareIds] = useState([]);

  const [lastUpdated, setLastUpdated] = useState(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setError("Your browser does not support location access.");
      return;
    }

    setLocationStatus("loading");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationStatus("success");
        setError("");
      },
      (locationError) => {
        console.error(locationError);

        setLocationStatus("error");

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. Please allow location access in your browser."
          );
        } else if (locationError.code === 2) {
          setError("Your location could not be determined.");
        } else {
          setError("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  const fetchNearbyFacilities = useCallback(async () => {
    if (!userLocation) {
      setError("Please allow location access before searching nearby facilities.");
      return;
    }

    setLoading(true);
    setError("");
    setSelectedFacility(null);
    setRoute(null);

    const query = `
      [out:json][timeout:25];

      (
        nwr(
          around:${radius * 1000},
          ${userLocation.lat},
          ${userLocation.lon}
        )["amenity"~"hospital|clinic|doctors"];

        nwr(
          around:${radius * 1000},
          ${userLocation.lat},
          ${userLocation.lon}
        )["healthcare"];
      );

      out center tags;
    `;

    let responseData = null;
    let lastError = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) {
          throw new Error(`Overpass returned HTTP ${response.status}`);
        }

        responseData = await response.json();
        break;
      } catch (requestError) {
        lastError = requestError;
      }
    }

    if (!responseData) {
      console.error(lastError);

      setLoading(false);
      setError(
        "The healthcare map service is temporarily unavailable. Please try again in a moment."
      );
      return;
    }

    const uniqueElements = new Map();

    (responseData.elements || []).forEach((element) => {
      uniqueElements.set(
        `${element.type}-${element.id}`,
        element
      );
    });

    const transformed = Array.from(uniqueElements.values())
      .map((element) =>
        transformFacility(element, userLocation, searchQuery)
      )
      .filter(Boolean)
      .filter((facility) => facility.distanceKm <= radius);

    setFacilities(transformed);
    setLastUpdated(new Date());

    if (transformed.length === 0) {
      setError(
        "No mapped healthcare facilities were found in this area. Try increasing the search radius or changing the search term."
      );
    }

    setLoading(false);
  }, [radius, searchQuery, userLocation]);

  useEffect(() => {
    if (!userLocation) {
      getLocation();
    }
  }, [getLocation, userLocation]);

  const filteredFacilities = useMemo(() => {
    let result = [...facilities];

    if (facilityType !== "all") {
      result = result.filter(
        (facility) => facility.type === facilityType
      );
    }

    if (emergencyOnly) {
      result = result.filter((facility) => facility.emergency);
    }

    result.sort((a, b) => {
      if (sortBy === "distance") {
        return a.distanceKm - b.distanceKm;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "match") {
        if (b.match !== a.match) {
          return b.match - a.match;
        }

        return a.distanceKm - b.distanceKm;
      }

      return 0;
    });

    return result;
  }, [facilities, facilityType, emergencyOnly, sortBy]);

  const facilityTypes = useMemo(() => {
    return Array.from(
      new Set(facilities.map((facility) => facility.type))
    );
  }, [facilities]);

  const search = () => {
    fetchNearbyFacilities();
  };

  const selectFacility = (facility) => {
    setSelectedFacility(facility);
    setViewMode("split");
  };

  const toggleCompare = (facility) => {
    setCompareIds((current) => {
      if (current.includes(facility.id)) {
        return current.filter((id) => id !== facility.id);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, facility.id];
    });
  };

  const clearFilters = () => {
    setFacilityType("all");
    setEmergencyOnly(false);
    setSortBy("match");
    setRadius(5);
  };

  const startRoute = async (facility) => {
    if (!userLocation) return;

    setSelectedFacility(facility);
    setRouteLoading(true);
    setError("");

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userLocation.lon},${userLocation.lat};` +
        `${facility.lon},${facility.lat}` +
        `?overview=full&geometries=geojson`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Route request failed.");
      }

      const data = await response.json();

      if (!data.routes?.length) {
        throw new Error("No route found.");
      }

      const coordinates = data.routes[0].geometry.coordinates.map(
        ([lon, lat]) => [lat, lon]
      );

      setRoute(coordinates);
    } catch (routeError) {
      console.error(routeError);
      setError(
        "The route could not be loaded. You can still open navigation in Google Maps."
      );
    } finally {
      setRouteLoading(false);
    }
  };

  const openGoogleMaps = (facility) => {
    if (!userLocation) return;

    const destination = `${facility.lat},${facility.lon}`;
    const origin = `${userLocation.lat},${userLocation.lon}`;

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      `&travelmode=driving`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const compareFacilities = useMemo(() => {
    return facilities.filter((facility) =>
      compareIds.includes(facility.id)
    );
  }, [facilities, compareIds]);

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lon]
    : DEFAULT_CENTER;

  return (
    <div className="hospital-finder-page" data-theme="vital">
      <SiteNavbar />
      <div className="hospital-finder-shell">

        {/* HEADER */}
        <header className="hospital-finder-header">
          <div>
            <div className="eyebrow">
              HEALTHCARE DISCOVERY
            </div>

            <h1>Find the right healthcare facility</h1>

            <p>
              Search by health problem, treatment, or specialty.
              We match your requirement with mapped healthcare data
              around your location.
            </p>
          </div>

          <button
            className="location-button"
            onClick={getLocation}
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

        {/* SEARCH */}
        <section className="finder-search-panel">
          <div className="search-main">
            <label htmlFor="health-search">
              What healthcare do you need?
            </label>

            <div className="search-row">
              <div className="search-input-wrapper">
                <span className="search-symbol">⌕</span>

                <input
                  id="health-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
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
                disabled={loading || !userLocation}
              >
                {loading ? "Searching..." : "Find healthcare"}
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

                    if (userLocation) {
                      setTimeout(() => {
                        fetchNearbyFacilities();
                      }, 0);
                    }
                  }}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* STATUS */}
        {error && (
          <div className="finder-alert">
            <span>!</span>
            <div>
              <strong>Search status</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* FILTER BAR */}
        <section className="finder-toolbar">
          <div className="toolbar-left">

            <div className="filter-group">
              <label>Radius</label>

              <select
                value={radius}
                onChange={(event) =>
                  setRadius(Number(event.target.value))
                }
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Facility</label>

              <select
                value={facilityType}
                onChange={(event) =>
                  setFacilityType(event.target.value)
                }
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
              <label>Sort</label>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
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
                onChange={(event) =>
                  setEmergencyOnly(event.target.checked)
                }
              />

              <span className="toggle-track">
                <span />
              </span>

              Emergency only
            </label>

            <button
              className="clear-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>

          <div className="view-switcher">
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              List
            </button>

            <button
              className={viewMode === "split" ? "active" : ""}
              onClick={() => setViewMode("split")}
            >
              Split
            </button>

            <button
              className={viewMode === "map" ? "active" : ""}
              onClick={() => setViewMode("map")}
            >
              Map
            </button>
          </div>
        </section>

        {/* RESULTS INFO */}
        <div className="results-meta">
          <div>
            <strong>{filteredFacilities.length}</strong>{" "}
            healthcare facilities found
          </div>

          <div className="data-source">
            Map data: OpenStreetMap
            {lastUpdated && (
              <>
                {" "}
                · Updated{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </div>
        </div>

        {/* MAIN */}
        <main
          className={`finder-content view-${viewMode}`}
        >
          {/* LIST */}
          {viewMode !== "map" && (
            <section className="facility-results">
              {loading ? (
                <div className="loading-card">
                  <div className="loading-spinner" />
                  <h3>Finding nearby healthcare...</h3>
                  <p>
                    Searching OpenStreetMap healthcare data
                    around your location.
                  </p>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="empty-card">
                  <div className="empty-icon">⌖</div>

                  <h3>No matching facilities</h3>

                  <p>
                    Try increasing the search radius or using a
                    broader healthcare term.
                  </p>

                  <button
                    className="primary-button"
                    onClick={search}
                    disabled={!userLocation}
                  >
                    Search again
                  </button>
                </div>
              ) : (
                filteredFacilities.map((facility) => {
                  const isSelected =
                    selectedFacility?.id === facility.id;

                  const isCompared =
                    compareIds.includes(facility.id);

                  return (
                    <article
                      className={`facility-card ${
                        isSelected ? "selected" : ""
                      }`}
                      key={facility.id}
                      onClick={() =>
                        selectFacility(facility)
                      }
                    >
                      <div className="facility-card-top">
                        <div className="facility-type">
                          {facility.type}
                        </div>

                        {facility.emergency && (
                          <span className="emergency-badge">
                            Emergency
                          </span>
                        )}
                      </div>

                      <div className="facility-card-body">
                        <div className="facility-main">
                          <h2>{facility.name}</h2>

                          <p className="facility-address">
                            {facility.address}
                          </p>

                          {facility.specialties && (
                            <p className="facility-specialties">
                              <strong>Specialties:</strong>{" "}
                              {facility.specialties}
                            </p>
                          )}

                          <div className="facility-metrics">
                            <span>
                              {facility.distanceKm.toFixed(1)} km
                            </span>

                            {facility.travelMinutes && (
                              <span>
                                ~{facility.travelMinutes} min drive
                              </span>
                            )}

                            <span>
                              {facility.match}% requirement match
                            </span>
                          </div>
                        </div>

                        <div className="match-circle">
                          <strong>{facility.match}</strong>
                          <span>%</span>
                        </div>
                      </div>

                      <div className="facility-data-note">
                        Match is calculated from available OpenStreetMap
                        tags and your search requirement.
                      </div>

                      <div
                        className="facility-actions"
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <button
                          onClick={() =>
                            startRoute(facility)
                          }
                        >
                          {routeLoading &&
                          selectedFacility?.id === facility.id
                            ? "Loading route..."
                            : "Route"}
                        </button>

                        <button
                          onClick={() =>
                            openGoogleMaps(facility)
                          }
                        >
                          Navigate
                        </button>

                        {facility.phone && (
                          <a
                            href={`tel:${facility.phone}`}
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            Call
                          </a>
                        )}

                        {facility.website && (
                          <a
                            href={facility.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            Website
                          </a>
                        )}

                        <button
                          className={
                            isCompared ? "compare-active" : ""
                          }
                          onClick={() =>
                            toggleCompare(facility)
                          }
                        >
                          {isCompared
                            ? "Compared"
                            : "Compare"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          )}

          {/* MAP */}
          {viewMode !== "list" && (
            <section className="finder-map-container">
              <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom
                className="healthcare-map"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController
                  center={mapCenter}
                  selectedFacility={selectedFacility}
                  route={route}
                />

                {userLocation && (
                  <>
                    <Circle
                      center={[
                        userLocation.lat,
                        userLocation.lon,
                      ]}
                      radius={40}
                      pathOptions={{
                        className: "user-location-circle",
                      }}
                    />

                    <Marker
                      position={[
                        userLocation.lat,
                        userLocation.lon,
                      ]}
                      icon={L.divIcon({
                        className: "user-location-marker-wrapper",
                        html: `
                          <div class="user-location-marker">
                            <div></div>
                          </div>
                        `,
                        iconSize: [22, 22],
                        iconAnchor: [11, 11],
                      })}
                    />
                  </>
                )}

                {filteredFacilities.map((facility) => (
                  <Marker
                    key={facility.id}
                    position={[
                      facility.lat,
                      facility.lon,
                    ]}
                    icon={createFacilityIcon(
                      selectedFacility?.id === facility.id,
                      facility.emergency
                    )}
                    eventHandlers={{
                      click: () =>
                        selectFacility(facility),
                    }}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{facility.name}</strong>

                        <span>{facility.type}</span>

                        <small>
                          {facility.distanceKm.toFixed(1)} km away
                        </small>

                        <button
                          onClick={() =>
                            startRoute(facility)
                          }
                        >
                          Route here
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {route && (
                  <Polyline
                    positions={route}
                    pathOptions={{
                      className: "route-line",
                    }}
                  />
                )}
              </MapContainer>

              {/* MAP LEGEND */}
              <div className="map-legend">
                <div>
                  <span className="legend-dot user" />
                  Your location
                </div>

                <div>
                  <span className="legend-dot facility" />
                  Healthcare facility
                </div>

                <div>
                  <span className="legend-dot emergency" />
                  Emergency facility
                </div>
              </div>
            </section>
          )}
        </main>

        {/* COMPARE */}
        {compareFacilities.length > 0 && (
          <section className="comparison-panel">
            <div className="comparison-header">
              <div>
                <span className="eyebrow">
                  COMPARISON
                </span>

                <h2>
                  Compare selected facilities
                </h2>
              </div>

              <button
                onClick={() => setCompareIds([])}
              >
                Clear comparison
              </button>
            </div>

            <div className="comparison-grid">
              {compareFacilities.map((facility) => (
                <div
                  className="comparison-card"
                  key={facility.id}
                >
                  <div className="comparison-score">
                    {facility.match}%
                  </div>

                  <h3>{facility.name}</h3>

                  <span>{facility.type}</span>

                  <p>
                    {facility.distanceKm.toFixed(1)} km away
                  </p>

                  <p>
                    {facility.specialties ||
                      "Specialty data not available"}
                  </p>

                  <button
                    onClick={() =>
                      selectFacility(facility)
                    }
                  >
                    View on map
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DATA DISCLAIMER */}
        <footer className="finder-footer">
          <div>
            <strong>Healthcare data note</strong>

            <p>
              Facility information comes from OpenStreetMap and may
              be incomplete or outdated. Missing information is not
              treated as a positive or negative signal.
            </p>
          </div>

          <div>
            <strong>Not medical advice</strong>

            <p>
              This tool helps with healthcare discovery and navigation.
              It does not diagnose conditions or recommend a medical
              treatment.
            </p>
          </div>
        </footer>
      </div>

      <Footer
        logo="HackX"
        description="Discover, compare, and access healthcare options that fit your needs."
        copyright="HackX. All rights reserved."
      />
    </div>
  );
}