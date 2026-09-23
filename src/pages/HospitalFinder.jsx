import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MapLibreMap from "../components/MapLibreMap/MapLibreMap";
import "./HospitalFinder.css";
import SiteNavbar from "../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../components/composed/Footer/Footer";
import { searchNearbyHealthcare } from "../services/geoapify";
import { useHospitalSearch } from "../context/HospitalSearchContext";

const DEFAULT_CENTER = [30.7333, 76.7794];

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const MAX_MAP_MARKERS = 40;
const RESULTS_PER_PAGE = 3;

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

  if (!normalizedQuery) {
    return [];
  }

  return SEARCH_GROUPS.filter((group) =>
    group.aliases.some(
      (alias) =>
        normalizedQuery.includes(alias) ||
        alias.includes(normalizedQuery),
    ),
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

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function estimateTravelTime(distanceKm) {
  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  const averageSpeed = distanceKm < 5 ? 25 : 35;

  return Math.max(
    2,
    Math.round((distanceKm / averageSpeed) * 60),
  );
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
      .join(" "),
  );
}

function calculateRequirementMatch(tags = {}, query = "") {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return 50;
  }

  const facilityText = getFacilityText(tags);
  const groups = getSearchGroups(query);

  if (
    normalizedQuery === "hospital" ||
    normalizedQuery === "hospitals"
  ) {
    return tags.amenity === "hospital" ||
      tags.healthcare === "hospital"
      ? 100
      : 70;
  }

  if (
    normalizedQuery === "clinic" ||
    normalizedQuery === "clinics"
  ) {
    return tags.amenity === "clinic" ||
      tags.healthcare === "clinic"
      ? 100
      : 70;
  }

  let score = 35;

  if (facilityText.includes(normalizedQuery)) {
    score += 45;
  }

  if (groups.length > 0) {
    const matchedGroup = groups.find((group) =>
      group.aliases.some((alias) =>
        facilityText.includes(alias),
      ),
    );

    if (matchedGroup) {
      score += 45;
    }

    const specialtyText = normalize(getSpecialties(tags));

    if (
      matchedGroup &&
      matchedGroup.aliases.some((alias) =>
        specialtyText.includes(alias),
      )
    ) {
      score += 20;
    }
  }

  const queryWords = normalizedQuery
    .split(" ")
    .filter((word) => word.length > 2);

  const matchedWords = queryWords.filter((word) =>
    facilityText.includes(word),
  );

  if (queryWords.length > 0) {
    score += Math.round(
      (matchedWords.length / queryWords.length) * 20,
    );
  }

  return Math.min(99, Math.max(25, score));
}

function transformGeoapifyFacility(
  feature,
  userLocation,
  searchQuery,
) {
  const properties = feature?.properties || {};
  const coordinates = feature?.geometry?.coordinates;

  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !Number.isFinite(Number(coordinates[0])) ||
    !Number.isFinite(Number(coordinates[1]))
  ) {
    return null;
  }

  const lon = Number(coordinates[0]);
  const lat = Number(coordinates[1]);

  const categories = Array.isArray(properties.categories)
    ? properties.categories
    : [];

  const categoryText = categories.join(", ");
  const normalizedCategories = normalize(categoryText);
  const normalizedName = normalize(properties.name || "");

  const hospitalCategory = categories.some(
    (category) => category === "healthcare.hospital",
  );

  const clinicCategory = categories.some(
    (category) =>
      category === "healthcare.clinic_or_praxis" ||
      category.startsWith("healthcare.clinic_or_praxis."),
  );

  const dentistCategory = categories.some(
    (category) =>
      category === "healthcare.dentist" ||
      category.startsWith("healthcare.dentist."),
  );

  let type = "Healthcare Facility";

  if (hospitalCategory) {
    type = "Hospital";
  } else if (dentistCategory) {
    type = "Dentist";
  } else if (clinicCategory) {
    type = "Clinic";
  }

  const specialties = categories
    .filter((category) =>
      category.startsWith("healthcare."),
    )
    .map((category) =>
      category
        .replace(/^healthcare\./, "")
        .replace(/^clinic_or_praxis\./, "")
        .replace(/^dentist\./, "")
        .replaceAll("_", " "),
    )
    .filter(
      (value) =>
        value !== "hospital" &&
        value !== "clinic or praxis" &&
        value !== "dentist",
    )
    .join(", ");

  const emergency =
    normalizedName.includes("emergency") ||
    normalizedName.includes("trauma") ||
    normalizedName.includes("casualty") ||
    normalizedCategories.includes("trauma");

  const distanceKm = haversineDistance(
    userLocation.lat,
    userLocation.lon,
    lat,
    lon,
  );

  const tags = {
    name: properties.name || "",
    "name:en": properties.name || "",
    healthcare: hospitalCategory
      ? "hospital"
      : clinicCategory
        ? "clinic"
        : dentistCategory
          ? "dentist"
          : "healthcare",
    specialties,
    speciality: specialties,
    description: categoryText,
    operator: properties.operator || "",
  };

  return {
    id: `geoapify-${properties.place_id || `${lat}-${lon}`
      }`,

    geoapifyPlaceId: properties.place_id || "",

    name:
      properties.name ||
      "Unnamed healthcare facility",

    type,

    lat,
    lon,

    tags,

    address:
      properties.formatted ||
      [
        properties.address_line1,
        properties.address_line2,
        properties.city,
        properties.state,
        properties.postcode,
      ]
        .filter(Boolean)
        .join(", ") ||
      "Address not available",

    phone:
      properties.phone ||
      properties.contact?.phone ||
      "",

    website:
      properties.website ||
      properties.website_url ||
      properties.contact?.website ||
      "",

    openingHours:
      properties.opening_hours || "",

    operator:
      properties.operator || "",

    emergency,

    specialties,

    healthcare: tags.healthcare,

    amenity: "",

    distanceKm,

    travelMinutes:
      estimateTravelTime(distanceKm),

    match: calculateRequirementMatch(
      tags,
      searchQuery,
    ),
  };
}

