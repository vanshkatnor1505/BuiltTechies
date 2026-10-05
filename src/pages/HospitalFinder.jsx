import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MapLibreMap from "../components/MapLibreMap/MapLibreMap";
import "./HospitalFinder.css";
import SiteNavbar from "../components/composed/SiteNavbar/SiteNavbar";
import Footer from "../components/composed/Footer/Footer";
import {
  geocodeLocation,
  reverseGeocodeLocation,
  searchNearbyHealthcare,
} from "../services/geoapify";
import { useHospitalSearch } from "../context/HospitalSearchContext";
import { isMedicalQuery } from "../utils/medicalQuery";
import HospitalFinderHeader from "../components/HospitalFinder/HospitalFinderHeader";
import HospitalFinderSearchPanel from "../components/HospitalFinder/HospitalFinderSearchPanel";
import HospitalFinderToolbar from "../components/HospitalFinder/HospitalFinderToolbar";

const DEFAULT_CENTER = [30.7333, 76.7794];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INDIA_SPECIALIST_HOSPITALS = {
  kidney: [
    [
      "Institute of Kidney Diseases and Research Center",
      "Ahmedabad",
      "Nephrology, kidney transplant, dialysis",
      23.0339,
      72.585,
    ],
    [
      "Medanta Institute of Kidney and Urology",
      "Gurugram",
      "Nephrology, renal transplant, urology",
      28.4395,
      77.1027,
    ],
    [
      "Manipal Hospitals - Institute of Renal Sciences",
      "Bengaluru",
      "Kidney transplant, nephrology, dialysis",
      12.9592,
      77.6474,
    ],
    [
      "Apollo Hospitals - Institute of Nephrology",
      "Chennai",
      "Nephrology, renal transplant, urology",
      13.0067,
      80.2206,
    ],
  ],
  heart: [
    [
      "Narayana Institute of Cardiac Sciences",
      "Bengaluru",
      "Cardiology, cardiac surgery, heart transplant",
      12.8596,
      77.6633,
    ],
    [
      "Fortis Escorts Heart Institute",
      "New Delhi",
      "Interventional cardiology, cardiac surgery",
      28.5677,
      77.231,
    ],
    [
      "Asian Heart Institute",
      "Mumbai",
      "Cardiology, bypass surgery, heart transplant",
      19.0437,
      73.0169,
    ],
    [
      "Medanta Heart Institute",
      "Gurugram",
      "Cardiology, electrophysiology, cardiac surgery",
      28.4395,
      77.1027,
    ],
  ],
  cancer: [
    [
      "Tata Memorial Hospital",
      "Mumbai",
      "Medical oncology, radiation oncology, cancer surgery",
      19.0048,
      72.843,
    ],
    [
      "Homi Bhabha Cancer Hospital",
      "Sangrur",
      "Cancer surgery, chemotherapy, radiotherapy",
      30.2458,
      75.8425,
    ],
    [
      "Cancer Institute (WIA)",
      "Chennai",
      "Oncology, radiation therapy, cancer surgery",
      13.0108,
      80.2388,
    ],
    [
      "Rajiv Gandhi Cancer Institute and Research Centre",
      "New Delhi",
      "Medical oncology, robotic surgery, radiotherapy",
      28.7077,
      77.1197,
    ],
  ],
  brain: [
    [
      "National Institute of Mental Health and Neuro Sciences",
      "Bengaluru",
      "Neurology, neurosurgery, stroke care",
      12.943,
      77.596,
    ],
    [
      "Sree Chitra Tirunal Institute for Medical Sciences",
      "Thiruvananthapuram",
      "Neurosurgery, stroke, interventional neurology",
      8.5241,
      76.9366,
    ],
    [
      "Institute of Neurosciences, Medanta",
      "Gurugram",
      "Neurosurgery, epilepsy, movement disorders",
      28.4395,
      77.1027,
    ],
    [
      "Apollo Proton Cancer Centre",
      "Chennai",
      "Neuro-oncology, neurosurgery, proton therapy",
      12.9352,
      80.2362,
    ],
  ],
  orthopedic: [
    [
      "Indian Spinal Injuries Centre",
      "New Delhi",
      "Spine surgery, orthopedics, rehabilitation",
      28.548,
      77.173,
    ],
    [
      "Sancheti Institute for Orthopaedics",
      "Pune",
      "Joint replacement, spine, sports medicine",
      18.5204,
      73.8567,
    ],
    [
      "Wockhardt Hospitals - Orthopaedic Institute",
      "Mumbai",
      "Joint replacement, trauma, sports injuries",
      19.0715,
      72.8805,
    ],
    [
      "Ganga Hospital",
      "Coimbatore",
      "Orthopedics, trauma, reconstructive surgery",
      11.0168,
      76.9558,
    ],
  ],
  eye: [
    [
      "L V Prasad Eye Institute",
      "Hyderabad",
      "Cataract, retina, cornea, glaucoma",
      17.4126,
      78.4071,
    ],
    [
      "Aravind Eye Hospital",
      "Madurai",
      "Cataract, retina, cornea, eye care",
      9.9252,
      78.1198,
    ],
    [
      "Sankara Nethralaya",
      "Chennai",
      "Retina, cornea, glaucoma, ocular oncology",
      13.0569,
      80.251,
    ],
    [
      "Dr. Shroff's Charity Eye Hospital",
      "New Delhi",
      "Cataract, pediatric ophthalmology, cornea",
      28.6508,
      77.1926,
    ],
  ],
  children: [
    [
      "Indraprastha Apollo Children's Hospital",
      "New Delhi",
      "Pediatrics, pediatric surgery, neonatology",
      28.5355,
      77.2837,
    ],
    [
      "Rainbow Children's Hospital",
      "Hyderabad",
      "Pediatrics, neonatology, pediatric surgery",
      17.4296,
      78.4071,
    ],
    [
      "Children's Hospital, AIIMS",
      "New Delhi",
      "Pediatric oncology, surgery, critical care",
      28.5672,
      77.21,
    ],
    [
      "Kokilaben Dhirubhai Ambani Hospital - Children",
      "Mumbai",
      "Pediatrics, pediatric surgery, cardiology",
      19.1334,
      72.8253,
    ],
  ],
  women: [
    [
      "Indira IVF and Women's Health Institute",
      "Mumbai",
      "Fertility, IVF, reproductive medicine",
      19.1136,
      72.8697,
    ],
    [
      "Cloudnine Hospital",
      "Bengaluru",
      "Maternity, fertility, gynecology",
      12.9716,
      77.5946,
    ],
    [
      "CK Birla Hospital for Women",
      "Gurugram",
      "High-risk pregnancy, fertility, gynecology",
      28.4595,
      77.0266,
    ],
    [
      "Institute of Obstetrics and Gynaecology",
      "Hyderabad",
      "Obstetrics, gynecology, maternal care",
      17.385,
      78.4867,
    ],
  ],
  general: [
    [
      "All India Institute of Medical Sciences (AIIMS)",
      "New Delhi",
      "Multi-specialty care, emergency medicine, surgery",
      28.5672,
      77.21,
    ],
    [
      "Christian Medical College",
      "Vellore",
      "Multi-specialty care, transplant, critical care",
      12.9249,
      79.135,
    ],
    [
      "Apollo Hospitals",
      "Chennai",
      "Multi-specialty care, emergency medicine, surgery",
      13.0067,
      80.2206,
    ],
    [
      "Sir Ganga Ram Hospital",
      "New Delhi",
      "Multi-specialty care, cardiology, oncology",
      28.6387,
      77.19,
    ],
  ],
};