async function readApiResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

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

export default function HospitalFinder() {
  const [searchParams] = useSearchParams();

  const {
    searchState,
    setSearchState,
    toggleCompare,
    clearComparison,
  } = useHospitalSearch();

  const locationFromRequest = useMemo(() => {
    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return null;
    }

    return {
      lat,
      lon,
      accuracy:
        Number(searchParams.get("accuracy")) || 0,
    };
  }, [searchParams]);

  const [searchQuery, setSearchQuery] =
    useState(
      searchParams.get("query") ||
      searchState.query ||
      "",
    );

  const [userLocation, setUserLocation] =
    useState(locationFromRequest);

  const [locationStatus, setLocationStatus] =
    useState("idle");

  const [facilities, setFacilities] =
    useState(searchState.facilities || []);

  const [selectedFacility, setSelectedFacility] =
    useState(null);

  const [radius, setRadius] = useState(5);

  const [facilityType, setFacilityType] =
    useState("all");

  const [emergencyOnly, setEmergencyOnly] =
    useState(searchParams.get("emergency") === "true");

  const [sortBy, setSortBy] =
    useState("match");

  const [viewMode, setViewMode] =
    useState("split");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [route, setRoute] =
    useState(null);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  const [researchLoadingId, setResearchLoadingId] =
    useState("");

  const autoSearchRequested =
    useRef(false);

  const locationRequestStarted =
    useRef(false);

  const [resultsPage, setResultsPage] =
    useState(0);

  const compareIds = useMemo(
    () => searchState.compareIds || [],
    [searchState.compareIds],
  );

  const researchById = useMemo(
    () => searchState.researchById || {},
    [searchState.researchById],
  );

  /*
   * LOCATION
   */

  const getUserLocation = useCallback(() => {
    console.log("Starting location request...");

    if (!navigator.geolocation) {
      console.error("Geolocation API is not supported.");
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setLocationStatus("loading");
    setError("");

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      console.log("=================================");
      console.log("LIVE LOCATION FOUND");
      console.log("Latitude:", latitude);
      console.log("Longitude:", longitude);
      console.log("Accuracy:", accuracy, "meters");
      console.log("=================================");

      setUserLocation({
        lat: latitude,
        lon: longitude,
        accuracy,
      });

      setLocationStatus("success");
      setLoading(false);
    };

    const handleError = (error) => {
      console.error("=================================");
      console.error("LOCATION ERROR");
      console.error("Code:", error.code);
      console.error("Message:", error.message);
      console.error("=================================");

      if (error.code === 1) {
        setError(
          "Location permission was denied. Please allow location access for localhost."
        );
        setLocationStatus("error");
        setLoading(false);
        return;
      }

      if (error.code === 2) {
        console.warn(
          "High accuracy location unavailable. Trying normal location..."
        );

        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (fallbackError) => {
            console.error(
              "Fallback location also failed:",
              fallbackError
            );

            setError(
              "Your device could not determine your current location. Make sure Windows Location Services is enabled."
            );

            setLocationStatus("error");
            setLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 60000,
          }
        );

        return;
      }

      if (error.code === 3) {
        console.warn(
          "High accuracy location timed out. Trying normal location..."
        );

        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (fallbackError) => {
            console.error(
              "Fallback location also failed:",
              fallbackError
            );

            setError(
              "Location request timed out. Please make sure Windows Location Services is enabled."
            );

            setLocationStatus("error");
            setLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 60000,
          }
        );

        return;
      }

      setError("Unable to determine your current location.");
      setLocationStatus("error");
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);
  /*
   * GEOAPIFY SEARCH
   */

  const fetchNearbyFacilities = useCallback(
    async (queryOverride = null) => {
      if (!userLocation) {
        setError(
          "Please allow location access before searching nearby facilities.",
        );
        return;
      }

      const activeQuery =
        queryOverride !== null
          ? queryOverride
          : searchQuery;

      setLoading(true);
      setError("");
      setSelectedFacility(null);
      setRoute(null);

      try {
        const data =
          await searchNearbyHealthcare({
            latitude: userLocation.lat,
            longitude: userLocation.lon,
            radius,
            limit: 20,
          });

        const features = Array.isArray(
          data?.features,
        )
          ? data.features
          : [];

        const transformed = features
          .map((feature) =>
            transformGeoapifyFacility(
              feature,
              userLocation,
              activeQuery,
            ),
          )
          .filter(Boolean)
          .filter(
            (facility) =>
              facility.distanceKm <= radius,
          );

        setFacilities(transformed);

        setSearchState((current) => ({
          ...current,
          query: activeQuery,
          facilities: transformed,
          compareIds: (current.compareIds || []).filter((id) =>
            transformed.some((facility) => facility.id === id),
          ),
          updatedAt:
            new Date().toISOString(),
        }));

        setLastUpdated(new Date());

        if (transformed.length === 0) {
          setError(
            "No healthcare facilities were found in this area. Try increasing the search radius or changing the search term.",
          );
        }
      } catch (searchError) {
        console.error(
          "Geoapify search error:",
          searchError,
        );

        if (
          searchError?.name ===
          "AbortError"
        ) {
          return;
        }

        setError(
          searchError?.message ||
          "The healthcare search service is temporarily unavailable. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      radius,
      searchQuery,
      setSearchState,
      userLocation,
    ],
  );

  /*
   * RESEARCH / VERIFICATION
   */

  const researchFacility = async (facility) => {
    if (
      researchById[facility.id] ||
      researchLoadingId
    ) {
      return;
    }

    setResearchLoadingId(facility.id);

    try {
      const response = await fetch(
        `${API_URL}/api/hospital-research`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: facility.name,
            address: facility.address,
            website: facility.website,
          }),
        },
      );

      const data =
        await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Research failed",
        );
      }

      setSearchState((current) => ({
        ...current,
        researchById: {
          ...(current.researchById || {}),
          [facility.id]: data,
        },
      }));
    } catch (researchError) {
      console.error(
        "Research error:",
        researchError,
      );

      setSearchState((current) => ({
        ...current,
        researchById: {
          ...(current.researchById || {}),
          [facility.id]: {
            error:
              researchError.message,
          },
        },
      }));
    } finally {
      setResearchLoadingId("");
    }
  };

  /*
   * INITIAL LOCATION
   */

  useEffect(() => {
    if (locationRequestStarted.current) {
      return;
    }

    locationRequestStarted.current = true;
    getUserLocation();
  }, [
    getUserLocation,
  ]);

  /*
   * AUTOMATIC FIRST SEARCH
   */

  useEffect(() => {
    if (
      !userLocation ||
      facilities.length > 0 ||
      autoSearchRequested.current
    ) {
      return;
    }

    autoSearchRequested.current = true;

    fetchNearbyFacilities();
  }, [
    facilities.length,
    fetchNearbyFacilities,
    userLocation,
  ]);

  /*
   * FILTERED RESULTS
   */

  const filteredFacilities = useMemo(() => {
    let result = [...facilities];

    if (facilityType !== "all") {
      result = result.filter(
        (facility) =>
          facility.type === facilityType,
      );
    }

    if (emergencyOnly) {
      result = result.filter(
        (facility) =>
          facility.emergency,
      );
    }

    result.sort((a, b) => {
      if (sortBy === "distance") {
        return (
          a.distanceKm -
          b.distanceKm
        );
      }

      if (sortBy === "name") {
        return a.name.localeCompare(
          b.name,
        );
      }

      if (sortBy === "match") {
        if (b.match !== a.match) {
          return b.match - a.match;
        }

        return (
          a.distanceKm -
          b.distanceKm
        );
      }

      return 0;
    });

    return result;
  }, [
    facilities,
    facilityType,
    emergencyOnly,
    sortBy,
  ]);

  const totalResultsPages = Math.max(
    1,
    Math.ceil(
      filteredFacilities.length /
      RESULTS_PER_PAGE,
    ),
  );

  const visibleFacilities =
    filteredFacilities.slice(
      resultsPage * RESULTS_PER_PAGE,
      (resultsPage + 1) *
      RESULTS_PER_PAGE,
    );

  /*
   * MAP MARKERS
   */

  const mapFacilities = useMemo(() => {
    const visibleMapFacilities =
      filteredFacilities.slice(
        0,
        MAX_MAP_MARKERS,
      );

    if (
      selectedFacility &&
      !visibleMapFacilities.some(
        (facility) =>
          facility.id ===
          selectedFacility.id,
      )
    ) {
      visibleMapFacilities.push(
        selectedFacility,
      );
    }

    return visibleMapFacilities;
  }, [
    filteredFacilities,
    selectedFacility,
  ]);

  /*
   * PAGINATION
   */

  useEffect(() => {
    setResultsPage(0);
  }, [
    facilityType,
    emergencyOnly,
    sortBy,
    radius,
    searchQuery,
  ]);

  useEffect(() => {
    setResultsPage(
      (currentPage) =>
        Math.min(
          currentPage,
          totalResultsPages - 1,
        ),
    );
  }, [totalResultsPages]);

  /*
   * FACILITY TYPES
   */

  const facilityTypes = useMemo(() => {
    return Array.from(
      new Set(
        facilities.map(
          (facility) =>
            facility.type,
        ),
      ),
    );
  }, [facilities]);

  /*
   * SEARCH
   */

  const search = () => {
    fetchNearbyFacilities();
  };

  /*
   * SELECT FACILITY
   */

  const selectFacility = (facility) => {
    setSelectedFacility(facility);
    setViewMode("split");
  };

  const clearFilters = () => {
    setFacilityType("all");
    setEmergencyOnly(false);
    setSortBy("match");
    setRadius(5);
  };

  /*
   * ROUTING
   *
   * OSRM is kept temporarily here.
   * We will replace this with Geoapify
   * Routing after the MapLibre migration
   * is confirmed working.
   */

  const startRoute = async (facility) => {
    if (!userLocation) {
      return;
    }

    setSelectedFacility(facility);
    setRouteLoading(true);
    setError("");

    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userLocation.lon},${userLocation.lat};` +
        `${facility.lon},${facility.lat}` +
        `?overview=full&geometries=geojson`;

      const response =
        await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Route request failed.",
        );
      }

      const data =
        await response.json();

      if (!data.routes?.length) {
        throw new Error(
          "No route found.",
        );
      }

      /*
       * MapLibre expects [longitude, latitude]
       */
      const coordinates =
        data.routes[0].geometry.coordinates;

      setRoute(coordinates);
    } catch (routeError) {
      console.error(routeError);

      setError(
        "The route could not be loaded. You can still open navigation in Google Maps.",
      );
    } finally {
      setRouteLoading(false);
    }
  };

  /*
   * GOOGLE MAPS NAVIGATION
   */

  const openGoogleMaps = (facility) => {
    if (!userLocation) {
      return;
    }

    const destination =
      `${facility.lat},${facility.lon}`;

    const origin =
      `${userLocation.lat},${userLocation.lon}`;

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      `&travelmode=driving`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /*
   * COMPARISON DATA
   */

  const compareFacilities = useMemo(
    () =>
      facilities
        .filter((facility) =>
          compareIds.includes(
            facility.id,
          ),
        )
        .map((facility) => ({
          ...facility,
          research:
            researchById[
            facility.id
            ],
        })),
    [
      facilities,
      compareIds,
      researchById,
    ],
  );

  const mapCenter = userLocation
    ? [
      userLocation.lat,
      userLocation.lon,
    ]
    : DEFAULT_CENTER;

  return (
    <div className="hospital-finder-page">
      <SiteNavbar />

      <div className="hospital-finder-shell">
        {/* HEADER */}

        <header className="hospital-finder-header">
          <div>
            <div className="eyebrow">
              HEALTHCARE DISCOVERY
            </div>

            <h1>
              Find the right healthcare
              facility
            </h1>

            <p>
              Search by health problem,
              treatment, or specialty. We
              match your requirement with
              mapped healthcare data around
              your location.
            </p>
          </div>

          <button
            className="location-button"
            onClick={getUserLocation}
            disabled={
              locationStatus ===
              "loading"
            }
          >
            <span className="location-icon">
              ⌖
            </span>

            {locationStatus ===
              "loading"
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
                <span className="search-symbol">
                  ⌕
                </span>

                <input
                  id="health-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      search();
                    }
                  }}
                  placeholder="e.g. kidney treatment, heart, cancer, eye..."
                />
              </div>

              <button
                className="primary-search-button"
                onClick={search}
                disabled={
                  loading ||
                  !userLocation
                }
              >
                {loading
                  ? "Searching..."
                  : "Find healthcare"}
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
                    setSearchQuery(
                      keyword,
                    );

                    if (userLocation) {
                      fetchNearbyFacilities(
                        keyword,
                      );
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
              <strong>
                Search status
              </strong>

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
                  setRadius(
                    Number(
                      event.target.value,
                    ),
                  )
                }
              >
                <option value={2}>
                  2 km
                </option>

                <option value={5}>
                  5 km
                </option>

                <option value={10}>
                  10 km
                </option>

                <option value={20}>
                  20 km
                </option>

                <option value={50}>
                  50 km
                </option>
              </select>
            </div>

            <div className="filter-group">
              <label>Facility</label>

              <select
                value={facilityType}
                onChange={(event) =>
                  setFacilityType(
                    event.target.value,
                  )
                }
              >
                <option value="all">
                  All facilities
                </option>

                {facilityTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort</label>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value,
                  )
                }
              >
                <option value="match">
                  Requirement match
                </option>

                <option value="distance">
                  Nearest first
                </option>

                <option value="name">
                  Name
                </option>
              </select>
            </div>

            <label className="emergency-toggle">
              <input
                type="checkbox"
                checked={
                  emergencyOnly
                }
                onChange={(event) =>
                  setEmergencyOnly(
                    event.target.checked,
                  )
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
              className={
                viewMode === "list"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("list")
              }
            >
              List
            </button>

            <button
              className={
                viewMode === "split"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("split")
              }
            >
              Split
            </button>

            <button
              className={
                viewMode === "map"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setViewMode("map")
              }
            >
              Map
            </button>
          </div>
        </section>

        {/* RESULTS INFO */}

        <div className="results-meta">
          <div>
            <strong>
              {filteredFacilities.length}
            </strong>{" "}
            healthcare facilities
            found
          </div>

          <div className="data-source">
            Healthcare data:
            Geoapify / OpenStreetMap

            {lastUpdated && (
              <>
                {" "}
                · Updated{" "}
                {lastUpdated.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute:
                      "2-digit",
                  },
                )}
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

                  <h3>
                    Finding nearby
                    healthcare...
                  </h3>

                  <p>
                    Searching nearby
                    healthcare facilities...
                  </p>
                </div>
              ) : filteredFacilities.length ===
                0 ? (
                <div className="empty-card">
                  <div className="empty-icon">
                    ⌖
                  </div>

                  <h3>
                    No matching
                    facilities
                  </h3>

                  <p>
                    Try increasing the
                    search radius or
                    using a broader
                    healthcare term.
                  </p>

                  <button
                    className="primary-button"
                    onClick={search}
                    disabled={
                      !userLocation
                    }
                  >
                    Search again
                  </button>
                </div>
              ) : (
                visibleFacilities.map(
                  (facility) => {
                    const isSelected =
                      selectedFacility?.id ===
                      facility.id;

                    const isCompared =
                      compareIds.includes(
                        facility.id,
                      );

                    return (
                      <article
                        className={`facility-card ${isSelected
                            ? "selected"
                            : ""
                          }`}
                        key={facility.id}
                        onClick={() =>
                          selectFacility(
                            facility,
                          )
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
                            <h2>
                              {facility.name}
                            </h2>

                            <p className="facility-address">
                              {
                                facility.address
                              }
                            </p>

                            {facility.specialties && (
                              <p className="facility-specialties">
                                <strong>
                                  Specialties:
                                </strong>{" "}
                                {
                                  facility.specialties
                                }
                              </p>
                            )}

                            <div className="facility-metrics">
                              <span>
                                {facility.distanceKm.toFixed(
                                  1,
                                )}{" "}
                                km
                              </span>

                              {facility.travelMinutes && (
                                <span>
                                  ~
                                  {
                                    facility.travelMinutes
                                  }{" "}
                                  min drive
                                </span>
                              )}

                              <span>
                                {
                                  facility.match
                                }
                                % requirement
                                match
                              </span>
                            </div>
                          </div>

                          <div className="match-circle">
                            <strong>
                              {
                                facility.match
                              }
                            </strong>

                            <span>%</span>
                          </div>
                        </div>

                        <div className="facility-data-note">
                          Match is calculated
                          from available
                          healthcare
                          category data and
                          your search
                          requirement.
                        </div>

                        <div
                          className="facility-actions"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                        >
                          <button
                            onClick={() =>
                              startRoute(
                                facility,
                              )
                            }
                          >
                            {routeLoading &&
                              selectedFacility?.id ===
                              facility.id
                              ? "Loading route..."
                              : "Route"}
                          </button>

                          <button
                            onClick={() =>
                              openGoogleMaps(
                                facility,
                              )
                            }
                          >
                            Navigate
                          </button>

                          {facility.phone && (
                            <a
                              href={`tel:${facility.phone}`}
                              onClick={(
                                event,
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              Call
                            </a>
                          )}

                          {facility.website && (
                            <a
                              href={
                                facility.website
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(
                                event,
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              Website
                            </a>
                          )}

                          <button
                            className={
                              isCompared
                                ? "compare-active"
                                : ""
                            }
                            onClick={() =>
                              toggleCompare(
                                facility,
                              )
                            }
                          >
                            {isCompared
                              ? "Compared"
                              : "Compare"}
                          </button>

                          <button
                            onClick={() =>
                              researchFacility(
                                facility,
                              )
                            }
                          >
                            {researchLoadingId ===
                              facility.id
                              ? "Researching..."
                              : "Verify data"}
                          </button>
                        </div>
                      </article>
                    );
                  },
                )
              )}

              {!loading &&
                filteredFacilities.length >
                RESULTS_PER_PAGE && (
                  <div
                    className="results-pagination"
                    aria-label="Hospital results pages"
                  >
                    <button
                      onClick={() =>
                        setResultsPage(
                          (page) =>
                            Math.max(
                              0,
                              page - 1,
                            ),
                        )
                      }
                      disabled={
                        resultsPage === 0
                      }
                    >
                      Previous
                    </button>

                    <span>
                      Page{" "}
                      {resultsPage + 1}{" "}
                      of{" "}
                      {totalResultsPages}
                    </span>

                    <button
                      onClick={() =>
                        setResultsPage(
                          (page) =>
                            Math.min(
                              totalResultsPages -
                              1,
                              page + 1,
                            ),
                        )
                      }
                      disabled={
                        resultsPage ===
                        totalResultsPages -
                        1
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
            </section>
          )}

          {/* MAP */}

          {viewMode !== "list" && (
            <section className="finder-map-container">
              <MapLibreMap
                userLocation={
                  userLocation
                }
                facilities={
                  mapFacilities
                }
                selectedFacility={
                  selectedFacility
                }
                onSelectFacility={
                  selectFacility
                }
                route={route}
              />

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

        {/* COMPARISON */}

        {compareFacilities.length >
          0 && (
            <section className="comparison-panel">
              <div className="comparison-header">
                <div>
                  <span className="eyebrow">
                    COMPARISON
                  </span>

                  <h2>
                    Compare selected
                    facilities
                  </h2>
                </div>

                <div className="comparison-header-actions">
                  <Link
                    className="comparison-page-link"
                    to="/compare"
                  >
                    Open full comparison
                  </Link>

                  <button
                    onClick={clearComparison}
                  >
                    Clear comparison
                  </button>
                </div>
              </div>

              <div className="comparison-table-wrap">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>
                        Requirement
                      </th>

                      {compareFacilities.map(
                        (facility) => (
                          <th
                            key={
                              facility.id
                            }
                          >
                            {
                              facility.name
                            }
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      [
                        "Requirement match",
                        (facility) =>
                          `${facility.match}%`,
                      ],

                      [
                        "Distance",
                        (facility) =>
                          `${facility.distanceKm.toFixed(
                            1,
                          )} km`,
                      ],

                      [
                        "Estimated drive",
                        (facility) =>
                          facility.travelMinutes
                            ? `~${facility.travelMinutes} min`
                            : "Data not available",
                      ],

                      [
                        "Specialty",
                        (facility) =>
                          facility.specialties ||
                          "Data not available",
                      ],

                      [
                        "Emergency",
                        (facility) =>
                          facility.emergency
                            ? "Listed in map data"
                            : "Not verified",
                      ],

                      [
                        "Phone",
                        (facility) =>
                          facility.phone ||
                          "Data not available",
                      ],

                      [
                        "Patients / outcomes",
                        (facility) =>
                          facility
                            .research
                            ?.metrics
                            ?.patientsTreated ||
                          "Data not available",
                      ],

                      [
                        "Success / outcome rate",
                        (facility) =>
                          facility
                            .research
                            ?.metrics
                            ?.successRate ||
                          "Data not available",
                      ],

                      [
                        "Average treatment cost",
                        (facility) =>
                          facility
                            .research
                            ?.metrics
                            ?.treatmentCost ||
                          "Data not available",
                      ],

                      [
                        "Insurance / scheme",
                        (facility) =>
                          facility
                            .research
                            ?.metrics
                            ?.insurance ||
                          "Data not available",
                      ],

                      [
                        "Research sources",
                        (facility) =>
                          facility
                            .research
                            ?.sources
                            ?.length
                            ? facility.research.sources.map(
                              (
                                source,
                                index,
                              ) => (
                                <a
                                  key={
                                    source.url ||
                                    index
                                  }
                                  href={
                                    source.url
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Source{" "}
                                  {index +
                                    1}
                                </a>
                              ),
                            )
                            : "Data not available",
                      ],
                    ].map(
                      ([label, value]) => (
                        <tr key={label}>
                          <th>
                            {label}
                          </th>

                          {compareFacilities.map(
                            (
                              facility,
                            ) => (
                              <td
                                key={
                                  facility.id
                                }
                              >
                                {value(
                                  facility,
                                )}
                              </td>
                            ),
                          )}
                        </tr>
                      ),
                    )}

                    <tr>
                      <th>
                        Actions
                      </th>

                      {compareFacilities.map(
                        (facility) => (
                          <td
                            key={
                              facility.id
                            }
                          >
                            <button
                              onClick={() =>
                                researchFacility(
                                  facility,
                                )
                              }
                            >
                              {facility.research
                                ? "Data checked"
                                : "Verify data"}
                            </button>{" "}
                            <button
                              onClick={() =>
                                selectFacility(
                                  facility,
                                )
                              }
                            >
                              Map
                            </button>
                          </td>
                        ),
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="comparison-note">
                Only source-backed
                information is displayed.
                “Data not available” means
                it could not be verified
                from the available sources.
              </p>
            </section>
          )}

        {/* DATA DISCLAIMER */}

        <footer className="finder-footer">
          <div>
            <strong>
              Healthcare data note
            </strong>

            <p>
              Facility information is
              sourced through Geoapify
              using OpenStreetMap-based
              healthcare data and may be
              incomplete or outdated.
              Missing information is not
              treated as a positive or
              negative signal.
            </p>
          </div>

          <div>
            <strong>
              Not medical advice
            </strong>

            <p>
              This tool helps with
              healthcare discovery and
              navigation. It does not
              diagnose conditions or
              recommend a medical
              treatment.
            </p>
          </div>
        </footer>
      </div>

      <Footer
        logo="CurePulse"
        description="Discover, compare, and access healthcare options that fit your needs."
        copyright="CurePulse. All rights reserved."
      />
    </div>
  );
}