const PUNJAB_TOP_HOSPITALS = [
  [
    "Post Graduate Institute of Medical Education and Research (PGIMER)",
    "Chandigarh",
    "Multi-specialty care, emergency medicine, surgery",
    30.7646,
    76.7756,
  ],
  [
    "Fortis Hospital",
    "Mohali",
    "Multi-specialty care, cardiology, oncology, emergency medicine",
    30.7046,
    76.7179,
  ],
  [
    "Max Super Speciality Hospital",
    "Mohali",
    "Multi-specialty care, cardiac sciences, oncology, neurology",
    30.7046,
    76.7179,
  ],
  [
    "Christian Medical College and Hospital",
    "Ludhiana",
    "Multi-specialty care, cardiology, oncology, critical care",
    30.9009,
    75.8573,
  ],
  [
    "Dayanand Medical College and Hospital",
    "Ludhiana",
    "Multi-specialty care, trauma, cardiology, neurology",
    30.912,
    75.8402,
  ],
  [
    "Government Medical College and Hospital",
    "Amritsar",
    "Multi-specialty care, emergency medicine, surgery",
    31.634,
    74.8723,
  ],
  [
    "Rajindra Hospital",
    "Patiala",
    "Multi-specialty care, emergency medicine, surgery",
    30.3398,
    76.3869,
  ],
];

function getHospitalFallbacks(disease) {
  const group = getSearchGroups(disease)[0]?.key || "general";
  const hospitals =
    INDIA_SPECIALIST_HOSPITALS[group] || INDIA_SPECIALIST_HOSPITALS.general;

  return hospitals.map(([name, city, specialties, lat, lon]) => ({
    name: `${name}, ${city}`,
    city,
    specialties,
    lat,
    lon,
    summary: `Explore ${specialties} services at ${name}, ${city}.`,
    sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${city} ${disease} treatment`)}`,
    sourceLabel: "Research hospital",
  }));
}

function getPunjabHospitalFallbacks(disease) {
  return PUNJAB_TOP_HOSPITALS.map(([name, city, specialties, lat, lon]) => ({
    name: `${name}, ${city}`,
    city,
    specialties,
    lat,
    lon,
    summary: `Explore ${specialties} services at ${name}, ${city}.`,
    sourceUrl: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${city} ${disease} treatment`)}`,
    sourceLabel: "Punjab hospital",
  }));
}

function getValidCoordinate(value, minimum, maximum) {
  if (value == null || (typeof value === "string" && !value.trim())) {
    return null;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) &&
    coordinate >= minimum &&
    coordinate <= maximum
    ? coordinate
    : null;
}

function getPmjayListingStatus(facility) {
  const insurance = normalize(facility.research?.metrics?.insurance || "");

  if (!/(pm[\s-]?jay|ayushman bharat|pradhan mantri jan aarogya)/.test(insurance)) {
    return "unknown";
  }

  if (
    /\b(not accepted|not covered|not empanel(?:led|ed)?|not participating|not supported|not part of|does not accept|does not cover|does not support|does not participate|doesn t accept|doesn t cover|cannot accept|cannot cover)\b/.test(
      insurance,
    )
  ) {
    return "not-listed";
  }

  if (
    /\b(accept|accepted|accepts|cover|covered|empanel|empanelled|empaneled|participate|participates|participating|available)\b/.test(
      insurance,
    )
  ) {
    return "listed";
  }

  return "unknown";
}

function getIndiaHospitalFacilities(
  hospitals,
  disease,
  userLocation,
) {
  return hospitals.map((hospital, index) => {
    const lat = getValidCoordinate(hospital.lat, -90, 90);
    const lon = getValidCoordinate(hospital.lon, -180, 180);
    const location = hospital.city || "";
    const hasCoordinates = lat !== null && lon !== null;
    const distanceKm = userLocation && hasCoordinates
      ? haversineDistance(
          userLocation.lat,
          userLocation.lon,
          lat,
          lon,
        )
      : null;
    const specialties = hospital.specialties || "";
    const emergency = hospital.emergency === true ||
      /\b(emergency|trauma|casualty)\b/i.test(
        `${hospital.name || ""} ${specialties}`,
      );
    const tags = {
      name: hospital.name,
      healthcare: "hospital",
      specialties,
    };

    return {
      id: `india-hospital-${index}-${String(location).toLowerCase()}`,
      name: hospital.name,
      type: "Hospital",
      lat,
      lon,
      address: hospital.address || (location ? `${location}, India` : "Location not provided"),
      specialties,
      emergency,
      match: calculateRequirementMatch(tags, disease, distanceKm, emergency),
      distanceKm,
      travelMinutes: null,
      website: hospital.sourceUrl,
      tags,
      nationwide: true,
      sourceUrl: hospital.sourceUrl,
    };
  });
}

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
    aliases: ["emergency", "urgent", "trauma", "accident", "casualty"],
  },
  {
    key: "ent",
    aliases: ["ent", "ear", "nose", "throat", "otolaryngology", "otology"],
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
    aliases: ["endocrine", "endocrinology", "diabetes", "thyroid", "hormone"],
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
        normalizedQuery.includes(alias) || alias.includes(normalizedQuery),
    ),
  );
}

function isHealthcareSearch(query) {
  return Boolean(
    isMedicalQuery(query) ||
    getSearchGroups(query).some((group) => group.key !== "general"),
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
  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  const averageSpeed = distanceKm < 5 ? 25 : 35;

  return Math.max(2, Math.round((distanceKm / averageSpeed) * 60));
}

function getSpecialties(tags = {}) {
  const specialtyValues = [
    tags["healthcare:speciality"],
    tags["healthcare:specialties"],
    tags["medical:specialty"],
    tags["medical_specialty"],
    tags.specialties,
    tags["healthcare:speciality:en"],
  ].filter(Boolean);

  const genericSpecialties = new Set([
    "healthcare",
    "hospital",
    "clinic",
    "clinic or praxis",
    "dentist",
    "doctor",
    "medical",
  ]);

  return specialtyValues
    .flatMap((value) => String(value).split(/[,;]/))
    .map((value) => value.trim())
    .filter((value) => value && !genericSpecialties.has(normalize(value)))
    .join(", ");
}

function calculateRequirementMatch(
  tags = {},
  query = "",
  distanceKm = null,
  emergency = false,
) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return null;
  }

  const groups = getSearchGroups(query);
  const specialtyText = normalize(getSpecialties(tags));
  const queryWords = normalizedQuery
    .split(" ")
    .filter((word) => word.length > 2);
  const specialtyMatches = groups.length > 0
    ? groups.some((group) =>
        group.aliases.some((alias) => specialtyText.includes(normalize(alias))),
      )
    : queryWords.some((word) => specialtyText.includes(word));
  const hasSpecialtyEvidence = Boolean(specialtyText);
  const isHealthcareFacility = Boolean(
    tags.healthcare && tags.healthcare !== "no",
  );
  const genericFacilityMatch =
    (normalizedQuery === "hospital" || normalizedQuery === "hospitals") &&
    (tags.amenity === "hospital" || tags.healthcare === "hospital");

  if (!hasSpecialtyEvidence && !genericFacilityMatch && !isHealthcareFacility) {
    return null;
  }

  const specialtyScore = specialtyMatches || genericFacilityMatch
    ? 100
    : hasSpecialtyEvidence
      ? 0
      : 50;
  const dimensions = [
    { score: specialtyScore, weight: 70 },
  ];

  if (Number.isFinite(distanceKm)) {
    dimensions.push({
      score: 100 / (1 + distanceKm / 10),
      weight: 20,
    });
  }

  if (groups.some((group) => group.key === "emergency")) {
    dimensions.push({ score: emergency ? 100 : 0, weight: 10 });
  }

  const totalWeight = dimensions.reduce((total, dimension) => total + dimension.weight, 0);
  const weightedScore = dimensions.reduce(
    (total, dimension) => total + dimension.score * dimension.weight,
    0,
  );

  return Math.round(weightedScore / totalWeight);
}

function transformGeoapifyFacility(feature, userLocation, searchQuery) {
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
    .filter((category) => category.startsWith("healthcare."))
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
    normalizedCategories.includes("emergency") ||
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
    id: `geoapify-${properties.place_id || `${lat}-${lon}`}`,

    geoapifyPlaceId: properties.place_id || "",

    name: properties.name || "Unnamed healthcare facility",

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

    phone: properties.phone || properties.contact?.phone || "",

    website:
      properties.website ||
      properties.website_url ||
      properties.contact?.website ||
      "",

    openingHours: properties.opening_hours || "",

    operator: properties.operator || "",

    emergency,

    specialties,

    healthcare: tags.healthcare,

    amenity: "",

    distanceKm,

    travelMinutes: estimateTravelTime(distanceKm),

    match: calculateRequirementMatch(tags, searchQuery, distanceKm, emergency),
  };
}

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

function HospitalFinderResultsMeta({ filteredFacilities, lastUpdated }) {
  return (
    <div className="results-meta">
      <div>
        <strong>{filteredFacilities.length}</strong> healthcare facilities found
      </div>

      <div className="data-source">
        Healthcare data: Geoapify / OpenStreetMap
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
  );
}

function SourcedMetric({ research, metricKey }) {
  const source = research?.metricSources?.[metricKey];
  const value =
    source?.url && /^https?:\/\//i.test(source.url)
      ? research?.metrics?.[metricKey]
      : null;
  const estimate = research?.metricEstimates?.[metricKey];

  return (
    <span className="sourced-metric">
      {value || (estimate
        ? `Approx. ${estimate} (AI estimate · not verified)`
        : research?.metricEstimatesError
          ? "AI estimate unavailable"
          : "Unverified")}
      {value && (
        <a href={source.url} target="_blank" rel="noreferrer">
          Source
        </a>
      )}
    </span>
  );
}

function SourcedCostAndWait({ research }) {
  return (
    <dl className="sourced-cost-wait">
      <div>
        <dt>Treatment cost range</dt>
        <dd><SourcedMetric research={research} metricKey="treatmentCost" /></dd>
      </div>
      <div>
        <dt>Wait time</dt>
        <dd><SourcedMetric research={research} metricKey="waitTime" /></dd>
      </div>
    </dl>
  );
}

function HospitalFinderMapPanel({
  mapCenter,
  mapFacilities,
  route,
  searchScope,
  selectedFacility,
  selectFacility,
  userLocation,
}) {
  return (
    <section className="finder-map-container">
      <MapLibreMap
        userLocation={userLocation}
        mapCenter={mapCenter}
        mapZoom={searchScope === "india" ? 5 : 13}
        showUserLocation={searchScope !== "india"}
        facilities={mapFacilities}
        selectedFacility={selectedFacility}
        onSelectFacility={selectFacility}
        route={route}
      />

      <div className="map-legend">
        {searchScope !== "india" && (
          <div>
            <span className="legend-dot user" />
            Your location
          </div>
        )}

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
  );
}

function HospitalFinderResultsPanel({
  compareIds,
  filteredFacilities,
  isSearching,
  loading,
  mapFacilities,
  mapCenter,
  resultsPage,
  route,
  routeLoading,
  search,
  searchScope,
  schemeFilter,
  selectedFacility,
  selectFacility,
  setResultsPage,
  totalResultsPages,
  userLocation,
  startRoute,
  openGoogleMaps,
  researchFacility,
  researchById,
  researchLoadingId,
  toggleCompare,
  viewMode,
  userLocationObj,
}) {
  const visibleFacilities = filteredFacilities.slice(
    resultsPage * 3,
    (resultsPage + 1) * 3,
  );

  return (
    <main className={`finder-content view-${viewMode}`}>
      {viewMode !== "map" && (
        <section className="facility-results">
          {isSearching ? (
            <div className="loading-card">
              <div className="loading-spinner" />
              <h3>
                {searchScope === "nearby"
                  ? "Finding nearby healthcare..."
                  : "Researching hospitals for your search..."}
              </h3>
              <p>
                {searchScope === "nearby"
                  ? "Searching nearby healthcare facilities..."
                  : "Loading specialist hospital recommendations and matching facilities..."}
              </p>
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">⌖</div>
              <h3>No matching facilities</h3>
              <p>
                Try increasing the search radius or using a broader healthcare
                term.
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
            visibleFacilities.map((facility) => {
              const isSelected = selectedFacility?.id === facility.id;
              const isCompared = compareIds.includes(facility.id);
              const pmjayStatus = getPmjayListingStatus({
                ...facility,
                research: researchById[facility.id],
              });

              return (
                <article
                  className={`facility-card ${isSelected ? "selected" : ""}`}
                  key={facility.id}
                  onClick={() => selectFacility(facility)}
                >
                  <div className="facility-card-top">
                    <div className="facility-type">{facility.type}</div>
                    {facility.emergency && (
                      <span className="emergency-badge">Emergency</span>
                    )}
                    {facility.nationwide && (
                      <span className="specialist-badge">Specialist match</span>
                    )}
                  </div>

                  <div className="facility-card-body">
                    <div className="facility-main">
                      <h2>{facility.name}</h2>
                      <p className="facility-address">{facility.address}</p>
                      {facility.specialties && (
                        <p className="facility-specialties">
                          <strong>Specialties:</strong> {facility.specialties}
                        </p>
                      )}

                      <div className="facility-metrics">
                        {Number.isFinite(facility.distanceKm) ? (
                          <span>{facility.distanceKm.toFixed(1)} km</span>
                        ) : facility.nationwide ? (
                          <span>India-wide · distance unavailable</span>
                        ) : (
                          <span>Distance unavailable</span>
                        )}
                        {facility.travelMinutes && (
                          <span>~{facility.travelMinutes} min drive</span>
                        )}
                        <span>
                          {Number.isFinite(facility.match)
                            ? `${facility.match}% calculated match`
                            : "Match data unavailable"}
                        </span>
                      </div>
                    </div>

                    <div className="match-circle">
                      <strong>
                        {Number.isFinite(facility.match) ? facility.match : "—"}
                      </strong>
                      <span>{Number.isFinite(facility.match) ? "%" : ""}</span>
                    </div>
                  </div>

                  <div className="facility-data-note">
                    Match uses listed specialty keywords, available distance,
                    and emergency status for emergency searches. Specialty fit
                    is weighted 70%, distance 20% (half-score at 10 km), and
                    emergency evidence 10% for emergency searches. If a
                    facility has no specialty details, its specialty fit starts
                    at 50% and is marked as an estimate, not a verified match.
                  </div>
                  <SourcedCostAndWait research={researchById[facility.id]} />

                  <div
                    className="facility-actions"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      onClick={() => startRoute(facility)}
                      disabled={
                        !userLocation ||
                        !Number.isFinite(facility.lat) ||
                        !Number.isFinite(facility.lon)
                      }
                    >
                      {routeLoading && selectedFacility?.id === facility.id
                        ? "Loading route..."
                        : "Route"}
                    </button>
                    <button
                      onClick={() => openGoogleMaps(facility)}
                      disabled={
                        !userLocation ||
                        !Number.isFinite(facility.lat) ||
                        !Number.isFinite(facility.lon)
                      }
                    >
                      Navigate
                    </button>
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        onClick={(event) => event.stopPropagation()}
                      >
                        Call
                      </a>
                    )}
                    {facility.website && (
                      <a
                        href={facility.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Website
                      </a>
                    )}
                    <button
                      className={isCompared ? "compare-active" : ""}
                      onClick={() => toggleCompare(facility)}
                    >
                      {isCompared ? "Compared" : "Compare"}
                    </button>
                    <button
                      type="button"
                      onClick={() => researchFacility(facility)}
                    >
                      {researchLoadingId === facility.id
                        ? "Researching..."
                        : researchById[facility.id]?.error
                          ? "Retry verify"
                          : "Verify data"}
                    </button>
                  </div>

                  {researchById[facility.id] && (
                    <div
                      className={`facility-research-status ${researchById[facility.id].error ? "is-error" : "is-success"}`}
                      role="status"
                    >
                      {researchById[facility.id].error ? (
                        researchById[facility.id].error
                      ) : (
                        <>
                          <p>
                            {researchById[facility.id].summary ||
                              "Verified source data is available in the comparison panel."}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                  {schemeFilter === "pmjay-candidates" && (
                    <p className="scheme-research-status">
                      {pmjayStatus === "listed"
                        ? "PM-JAY: Acceptance reported"
                        : "PM-JAY: Not verified"}
                    </p>
                  )}
                </article>
              );
            })
          )}

          {!loading && filteredFacilities.length > 3 && (
            <div
              className="results-pagination"
              aria-label="Hospital results pages"
            >
              <button
                onClick={() => setResultsPage((page) => Math.max(0, page - 1))}
                disabled={resultsPage === 0}
              >
                Previous
              </button>
              <span>
                Page {resultsPage + 1} of {totalResultsPages}
              </span>
              <button
                onClick={() =>
                  setResultsPage((page) =>
                    Math.min(totalResultsPages - 1, page + 1),
                  )
                }
                disabled={resultsPage === totalResultsPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {viewMode !== "list" && (
        <HospitalFinderMapPanel
          mapCenter={mapCenter}
          mapFacilities={mapFacilities}
          route={route}
          searchScope={searchScope}
          selectedFacility={selectedFacility}
          selectFacility={selectFacility}
          userLocation={userLocationObj}
        />
      )}
    </main>
  );
}

function HospitalRecommendationsSection({
  searchQuery,
  stateRecommendations,
  stateRecommendationsLoading,
}) {
  if (stateRecommendationsLoading) {
    return (
      <section className="state-recommendations">
        <div className="state-recommendations-heading">
          <span className="eyebrow">INDIA-WIDE RESEARCH</span>
          <h2>
            Finding leading options in India for{" "}
            {searchQuery || "your requirement"}...
          </h2>
        </div>
      </section>
    );
  }

  if (!stateRecommendations) {
    return null;
  }

  return (
    <section className="state-recommendations">
      <div className="state-recommendations-heading">
        <div>
          <span className="eyebrow">INDIA-WIDE RESEARCH</span>
          <h2>Hospitals and resources across India</h2>
          <p>
            Explore hospitals and resources for{" "}
            {stateRecommendations.disease || searchQuery}.
          </p>
        </div>
      </div>

      {stateRecommendations.resources?.length > 0 && (
        <div className="state-recommendation-group resources-group">
          <div className="state-recommendation-group-heading">
            <h3>Supporting resources</h3>
            <span>{stateRecommendations.resources.length} sources</span>
          </div>
          <div className="state-recommendation-grid">
            {stateRecommendations.resources.map((resource) => (
              <article
                className="state-recommendation-card resource-recommendation-card"
                key={resource.sourceUrl}
              >
                <span className="state-recommendation-kind">Resource</span>
                <h3>{resource.name}</h3>
                <p>{resource.summary}</p>
                <a href={resource.sourceUrl} target="_blank" rel="noreferrer">
                  {resource.sourceLabel || "Read resource"}
                </a>
              </article>
            ))}
          </div>
        </div>
      )}

      {!stateRecommendations.hospitals?.length &&
      !stateRecommendations.resources?.length &&
      !stateRecommendations.recommendations?.length ? (
        <p className="state-recommendation-empty">
          {stateRecommendations.error ||
            "No India-wide hospital results were returned. Try the search again."}
        </p>
      ) : null}
    </section>
  );
}

function HospitalComparisonPanel({ compareFacilities, clearComparison }) {
  if (!compareFacilities.length) {
    return null;
  }

  return (
    <section className="comparison-panel">
      <div className="comparison-header">
        <div>
          <span className="eyebrow">COMPARISON</span>
          <h2>Compare selected facilities</h2>
        </div>

        <div className="comparison-header-actions">
          <Link className="comparison-page-link" to="/compare">
            Open full comparison
          </Link>
          <button onClick={clearComparison}>Clear comparison</button>
        </div>
      </div>

      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Requirement</th>
              {compareFacilities.map((facility) => (
                <th key={facility.id}>{facility.name}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[
              [
                "Requirement match",
                (facility) => Number.isFinite(facility.match)
                  ? `${facility.match}%`
                  : "Data not available",
              ],
              [
                "Distance",
                (facility) => Number.isFinite(facility.distanceKm)
                  ? `${facility.distanceKm.toFixed(1)} km`
                  : "Data not available",
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
                (facility) => facility.specialties || "Data not available",
              ],
              [
                "Emergency",
                (facility) =>
                  facility.emergency ? "Listed in map data" : "Not verified",
              ],
              ["Phone", (facility) => facility.phone || "Data not available"],
              [
                "Patients / outcomes",
                (facility) =>
                  facility.research?.metrics?.patientsTreated ||
                  "Data not available",
              ],
              [
                "Success / outcome rate",
                (facility) =>
                  facility.research?.metrics?.successRate ||
                  "Data not available",
              ],
              [
                "Treatment cost range",
                (facility) => (
                  <SourcedMetric research={facility.research} metricKey="treatmentCost" />
                ),
              ],
              [
                "Wait time",
                (facility) => (
                  <SourcedMetric research={facility.research} metricKey="waitTime" />
                ),
              ],
              [
                "Insurance / scheme",
                (facility) =>
                  facility.research?.metrics?.insurance || "Data not available",
              ],
              [
                "Research sources",
                (facility) =>
                  facility.research?.sources?.length
                    ? facility.research.sources.map((source, index) => (
                        <a
                          key={source.url || index}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source {index + 1}
                        </a>
                      ))
                    : "Data not available",
              ],
            ].map(([label, value]) => (
              <tr key={label}>
                <th>{label}</th>
                {compareFacilities.map((facility) => (
                  <td key={facility.id}>{value(facility)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function HospitalFinder() {
  const [searchParams] = useSearchParams();

  const { searchState, setSearchState, toggleCompare, clearComparison } =
    useHospitalSearch();

  const locationFromRequest = useMemo(() => {
    const latitudeParam = searchParams.get("lat");
    const longitudeParam = searchParams.get("lon");
    const accuracyParam = searchParams.get("accuracy");
    if (latitudeParam === null || longitudeParam === null || accuracyParam === null) {
      return null;
    }

    const lat = Number(latitudeParam);
    const lon = Number(longitudeParam);
    const accuracy = Number(accuracyParam);

    if (
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lon) ||
      lon < -180 ||
      lon > 180 ||
      !Number.isFinite(accuracy) ||
      accuracy > 5000
    ) {
      return null;
    }

    return {
      lat,
      lon,
      accuracy,
    };
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || searchState.query || "",
  );

  const [userLocation, setUserLocation] = useState(locationFromRequest);

  const [locationStatus, setLocationStatus] = useState("idle");

  const [facilities, setFacilities] = useState(
    searchParams.get("scope") === "nearby" ? searchState.facilities || [] : [],
  );

  const [selectedFacility, setSelectedFacility] = useState(null);

  const [radius, setRadius] = useState(5);

  const [searchScope, setSearchScope] = useState(
    searchParams.get("scope") === "nearby" ? "nearby" : "india",
  );
  const [userState, setUserState] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  const [facilityType, setFacilityType] = useState("all");
  const [schemeFilter, setSchemeFilter] = useState("all");

  const [emergencyOnly, setEmergencyOnly] = useState(
    searchParams.get("emergency") === "true",
  );

  const [sortBy, setSortBy] = useState("match");

  const [viewMode, setViewMode] = useState("split");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [stateRecommendations, setStateRecommendations] = useState(null);

  const [stateRecommendationsLoading, setStateRecommendationsLoading] =
    useState(false);

  const [route, setRoute] = useState(null);

  const [routeLoading, setRouteLoading] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [researchLoadingId, setResearchLoadingId] = useState("");

  const autoSearchRequested = useRef(false);
  const manualLocationSelected = useRef(false);
  const metricEstimateRequests = useRef(new Set());

  const recommendationRequestId = useRef(0);

  const loadStateRecommendations = useCallback(
    async (disease, scope = "india") => {
      if (!isHealthcareSearch(disease)) {
        return;
      }

      const requestId = ++recommendationRequestId.current;
      setStateRecommendationsLoading(true);

      if (scope === "state") {
        const hospitals = getPunjabHospitalFallbacks(disease);
        const stateFacilities = getIndiaHospitalFacilities(
          hospitals,
          disease,
          userLocation,
        );

        setStateRecommendations({
          disease,
          state: "Punjab",
          hospitals,
          resources: hospitals,
        });
        setFacilities(stateFacilities);
        setSearchState((current) => ({
          ...current,
          query: disease,
          facilities: stateFacilities,
          compareIds: [],
          updatedAt: new Date().toISOString(),
        }));
        setStateRecommendationsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/state-hospital-recommendations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              disease,
              state: scope === "state" ? userState : undefined,
            }),
          },
        );
        const data = await readApiResponse(response);
        if (!response.ok) {
          throw new Error(data.message || "State-wide research failed.");
        }
        if (
          !Array.isArray(data.hospitals) &&
          !Array.isArray(data.resources) &&
          !Array.isArray(data.recommendations)
        ) {
          throw new Error("The research API returned an invalid response.");
        }
        if (requestId !== recommendationRequestId.current) {
          return;
        }
        const hospitals =
          scope === "state" && data.recommendations?.length
            ? data.recommendations
            : getHospitalFallbacks(disease);
        setStateRecommendations({
          ...data,
          hospitals,
          resources:
            scope === "state" && data.recommendations?.length
              ? data.resources || []
              : data.resources?.length
                ? data.resources
                : data.recommendations || [],
        });
        const nationwideFacilities = getIndiaHospitalFacilities(
          hospitals,
          disease,
          userLocation,
        );
        setFacilities(nationwideFacilities);
        setSearchState((current) => ({
          ...current,
          query: disease,
          facilities: nationwideFacilities,
          compareIds: [],
          updatedAt: new Date().toISOString(),
        }));
      } catch (recommendationError) {
        if (requestId !== recommendationRequestId.current) {
          return;
        }
        console.error("STATE HOSPITAL RESEARCH ERROR:", recommendationError);
        const nationwideFacilities = getIndiaHospitalFacilities(
          getHospitalFallbacks(disease),
          disease,
          userLocation,
        );
        setStateRecommendations({
          disease,
          hospitals: getHospitalFallbacks(disease),
          resources: [],
          error:
            recommendationError.message ||
            "Live research is unavailable. Showing hospitals to research.",
        });
        setFacilities(nationwideFacilities);
        setSearchState((current) => ({
          ...current,
          query: disease,
          facilities: nationwideFacilities,
          compareIds: [],
          updatedAt: new Date().toISOString(),
        }));
      } finally {
        if (requestId === recommendationRequestId.current) {
          setStateRecommendationsLoading(false);
        }
      }
    },
    [setSearchState, userState, userLocation],
  );

  const locationRequestStarted = useRef(false);

  const [resultsPage, setResultsPage] = useState(0);

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
    manualLocationSelected.current = false;
    if (!navigator.geolocation) {
      console.error("Geolocation API is not supported.");
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setLocationStatus("loading");
    setError("");

    const handleSuccess = (position) => {
      if (manualLocationSelected.current) {
        return;
      }
      const { latitude, longitude, accuracy } = position.coords;
      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180 ||
        !Number.isFinite(accuracy) ||
        accuracy > 5000
      ) {
        setError(
          "Your device returned a location that may be too inaccurate. Enter your city or a nearby address in “Or choose a location” to search the correct area.",
        );
        setLocationStatus("error");
        setLoading(false);
        return;
      }

      setUserLocation({
        lat: latitude,
        lon: longitude,
        accuracy,
      });

      reverseGeocodeLocation({ latitude, longitude })
        .then((location) => {
          setUserState(location.state || location.county || "");
          setLocationLabel(
            location.city ||
              location.town ||
              location.village ||
              location.suburb ||
              location.formatted ||
              "",
          );
        })
        .catch(() => {
          setUserState("");
          setLocationLabel("");
        });

      setLocationStatus("success");
      setLoading(false);
      if (searchScope === "india" && isHealthcareSearch(searchQuery)) {
        loadStateRecommendations(searchQuery);
      }
    };

    const handleError = (error) => {
      if (manualLocationSelected.current) {
        return;
      }
      if (error.code === 1) {
        setError(
          "Location permission was denied. Please allow location access for localhost.",
        );
        setLocationStatus("error");
        setLoading(false);
        return;
      }

      setError(
        error.code === 3
          ? "Precise location timed out. Enter your city or address to choose the correct location."
          : "Unable to determine a precise location. Enter your city or address to choose the correct location.",
      );
      setLocationStatus("error");
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }, [loadStateRecommendations, searchScope, searchQuery]);

  const setManualLocation = useCallback(async (query) => {
    manualLocationSelected.current = true;
    setError("");
    setLocationStatus("loading");
    try {
      const location = await geocodeLocation(query);
      const nextLocation = {
        lat: location.lat,
        lon: location.lon,
        accuracy: 0,
      };
      setUserLocation(nextLocation);
      setUserState(location.state || location.county || "");
      setLocationLabel(location.formatted || query.trim());
      setSearchScope("nearby");
      setLocationStatus("success");
      autoSearchRequested.current = false;
      setFacilities([]);
      setSelectedFacility(null);
      setRoute(null);
      setSearchState((current) => ({
        ...current,
        facilities: [],
        compareIds: [],
        updatedAt: null,
      }));
    } catch (locationError) {
      setError(locationError.message || "Unable to find that location.");
      setLocationStatus("error");
      manualLocationSelected.current = false;
    }
  }, [setSearchState]);
  /*
   * GEOAPIFY SEARCH
   */

  const fetchNearbyFacilities = useCallback(
    async (queryOverride = null, emergencyMode = emergencyOnly) => {
      if (!userLocation) {
        setError(
          "Please allow location access before searching nearby facilities.",
        );
        return;
      }

      const activeQuery = queryOverride !== null ? queryOverride : searchQuery;

      setLoading(true);
      setError("");
      setSelectedFacility(null);
      setRoute(null);
      recommendationRequestId.current += 1;

      try {
        const data = await searchNearbyHealthcare({
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          radius,
          limit: emergencyMode ? 50 : 12,
        });

        const features = Array.isArray(data?.features) ? data.features : [];

        const transformed = features
          .map((feature) =>
            transformGeoapifyFacility(feature, userLocation, activeQuery),
          )
          .filter(Boolean)
          .filter(
            (facility) =>
              Number.isFinite(facility.distanceKm) &&
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
          updatedAt: new Date().toISOString(),
        }));

        setLastUpdated(new Date());

        if (transformed.length === 0) {
          setError(
            "No healthcare facilities were found in this area. Try increasing the search radius or changing the search term.",
          );
        }
      } catch (searchError) {
        console.error("Geoapify search error:", searchError);

        setError(
          searchError?.name === "TimeoutError" || searchError?.name === "AbortError"
            ? "Hospital search is taking too long. Please try again or choose a smaller search radius."
            : searchError?.message ||
            "The healthcare search service is temporarily unavailable. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [radius, searchQuery, emergencyOnly, setSearchState, userLocation],
  );

  /*
   * RESEARCH / VERIFICATION
   */

  const researchFacility = async (facility) => {
    const existingResearch = researchById[facility.id];

    if ((existingResearch && !existingResearch.error) || researchLoadingId) {
      return;
    }

    setResearchLoadingId(facility.id);

    try {
      const response = await fetch(`${API_URL}/api/hospital-research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: facility.name,
          address: facility.address,
          website: facility.website,
          context: {
            facilityType: facility.type,
            specialtyOrTreatment: searchQuery || facility.specialties,
          },
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Research failed");
      }

      setSearchState((current) => ({
        ...current,
        researchById: {
          ...(current.researchById || {}),
          [facility.id]: data,
        },
      }));
    } catch (researchError) {
      console.error("Research error:", researchError);

      setSearchState((current) => ({
        ...current,
        researchById: {
          ...(current.researchById || {}),
          [facility.id]: {
            error:
              researchError instanceof TypeError
                ? `Research service could not be reached at ${API_URL}. Check that the backend is running and CORS_ORIGINS contains this website.`
                : researchError.message ||
                  "Unable to verify this facility right now.",
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
  }, [getUserLocation]);

  /*
   * AUTOMATIC FIRST SEARCH
   */

  useEffect(() => {
    if (
      searchScope !== "nearby" ||
      radius === 100 ||
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
    radius,
    searchScope,
    userLocation,
  ]);

  /*
   * FILTERED RESULTS
   */

  const filteredFacilities = useMemo(() => {
    let result = [...facilities];

    if (schemeFilter === "pmjay-candidates") {
      result = result.filter(
        (facility) =>
          getPmjayListingStatus({
            ...facility,
            research: researchById[facility.id],
          }) !== "not-listed",
      );
    } else if (schemeFilter === "scheme-info") {
      result = result.filter(
        (facility) =>
          getPmjayListingStatus({
            ...facility,
            research: researchById[facility.id],
          }) !== "unknown",
      );
    }

    if (facilityType !== "all") {
      result = result.filter((facility) => facility.type === facilityType);
    }

    if (emergencyOnly) {
      result = result.filter((facility) => facility.emergency);
    }

    result.sort((a, b) => {
      if (sortBy === "distance") {
        if (!Number.isFinite(a.distanceKm)) {
          return Number.isFinite(b.distanceKm) ? 1 : 0;
        }
        if (!Number.isFinite(b.distanceKm)) return -1;
        return a.distanceKm - b.distanceKm;
      }

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "match") {
        if (!Number.isFinite(a.match)) {
          return Number.isFinite(b.match) ? 1 : 0;
        }
        if (!Number.isFinite(b.match)) return -1;
        if (b.match !== a.match) {
          return b.match - a.match;
        }

        if (!Number.isFinite(a.distanceKm)) {
          return Number.isFinite(b.distanceKm) ? 1 : 0;
        }
        if (!Number.isFinite(b.distanceKm)) return -1;
        return a.distanceKm - b.distanceKm;
      }

      return 0;
    });

    return result;
  }, [facilities, facilityType, emergencyOnly, researchById, schemeFilter, sortBy]);

  const totalResultsPages = Math.max(
    1,
    Math.ceil(filteredFacilities.length / RESULTS_PER_PAGE),
  );

  const visibleFacilities = filteredFacilities.slice(
    resultsPage * RESULTS_PER_PAGE,
    (resultsPage + 1) * RESULTS_PER_PAGE,
  );

  useEffect(() => {
    for (const facility of visibleFacilities) {
      const existingResearch = researchById[facility.id];
      if (
        existingResearch?.metricEstimates ||
        metricEstimateRequests.current.has(facility.id)
      ) {
        continue;
      }

      metricEstimateRequests.current.add(facility.id);
      fetch(`${API_URL}/api/hospital-estimates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: facility.name,
          address: facility.address,
          context: {
            facilityType: facility.type,
            specialtyOrTreatment: searchQuery || facility.specialties,
          },
        }),
      })
        .then(readApiResponse)
        .then((data) => {
          if (!data.success || !data.metricEstimates) {
            throw new Error(data.message || "Estimate service returned invalid data.");
          }
          setSearchState((current) => ({
            ...current,
            researchById: {
              ...(current.researchById || {}),
              [facility.id]: {
                ...(current.researchById?.[facility.id] || {}),
                metricEstimates: data.metricEstimates,
                metricEstimatesError: Boolean(data.metricEstimatesError),
              },
            },
          }));
        })
        .catch((estimateError) => {
          console.error("Hospital estimate error:", estimateError);
          setSearchState((current) => ({
            ...current,
            researchById: {
              ...(current.researchById || {}),
              [facility.id]: {
                ...(current.researchById?.[facility.id] || {}),
                metricEstimatesError: true,
              },
            },
          }));
        });
    }
  }, [visibleFacilities, researchById, searchQuery, setSearchState]);

  /*
   * MAP MARKERS
   */

  const mapFacilities = useMemo(() => {
    const visibleMapFacilities = filteredFacilities
      .filter(
        (facility) =>
          Number.isFinite(facility.lat) && Number.isFinite(facility.lon),
      )
      .slice(0, MAX_MAP_MARKERS);

    if (
      selectedFacility &&
      Number.isFinite(selectedFacility.lat) &&
      Number.isFinite(selectedFacility.lon) &&
      !visibleMapFacilities.some(
        (facility) => facility.id === selectedFacility.id,
      )
    ) {
      visibleMapFacilities.push(selectedFacility);
    }

    return visibleMapFacilities;
  }, [filteredFacilities, selectedFacility]);

  /*
   * PAGINATION
   */

  useEffect(() => {
    setResultsPage(0);
  }, [facilityType, emergencyOnly, schemeFilter, sortBy, radius, searchQuery]);

  useEffect(() => {
    setResultsPage((currentPage) =>
      Math.min(currentPage, totalResultsPages - 1),
    );
  }, [totalResultsPages]);

  /*
   * FACILITY TYPES
   */

  const facilityTypes = useMemo(() => {
    return Array.from(new Set(facilities.map((facility) => facility.type)));
  }, [facilities]);

  /*
   * SEARCH
   */

  const search = () => {
    if (!isHealthcareSearch(searchQuery)) {
      setError(
        "Please enter a health-related search, such as kidney treatment, cardiology, diabetes, cancer, eye care, or emergency care.",
      );
      setStateRecommendations(null);
      return;
    }

    if (searchScope === "nearby" && radius === 100) {
      setFacilities([]);
      setSelectedFacility(null);
      setError("");
      loadStateRecommendations(searchQuery, "state");
      return;
    }

    if (searchScope === "nearby") {
      fetchNearbyFacilities();
      return;
    }

    setFacilities([]);
    setSelectedFacility(null);
    setError("");
    loadStateRecommendations(searchQuery);
  };

  const handleSearchScopeChange = (nextScope) => {
    if (nextScope === searchScope) {
      return;
    }

    recommendationRequestId.current += 1;
    autoSearchRequested.current = false;
    setSearchScope(nextScope);
    setFacilities([]);
    setStateRecommendations(null);
    setStateRecommendationsLoading(false);
    setSelectedFacility(null);
    setRoute(null);
    setError("");

    if (nextScope === "india" && isHealthcareSearch(searchQuery)) {
      loadStateRecommendations(searchQuery, "india");
    }
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
    setSchemeFilter("all");
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
    if (
      !userLocation ||
      !Number.isFinite(facility.lat) ||
      !Number.isFinite(facility.lon)
    ) {
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

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Route request failed.");
      }

      const data = await response.json();

      if (!data.routes?.length) {
        throw new Error("No route found.");
      }

      /*
       * MapLibre expects [longitude, latitude]
       */
      const coordinates = data.routes[0].geometry.coordinates;

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
    if (
      !userLocation ||
      !Number.isFinite(facility.lat) ||
      !Number.isFinite(facility.lon)
    ) {
      return;
    }

    const destination = `${facility.lat},${facility.lon}`;

    const origin = `${userLocation.lat},${userLocation.lon}`;

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      `&travelmode=driving`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  /*
   * COMPARISON DATA
   */

  const compareFacilities = useMemo(
    () =>
      facilities
        .filter((facility) => compareIds.includes(facility.id))
        .map((facility) => ({
          ...facility,
          research: researchById[facility.id],
        })),
    [facilities, compareIds, researchById],
  );

  const mapCenter = useMemo(
    () =>
      searchScope === "india"
        ? [78.9629, 20.5937]
        : userLocation
          ? [userLocation.lon, userLocation.lat]
          : [DEFAULT_CENTER[1], DEFAULT_CENTER[0]],
    [searchScope, userLocation],
  );

  const isSearching = loading || stateRecommendationsLoading;

  return (
    <div className="hospital-finder-page">
      <SiteNavbar />

      <div className="hospital-finder-shell">
        <HospitalFinderHeader
          getUserLocation={getUserLocation}
          locationStatus={locationStatus}
          locationLabel={locationLabel}
          onSelectLocation={setManualLocation}
          userLocation={userLocation}
        />

        <HospitalFinderSearchPanel
          fetchNearbyFacilities={fetchNearbyFacilities}
          handleSearchScopeChange={handleSearchScopeChange}
          isSearching={isSearching}
          loadStateRecommendations={loadStateRecommendations}
          search={search}
          searchQuery={searchQuery}
          searchScope={searchScope}
          setFacilities={setFacilities}
          setSearchQuery={setSearchQuery}
          userLocation={userLocation}
        />

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

        <HospitalFinderToolbar
          clearFilters={clearFilters}
          emergencyOnly={emergencyOnly}
          facilityType={facilityType}
          facilityTypes={facilityTypes}
          fetchNearbyFacilities={fetchNearbyFacilities}
          isHealthcareSearch={isHealthcareSearch}
          loadStateRecommendations={loadStateRecommendations}
          radius={radius}
          searchQuery={searchQuery}
          searchScope={searchScope}
          schemeFilter={schemeFilter}
          setEmergencyOnly={setEmergencyOnly}
          setFacilityType={setFacilityType}
          setRadius={setRadius}
          setSchemeFilter={setSchemeFilter}
          setSortBy={setSortBy}
          setViewMode={setViewMode}
          sortBy={sortBy}
          userLocation={userLocation}
          viewMode={viewMode}
        />

        {/* RESULTS INFO */}

        <div className="results-meta">
          <div>
            <strong>{filteredFacilities.length}</strong> healthcare facilities
            found
          </div>

          <div className="data-source">
            Healthcare data: Geoapify / OpenStreetMap
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

        <main className={`finder-content view-${viewMode}`}>
          {/* LIST */}

          {viewMode !== "map" && (
            <section className="facility-results">
              {isSearching ? (
                <div className="loading-card">
                  <div className="loading-spinner" />

                  <h3>
                    {searchScope === "nearby"
                      ? "Finding nearby healthcare..."
                      : "Researching hospitals for your search..."}
                  </h3>

                  <p>
                    {searchScope === "nearby"
                      ? "Searching nearby healthcare facilities..."
                      : "Loading specialist hospital recommendations and matching facilities..."}
                  </p>
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="empty-card">
                  <div className="empty-icon">⌖</div>

                  <h3>No matching facilities</h3>

                  <p>
                    Try increasing the search radius or using a broader
                    healthcare term.
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
                visibleFacilities.map((facility) => {
                  const isSelected = selectedFacility?.id === facility.id;

                  const isCompared = compareIds.includes(facility.id);
                  const pmjayStatus = getPmjayListingStatus({
                    ...facility,
                    research: researchById[facility.id],
                  });

                  return (
                    <article
                      className={`facility-card ${
                        isSelected ? "selected" : ""
                      }`}
                      key={facility.id}
                      onClick={() => selectFacility(facility)}
                    >
                      <div className="facility-card-top">
                        <div className="facility-type">{facility.type}</div>

                        {facility.emergency && (
                          <span className="emergency-badge">Emergency</span>
                        )}

                        {facility.nationwide && (
                          <span className="specialist-badge">
                            Specialist match
                          </span>
                        )}
                      </div>

                      <div className="facility-card-body">
                        <div className="facility-main">
                          <h2>{facility.name}</h2>

                          <p className="facility-address">{facility.address}</p>

                          {facility.specialties && (
                            <p className="facility-specialties">
                              <strong>Specialties:</strong>{" "}
                              {facility.specialties}
                            </p>
                          )}

                          <div className="facility-metrics">
                            {Number.isFinite(facility.distanceKm) ? (
                              <span>{facility.distanceKm.toFixed(1)} km</span>
                            ) : facility.nationwide ? (
                              <span>India-wide · distance unavailable</span>
                            ) : (
                              <span>Distance unavailable</span>
                            )}

                            {facility.travelMinutes && (
                              <span>~{facility.travelMinutes} min drive</span>
                            )}

                            <span>
                              {Number.isFinite(facility.match)
                                ? `${facility.match}% calculated match`
                                : "Match data unavailable"}
                            </span>
                          </div>
                        </div>

                        <div className="match-circle">
                          <strong>
                            {Number.isFinite(facility.match) ? facility.match : "—"}
                          </strong>

                          <span>{Number.isFinite(facility.match) ? "%" : ""}</span>
                        </div>
                      </div>

                      <div className="facility-data-note">
                        Match uses listed specialty keywords, available
                        distance, and emergency status for emergency searches.
                        Specialty fit is weighted 70%, distance 20%
                        (half-score at 10 km), and emergency evidence 10% for
                        emergency searches. If a facility has no specialty
                        details, its specialty fit starts at 50% and is an
                        estimate, not a verified match.
                      </div>
                      <SourcedCostAndWait research={researchById[facility.id]} />

                      <div
                        className="facility-actions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          onClick={() => startRoute(facility)}
                          disabled={
                            !userLocation ||
                            !Number.isFinite(facility.lat) ||
                            !Number.isFinite(facility.lon)
                          }
                        >
                          {routeLoading && selectedFacility?.id === facility.id
                            ? "Loading route..."
                            : "Route"}
                        </button>

                        <button
                          onClick={() => openGoogleMaps(facility)}
                          disabled={
                            !userLocation ||
                            !Number.isFinite(facility.lat) ||
                            !Number.isFinite(facility.lon)
                          }
                        >
                          Navigate
                        </button>

                        {facility.phone && (
                          <a
                            href={`tel:${facility.phone}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            Call
                          </a>
                        )}

                        {facility.website && (
                          <a
                            href={facility.website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Website
                          </a>
                        )}

                        <button
                          className={isCompared ? "compare-active" : ""}
                          onClick={() => toggleCompare(facility)}
                        >
                          {isCompared ? "Compared" : "Compare"}
                        </button>

                        <button
                          type="button"
                          onClick={() => researchFacility(facility)}
                        >
                          {researchLoadingId === facility.id
                            ? "Researching..."
                            : researchById[facility.id]?.error
                              ? "Retry verify"
                              : "Verify data"}
                        </button>
                      </div>

                      {researchById[facility.id] && (
                        <div
                          className={`facility-research-status ${
                            researchById[facility.id].error
                              ? "is-error"
                              : "is-success"
                          }`}
                          role="status"
                        >
                          {researchById[facility.id].error ? (
                            researchById[facility.id].error
                          ) : (
                            <>
                              <p>
                                {researchById[facility.id].summary ||
                                  "Verified source data is available in the comparison panel."}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                      {schemeFilter === "pmjay-candidates" && (
                        <p className="scheme-research-status">
                          {pmjayStatus === "listed"
                            ? "PM-JAY: Acceptance reported"
                            : "PM-JAY: Not verified"}
                        </p>
                      )}
                    </article>
                  );
                })
              )}

              {!loading && filteredFacilities.length > RESULTS_PER_PAGE && (
                <div
                  className="results-pagination"
                  aria-label="Hospital results pages"
                >
                  <button
                    onClick={() =>
                      setResultsPage((page) => Math.max(0, page - 1))
                    }
                    disabled={resultsPage === 0}
                  >
                    Previous
                  </button>

                  <span>
                    Page {resultsPage + 1} of {totalResultsPages}
                  </span>

                  <button
                    onClick={() =>
                      setResultsPage((page) =>
                        Math.min(totalResultsPages - 1, page + 1),
                      )
                    }
                    disabled={resultsPage === totalResultsPages - 1}
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
                userLocation={userLocation}
                mapCenter={mapCenter}
                mapZoom={searchScope === "india" ? 5 : 13}
                showUserLocation={searchScope !== "india"}
                facilities={mapFacilities}
                selectedFacility={selectedFacility}
                onSelectFacility={selectFacility}
                route={route}
              />

              {/* MAP LEGEND */}

              <div className="map-legend">
                {searchScope !== "india" && (
                  <div>
                    <span className="legend-dot user" />
                    Your location
                  </div>
                )}

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

        {stateRecommendationsLoading && (
          <section className="state-recommendations">
            <div className="state-recommendations-heading">
              <span className="eyebrow">INDIA-WIDE RESEARCH</span>
              <h2>
                Finding leading options in India for{" "}
                {searchQuery || "your requirement"}...
              </h2>
            </div>
          </section>
        )}

        {!stateRecommendationsLoading &&
          stateRecommendations &&
          !stateRecommendationsLoading && (
            <section className="state-recommendations">
              <div className="state-recommendations-heading">
                <div>
                  <span className="eyebrow">INDIA-WIDE RESEARCH</span>
                  <h2>Hospitals and resources across India</h2>
                  <p>
                    Explore hospitals and resources for{" "}
                    {stateRecommendations.disease || searchQuery}.
                  </p>
                </div>
              </div>
              {stateRecommendations.resources?.length > 0 && (
                <div className="state-recommendation-group resources-group">
                  <div className="state-recommendation-group-heading">
                    <h3>Supporting resources</h3>
                    <span>{stateRecommendations.resources.length} sources</span>
                  </div>
                  <div className="state-recommendation-grid">
                    {stateRecommendations.resources.map((resource) => (
                      <article
                        className="state-recommendation-card resource-recommendation-card"
                        key={resource.sourceUrl}
                      >
                        <span className="state-recommendation-kind">
                          Resource
                        </span>
                        <h3>{resource.name}</h3>
                        <p>{resource.summary}</p>
                        <a
                          href={resource.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {resource.sourceLabel || "Read resource"}
                        </a>
                      </article>
                    ))}
                  </div>
                </div>
              )}
              {!stateRecommendations.hospitals?.length &&
              !stateRecommendations.resources?.length &&
              !stateRecommendations.recommendations?.length ? (
                <p className="state-recommendation-empty">
                  {stateRecommendations.error ||
                    "No India-wide hospital results were returned. Try the search again."}
                </p>
              ) : null}
            </section>
          )}

        {/* COMPARISON */}

        {compareFacilities.length > 0 && (
          <section className="comparison-panel">
            <div className="comparison-header">
              <div>
                <span className="eyebrow">COMPARISON</span>

                <h2>Compare selected facilities</h2>
              </div>

              <div className="comparison-header-actions">
                <Link className="comparison-page-link" to="/compare">
                  Open full comparison
                </Link>

                <button onClick={clearComparison}>Clear comparison</button>
              </div>
            </div>

            <div className="comparison-table-wrap">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Requirement</th>

                    {compareFacilities.map((facility) => (
                      <th key={facility.id}>{facility.name}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[
                    [
                      "Requirement match",
                      (facility) => Number.isFinite(facility.match)
                        ? `${facility.match}%`
                        : "Data not available",
                    ],

                    [
                      "Distance",
                      (facility) => Number.isFinite(facility.distanceKm)
                        ? `${facility.distanceKm.toFixed(1)} km`
                        : "Data not available",
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
                        facility.specialties || "Data not available",
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
                      (facility) => facility.phone || "Data not available",
                    ],

                    [
                      "Patients / outcomes",
                      (facility) =>
                        facility.research?.metrics?.patientsTreated ||
                        "Data not available",
                    ],

                    [
                      "Success / outcome rate",
                      (facility) =>
                        facility.research?.metrics?.successRate ||
                        "Data not available",
                    ],

                    [
                      "Treatment cost range",
                      (facility) => (
                        <SourcedMetric research={facility.research} metricKey="treatmentCost" />
                      ),
                    ],
                    [
                      "Wait time",
                      (facility) => (
                        <SourcedMetric research={facility.research} metricKey="waitTime" />
                      ),
                    ],

                    [
                      "Insurance / scheme",
                      (facility) =>
                        facility.research?.metrics?.insurance ||
                        "Data not available",
                    ],

                    [
                      "Research sources",
                      (facility) =>
                        facility.research?.sources?.length
                          ? facility.research.sources.map((source, index) => (
                              <a
                                key={source.url || index}
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Source {index + 1}
                              </a>
                            ))
                          : "Data not available",
                    ],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <th>{label}</th>

                      {compareFacilities.map((facility) => (
                        <td key={facility.id}>{value(facility)}</td>
                      ))}
                    </tr>
                  ))}

                  <tr>
                    <th>Actions</th>

                    {compareFacilities.map((facility) => (
                      <td key={facility.id}>
                        <button onClick={() => researchFacility(facility)}>
                          {facility.research ? "Data checked" : "Verify data"}
                        </button>{" "}
                        <button onClick={() => selectFacility(facility)}>
                          Map
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

          </section>
        )}

        {/* DATA DISCLAIMER */}

        <footer className="finder-footer">
          <div>
            <strong>Healthcare data</strong>
            <p>Listings may be incomplete. Confirm details with the facility.</p>
          </div>

          <div>
            <strong>Medical guidance</strong>
            <p>For urgent symptoms, contact emergency services or a clinician.</p>
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
