import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./HospitalFinder.css";

/* =========================================================
   LEAFLET ICONS
========================================================= */

const hospitalIcon = L.divIcon({
  className: "custom-map-marker",
  html: `
    <div class="map-marker hospital-marker">
      <span>🏥</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -22],
});

const selectedHospitalIcon = L.divIcon({
  className: "custom-map-marker",
  html: `
    <div class="map-marker selected-hospital-marker">
      <span>🏥</span>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -25],
});

const userIcon = L.divIcon({
  className: "custom-map-marker",
  html: `
    <div class="user-location-marker">
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const nearbyHospitalIcon = L.divIcon({
  className: "nearby-hospital-marker",
  html: `
    <div class="nearby-marker-inner">
      🏥
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

const nearbyClinicIcon = L.divIcon({
  className: "nearby-clinic-marker",
  html: `
    <div class="nearby-marker-inner clinic-marker-inner">
      ⚕
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

/* =========================================================
   DEMO PERSONALIZED HOSPITAL DATA
========================================================= */

const hospitals = [
  {
    id: 1,
    name: "CityCare Multispeciality Hospital",
    position: [30.7333, 76.7794],
    location: "Chandigarh",
    match: 94,
    rating: 4.7,
    reviews: 1820,
    specialties: ["Nephrology", "Cardiology", "Neurology"],
    treatments: ["Kidney Care", "Dialysis", "Kidney Surgery"],
    costMin: 120000,
    costMax: 280000,
    insurance: ["Government Scheme", "Private Insurance"],
    facilities: [
      "Emergency",
      "ICU",
      "Ambulance",
      "24/7 Pharmacy",
    ],
    languages: ["English", "Hindi", "Punjabi"],
    emergency: true,
    ambulance: true,
    verified: true,
  },
  {
    id: 2,
    name: "LifeLine Medical Centre",
    position: [30.7046, 76.7179],
    location: "Mohali",
    match: 89,
    rating: 4.5,
    reviews: 1260,
    specialties: ["Nephrology", "Urology", "Cardiology"],
    treatments: ["Kidney Care", "Dialysis", "Urology"],
    costMin: 100000,
    costMax: 240000,
    insurance: ["Government Scheme"],
    facilities: ["Emergency", "ICU", "Ambulance"],
    languages: ["English", "Hindi", "Punjabi"],
    emergency: true,
    ambulance: true,
    verified: true,
  },
  {
    id: 3,
    name: "NorthCare Institute",
    position: [30.7683, 76.7794],
    location: "Sector 16, Chandigarh",
    match: 86,
    rating: 4.6,
    reviews: 980,
    specialties: ["Nephrology", "Oncology", "Neurology"],
    treatments: ["Kidney Care", "Dialysis"],
    costMin: 160000,
    costMax: 310000,
    insurance: ["Private Insurance", "Government Scheme"],
    facilities: ["Emergency", "ICU", "24/7 Pharmacy"],
    languages: ["English", "Hindi"],
    emergency: true,
    ambulance: false,
    verified: true,
  },
  {
    id: 4,
    name: "Hope General Hospital",
    position: [30.7196, 76.8102],
    location: "Sector 22, Chandigarh",
    match: 82,
    rating: 4.3,
    reviews: 740,
    specialties: ["General Medicine", "Nephrology"],
    treatments: ["Kidney Care", "General Treatment"],
    costMin: 90000,
    costMax: 210000,
    insurance: ["Government Scheme"],
    facilities: ["Emergency", "Ambulance"],
    languages: ["English", "Hindi", "Punjabi"],
    emergency: true,
    ambulance: true,
    verified: true,
  },
  {
    id: 5,
    name: "Prime Health Hospital",
    position: [30.7415, 76.8185],
    location: "Sector 43, Chandigarh",
    match: 79,
    rating: 4.4,
    reviews: 610,
    specialties: ["Cardiology", "Orthopedics", "General Medicine"],
    treatments: ["General Treatment", "Emergency Care"],
    costMin: 80000,
    costMax: 190000,
    insurance: ["Private Insurance"],
    facilities: ["Emergency", "ICU"],
    languages: ["English", "Hindi"],
    emergency: true,
    ambulance: false,
    verified: false,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) {
    return "Not available";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) {
    return "Distance unavailable";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
};

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) {
    return "Travel time unavailable";
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const earthRadius = 6371;

  const latDifference =
    ((lat2 - lat1) * Math.PI) / 180;

  const lonDifference =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) *
      Math.sin(latDifference / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(lonDifference / 2) *
      Math.sin(lonDifference / 2);

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({
  selectedHospital,
  userLocation,
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedHospital?.position) {
      map.flyTo(selectedHospital.position, 13, {
        duration: 0.8,
      });

      return;
    }

    if (userLocation) {
      map.flyTo(userLocation, 12, {
        duration: 0.8,
      });
    }
  }, [selectedHospital, userLocation, map]);

  return null;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HospitalFinder() {
  /* -------------------------------------------------------
     SEARCH / FILTER STATE
  ------------------------------------------------------- */

  const [search, setSearch] = useState("Kidney treatment");
  const [specialty, setSpecialty] = useState("All");
  const [insurance, setInsurance] = useState("All");
  const [budget, setBudget] = useState(300000);
  const [emergencyOnly, setEmergencyOnly] =
    useState(false);

  /* -------------------------------------------------------
     UI STATE
  ------------------------------------------------------- */

  const [selectedHospital, setSelectedHospital] =
    useState(null);

  const [view, setView] = useState("split");

  const [sortBy, setSortBy] = useState("match");

  const [compareList, setCompareList] = useState([]);

  /* -------------------------------------------------------
     USER LOCATION STATE
  ------------------------------------------------------- */

  const [userLocation, setUserLocation] =
    useState(null);

  const [locationStatus, setLocationStatus] =
    useState("idle");

  const [locationError, setLocationError] =
    useState("");

  /* -------------------------------------------------------
     NEARBY HEALTHCARE STATE
  ------------------------------------------------------- */

  const [nearbyPlaces, setNearbyPlaces] =
    useState([]);

  const [nearbyLoading, setNearbyLoading] =
    useState(false);

  const [nearbyError, setNearbyError] =
    useState("");

  const [nearbyRadius, setNearbyRadius] =
    useState(10000);

  /* -------------------------------------------------------
     ROUTE STATE
  ------------------------------------------------------- */

  const [route, setRoute] = useState([]);

  const [routeInfo, setRouteInfo] =
    useState(null);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  /* =======================================================
     GET USER LOCATION
  ======================================================= */

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationStatus("loading");
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
        } = position.coords;

        const coordinates = [
          latitude,
          longitude,
        ];

        setUserLocation(coordinates);
        setLocationStatus("success");
        setLocationError("");

        fetchNearbyHealthcare(
          latitude,
          longitude
        );
      },
      (error) => {
        console.error(
          "Geolocation error:",
          error
        );

        setLocationStatus("error");

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access to find nearby hospitals."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be determined."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Unable to access your location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  /* =======================================================
     FETCH REAL NEARBY HEALTHCARE
  ======================================================= */

  const fetchNearbyHealthcare = async (
    latitude,
    longitude
  ) => {
    setNearbyLoading(true);
    setNearbyError("");

    const query = `
      [out:json][timeout:25];

      (
        nwr["amenity"="hospital"](around:${nearbyRadius},${latitude},${longitude});
        nwr["amenity"="clinic"](around:${nearbyRadius},${latitude},${longitude});
        nwr["amenity"="doctors"](around:${nearbyRadius},${latitude},${longitude});

        nwr["healthcare"="hospital"](around:${nearbyRadius},${latitude},${longitude});
        nwr["healthcare"="clinic"](around:${nearbyRadius},${latitude},${longitude});
        nwr["healthcare"="doctor"](around:${nearbyRadius},${latitude},${longitude});
      );

      out center tags;
    `;

    try {
      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(query)}`,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to retrieve nearby healthcare facilities."
        );
      }

      const data = await response.json();

      const places = data.elements
        .map((element) => {
          const latitudeValue =
            element.lat ??
            element.center?.lat;

          const longitudeValue =
            element.lon ??
            element.center?.lon;

          if (
            typeof latitudeValue !== "number" ||
            typeof longitudeValue !== "number"
          ) {
            return null;
          }

          const tags = element.tags || {};

          let type =
            "Healthcare Facility";

          if (
            tags.amenity === "hospital" ||
            tags.healthcare === "hospital"
          ) {
            type = "Hospital";
          } else if (
            tags.amenity === "clinic" ||
            tags.healthcare === "clinic"
          ) {
            type = "Clinic";
          } else if (
            tags.amenity === "doctors" ||
            tags.healthcare === "doctor"
          ) {
            type = "Doctor";
          }

          const distance =
            calculateDistance(
              latitude,
              longitude,
              latitudeValue,
              longitudeValue
            );

          return {
            id: `${element.type}-${element.id}`,
            name:
              tags.name ||
              "Unnamed Healthcare Facility",
            type,
            latitude: latitudeValue,
            longitude: longitudeValue,
            distance,

            address: [
              tags["addr:housenumber"],
              tags["addr:street"],
              tags["addr:suburb"],
              tags["addr:city"],
            ]
              .filter(Boolean)
              .join(", "),

            phone:
              tags.phone ||
              tags["contact:phone"] ||
              "",

            website:
              tags.website ||
              tags["contact:website"] ||
              "",

            emergency:
              tags.emergency === "yes",

            openingHours:
              tags.opening_hours || "",
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) => a.distance - b.distance
        );

      const uniquePlaces = Array.from(
        new Map(
          places.map((place) => [
            place.id,
            place,
          ])
        ).values()
      );

      setNearbyPlaces(uniquePlaces);
    } catch (error) {
      console.error(
        "Nearby healthcare error:",
        error
      );

      setNearbyError(
        "We couldn't load nearby healthcare facilities right now."
      );

      setNearbyPlaces([]);
    } finally {
      setNearbyLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOCATION
  ======================================================= */

  useEffect(() => {
    getUserLocation();
  }, []);

  /* =======================================================
     HOSPITALS + DISTANCE
  ======================================================= */

  const hospitalsWithDistance = useMemo(() => {
    return hospitals.map((hospital) => {
      if (!userLocation) {
        return {
          ...hospital,
          distance: null,
          estimatedTravelTime: null,
        };
      }

      const distance =
        calculateDistance(
          userLocation[0],
          userLocation[1],
          hospital.position[0],
          hospital.position[1]
        );

      const estimatedTravelTime =
        (distance / 30) * 60;

      return {
        ...hospital,
        distance,
        estimatedTravelTime,
      };
    });
  }, [userLocation]);

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredHospitals = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    let result =
      hospitalsWithDistance.filter(
        (hospital) => {
          const matchesSearch =
            !query ||
            hospital.name
              .toLowerCase()
              .includes(query) ||
            hospital.specialties.some(
              (item) =>
                item
                  .toLowerCase()
                  .includes(query)
            ) ||
            hospital.treatments.some(
              (item) =>
                item
                  .toLowerCase()
                  .includes(query)
            );

          const matchesSpecialty =
            specialty === "All" ||
            hospital.specialties.includes(
              specialty
            );

          const matchesInsurance =
            insurance === "All" ||
            hospital.insurance.includes(
              insurance
            );

          const matchesBudget =
            hospital.costMin <= budget;

          const matchesEmergency =
            !emergencyOnly ||
            hospital.emergency;

          return (
            matchesSearch &&
            matchesSpecialty &&
            matchesInsurance &&
            matchesBudget &&
            matchesEmergency
          );
        }
      );

    result.sort((a, b) => {
      if (sortBy === "match") {
        return b.match - a.match;
      }

      if (sortBy === "distance") {
        if (
          a.distance === null ||
          b.distance === null
        ) {
          return 0;
        }

        return a.distance - b.distance;
      }

      if (sortBy === "rating") {
        return b.rating - a.rating;
      }

      if (sortBy === "cost") {
        return a.costMin - b.costMin;
      }

      return 0;
    });

    return result;
  }, [
    hospitalsWithDistance,
    search,
    specialty,
    insurance,
    budget,
    emergencyOnly,
    sortBy,
  ]);

  /* =======================================================
     SELECT HOSPITAL
  ======================================================= */

  const handleSelectHospital = (
    hospital
  ) => {
    setSelectedHospital(hospital);
    setRoute([]);
    setRouteInfo(null);
    setRouteError("");
  };

  /* =======================================================
     ROUTE FROM USER TO SELECTED HOSPITAL
  ======================================================= */

  useEffect(() => {
    if (
      !userLocation ||
      !selectedHospital?.position
    ) {
      setRoute([]);
      setRouteInfo(null);
      return;
    }

    const fetchRoute = async () => {
      setRouteLoading(true);
      setRouteError("");
      setRoute([]);

      const startLat = userLocation[0];
      const startLng = userLocation[1];

      const endLat =
        selectedHospital.position[0];

      const endLng =
        selectedHospital.position[1];

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLng},${startLat};` +
        `${endLng},${endLat}` +
        `?overview=full&geometries=geojson`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            "Route request failed."
          );
        }

        const data = await response.json();

        if (
          !data.routes ||
          !data.routes.length
        ) {
          throw new Error(
            "No route was found."
          );
        }

        const firstRoute =
          data.routes[0];

        const routeCoordinates =
          firstRoute.geometry.coordinates.map(
            ([lng, lat]) => [
              lat,
              lng,
            ]
          );

        setRoute(routeCoordinates);

        setRouteInfo({
          distance:
            firstRoute.distance / 1000,
          duration:
            firstRoute.duration / 60,
        });
      } catch (error) {
        console.error(
          "Route error:",
          error
        );

        setRouteError(
          "Unable to calculate the driving route."
        );
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [
    userLocation,
    selectedHospital,
  ]);

  /* =======================================================
     COMPARE
  ======================================================= */

  const toggleCompare = (
    hospital
  ) => {
    setCompareList((current) => {
      const exists = current.some(
        (item) =>
          item.id === hospital.id
      );

      if (exists) {
        return current.filter(
          (item) =>
            item.id !== hospital.id
        );
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, hospital];
    });
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const startNavigation = () => {
    if (!selectedHospital?.position) {
      return;
    }

    const destination =
      `${selectedHospital.position[0]},` +
      `${selectedHospital.position[1]}`;

    let url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(
        destination
      )}` +
      `&travelmode=driving`;

    if (userLocation) {
      const origin =
        `${userLocation[0]},` +
        `${userLocation[1]}`;

      url +=
        `&origin=${encodeURIComponent(
          origin
        )}`;
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =======================================================
     CONVERT NEARBY PLACE TO SELECTABLE OBJECT
  ======================================================= */

  const selectNearbyPlace = (
    place
  ) => {
    const nearbyHospital = {
      id: place.id,
      name: place.name,

      position: [
        place.latitude,
        place.longitude,
      ],

      location:
        place.address || "Nearby",

      match: null,
      rating: null,
      reviews: null,

      specialties: [],
      treatments: [],

      costMin: null,
      costMax: null,

      insurance: [],
      facilities: [],
      languages: [],

      emergency: place.emergency,
      ambulance: false,

      verified: false,
      nearby: true,

      phone: place.phone,
      website: place.website,
      openingHours:
        place.openingHours,
      type: place.type,
    };

    setSelectedHospital(
      nearbyHospital
    );

    setRoute([]);
    setRouteInfo(null);
    setRouteError("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="hospital-finder-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="hospital-finder-header">

        <div>
          <div className="page-eyebrow">
            HEALTHCARE DISCOVERY
          </div>

          <h1>
            Find the right hospital
          </h1>

          <p>
            Discover hospitals that match
            your health needs, preferences,
            location and budget.
          </p>
        </div>

        <div className="location-status-wrapper">

          {locationStatus ===
            "loading" && (
            <div className="location-loading">
              <span className="status-dot loading-dot" />
              Finding your location...
            </div>
          )}

          {locationStatus ===
            "success" && (
            <div className="location-success">
              <span className="status-dot" />
              Location detected
            </div>
          )}

          {locationStatus ===
            "error" && (
            <div className="location-error">
              {locationError}
            </div>
          )}

          <button
            type="button"
            className="location-button"
            onClick={
              getUserLocation
            }
          >
            📍 Use my location
          </button>
        </div>
      </div>

      {/* ===================================================
          SEARCH
      =================================================== */}

      <div className="hospital-search-section">

        <div className="hospital-search-box">
          <span className="search-icon">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search disease, treatment, hospital or specialty..."
          />
        </div>

        <div className="requirement-chips">

          <button
            type="button"
            className={
              specialty === "Nephrology"
                ? "requirement-chip active"
                : "requirement-chip"
            }
            onClick={() =>
              setSpecialty(
                specialty ===
                  "Nephrology"
                  ? "All"
                  : "Nephrology"
              )
            }
          >
            Kidney Care
          </button>

          <button
            type="button"
            className={
              emergencyOnly
                ? "requirement-chip active"
                : "requirement-chip"
            }
            onClick={() =>
              setEmergencyOnly(
                (current) => !current
              )
            }
          >
            Emergency
          </button>

          <button
            type="button"
            className="requirement-chip"
            onClick={() =>
              setInsurance(
                "Government Scheme"
              )
            }
          >
            Government Scheme
          </button>

          <button
            type="button"
            className="requirement-chip"
            onClick={() =>
              setInsurance("All")
            }
          >
            Clear filters
          </button>

        </div>
      </div>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="hospital-finder-layout">

        {/* =================================================
            FILTER SIDEBAR
        ================================================= */}

        <aside className="hospital-filter-sidebar">

          <div className="filter-header">
            <div>
              <span>
                FILTERS
              </span>

              <h3>
                Your requirements
              </h3>
            </div>
          </div>

          <div className="filter-group">

            <label>
              Specialty
            </label>

            <select
              value={specialty}
              onChange={(event) =>
                setSpecialty(
                  event.target.value
                )
              }
            >
              <option value="All">
                All specialties
              </option>

              <option value="Nephrology">
                Nephrology
              </option>

              <option value="Cardiology">
                Cardiology
              </option>

              <option value="Neurology">
                Neurology
              </option>

              <option value="Urology">
                Urology
              </option>

              <option value="General Medicine">
                General Medicine
              </option>

              <option value="Oncology">
                Oncology
              </option>

              <option value="Orthopedics">
                Orthopedics
              </option>
            </select>

          </div>

          <div className="filter-group">

            <label>
              Insurance
            </label>

            <select
              value={insurance}
              onChange={(event) =>
                setInsurance(
                  event.target.value
                )
              }
            >
              <option value="All">
                Any insurance
              </option>

              <option value="Government Scheme">
                Government Scheme
              </option>

              <option value="Private Insurance">
                Private Insurance
              </option>
            </select>

          </div>

          <div className="filter-group">

            <div className="filter-label-row">
              <label>
                Maximum budget
              </label>

              <strong>
                {formatCurrency(
                  budget
                )}
              </strong>
            </div>

            <input
              type="range"
              min="50000"
              max="500000"
              step="10000"
              value={budget}
              onChange={(event) =>
                setBudget(
                  Number(
                    event.target.value
                  )
                )
              }
            />

          </div>

          <label className="emergency-toggle">

            <input
              type="checkbox"
              checked={emergencyOnly}
              onChange={(event) =>
                setEmergencyOnly(
                  event.target.checked
                )
              }
            />

            <span>
              Emergency services required
            </span>

          </label>

          <div className="filter-divider" />

          <div className="filter-note">
            <strong>
              Matching is personalized
            </strong>

            <p>
              Results are based on your
              stated requirements rather
              than a generic hospital ranking.
            </p>
          </div>

        </aside>

        {/* =================================================
            RESULTS + MAP
        ================================================= */}

        <main className="hospital-results-area">

          {/* ===============================================
              RESULTS TOOLBAR
          =============================================== */}

          <div className="results-toolbar">

            <div>
              <strong>
                {filteredHospitals.length}
              </strong>{" "}
              personalized matches
            </div>

            <div className="results-controls">

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="match">
                  Best match
                </option>

                <option value="distance">
                  Nearest
                </option>

                <option value="rating">
                  Highest rated
                </option>

                <option value="cost">
                  Lowest cost
                </option>
              </select>

              <div className="view-switcher">

                <button
                  type="button"
                  className={
                    view === "split"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setView("split")
                  }
                >
                  Split
                </button>

                <button
                  type="button"
                  className={
                    view === "list"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setView("list")
                  }
                >
                  List
                </button>

                <button
                  type="button"
                  className={
                    view === "map"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setView("map")
                  }
                >
                  Map
                </button>

              </div>

            </div>
          </div>

          {/* ===============================================
              NEARBY HEALTHCARE
          =============================================== */}

          <div className="nearby-healthcare-panel">

            <div className="nearby-healthcare-header">

              <div>
                <span className="section-eyebrow">
                  NEARBY
                </span>

                <h3>
                  Healthcare around you
                </h3>
              </div>

              <span className="nearby-count">
                {nearbyPlaces.length}
              </span>

            </div>

            {nearbyLoading && (
              <div className="nearby-loading">
                Finding nearby hospitals
                and clinics...
              </div>
            )}

            {!nearbyLoading &&
              nearbyError && (
                <div className="nearby-error">
                  {nearbyError}
                </div>
              )}

            {!nearbyLoading &&
              !nearbyError &&
              nearbyPlaces.length ===
                0 && (
                <div className="nearby-empty">
                  No mapped healthcare
                  facilities were found
                  within 10 km.
                </div>
              )}

            {!nearbyLoading &&
              nearbyPlaces.length >
                0 && (
                <div className="nearby-list">

                  {nearbyPlaces
                    .slice(0, 6)
                    .map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className="nearby-list-item"
                        onClick={() =>
                          selectNearbyPlace(
                            place
                          )
                        }
                      >

                        <span className="nearby-list-icon">
                          {place.type ===
                          "Hospital"
                            ? "🏥"
                            : "⚕"}
                        </span>

                        <span className="nearby-list-content">

                          <strong>
                            {place.name}
                          </strong>

                          <small>
                            {place.type}
                            {" · "}
                            {formatDistance(
                              place.distance
                            )}
                          </small>

                        </span>

                        <span className="nearby-list-arrow">
                          →
                        </span>

                      </button>
                    ))}

                </div>
              )}

          </div>

          {/* ===============================================
              CONTENT GRID
          =============================================== */}

          <div
            className={
              view === "map"
                ? "hospital-content-grid map-only"
                : view === "list"
                ? "hospital-content-grid list-only"
                : "hospital-content-grid"
            }
          >

            {/* =============================================
                HOSPITAL LIST
            ============================================= */}

            {view !== "map" && (
              <div className="hospital-list">

                {filteredHospitals.length ===
                  0 && (
                  <div className="empty-results">
                    <div className="empty-results-icon">
                      🔎
                    </div>

                    <h3>
                      No matching hospitals
                    </h3>

                    <p>
                      Try changing your
                      search or filters.
                    </p>
                  </div>
                )}

                {filteredHospitals.map(
                  (hospital) => {
                    const isSelected =
                      selectedHospital?.id ===
                      hospital.id;

                    const isCompared =
                      compareList.some(
                        (item) =>
                          item.id ===
                          hospital.id
                      );

                    return (
                      <div
                        key={hospital.id}
                        className={
                          isSelected
                            ? "hospital-card selected"
                            : "hospital-card"
                        }
                        onClick={() =>
                          handleSelectHospital(
                            hospital
                          )
                        }
                      >

                        <div className="hospital-card-top">

                          <div className="hospital-card-icon">
                            🏥
                          </div>

                          <div className="hospital-card-main">

                            <div className="hospital-name-row">

                              <h3>
                                {hospital.name}
                              </h3>

                              {hospital.verified && (
                                <span className="verified-badge">
                                  ✓ Verified
                                </span>
                              )}

                            </div>

                            <p className="hospital-location">
                              📍{" "}
                              {hospital.location}
                            </p>

                          </div>

                          <div className="match-badge">
                            <strong>
                              {hospital.match}%
                            </strong>

                            <span>
                              match
                            </span>
                          </div>

                        </div>

                        <div className="hospital-card-stats">

                          <div>
                            <span>
                              Rating
                            </span>

                            <strong>
                              ⭐{" "}
                              {hospital.rating}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Reviews
                            </span>

                            <strong>
                              {hospital.reviews.toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Treatment
                            </span>

                            <strong>
                              {formatCurrency(
                                hospital.costMin
                              )}
                              +
                            </strong>
                          </div>

                        </div>

                        {hospital.distance !==
                          null && (
                          <div className="distance-row">

                            <span>
                              📍{" "}
                              {formatDistance(
                                hospital.distance
                              )}
                            </span>

                            <span>
                              🚗{" "}
                              {formatDuration(
                                hospital.estimatedTravelTime
                              )}
                            </span>

                          </div>
                        )}

                        <div className="hospital-tags">

                          {hospital.specialties
                            .slice(0, 3)
                            .map(
                              (item) => (
                                <span
                                  key={item}
                                >
                                  {item}
                                </span>
                              )
                            )}

                        </div>

                        <div className="hospital-card-footer">

                          <div className="hospital-facilities">

                            {hospital.facilities
                              .slice(0, 3)
                              .map(
                                (item) => (
                                  <span
                                    key={item}
                                  >
                                    {item}
                                  </span>
                                )
                              )}

                          </div>

                          <div className="hospital-actions">

                            <button
                              type="button"
                              className={
                                isCompared
                                  ? "compare-button active"
                                  : "compare-button"
                              }
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                toggleCompare(
                                  hospital
                                );
                              }}
                            >
                              {isCompared
                                ? "✓ Comparing"
                                : "Compare"}
                            </button>

                            <button
                              type="button"
                              className="view-hospital-button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                handleSelectHospital(
                                  hospital
                                );
                              }}
                            >
                              View
                            </button>

                          </div>

                        </div>

                      </div>
                    )
                  }
                )}

              </div>
            )}

            {/* =============================================
                MAP
            ============================================= */}

            {view !== "list" && (
              <div className="hospital-map-container">

                <MapContainer
                  center={
                    userLocation ||
                    hospitals[0].position
                  }
                  zoom={
                    userLocation
                      ? 12
                      : 11
                  }
                  scrollWheelZoom={true}
                  className="hospital-map"
                >

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController
                    selectedHospital={
                      selectedHospital
                    }
                    userLocation={
                      userLocation
                    }
                  />

                  {/* ========================================
                      USER LOCATION
                  ======================================== */}

                  {userLocation && (
                    <Marker
                      position={
                        userLocation
                      }
                      icon={userIcon}
                    >
                      <Popup>
                        <strong>
                          Your location
                        </strong>

                        <br />

                        Nearby healthcare
                        facilities are
                        shown around you.
                      </Popup>
                    </Marker>
                  )}

                  {/* ========================================
                      PERSONALIZED HOSPITALS
                  ======================================== */}

                  {filteredHospitals.map(
                    (hospital) => (
                      <Marker
                        key={`hospital-${hospital.id}`}
                        position={
                          hospital.position
                        }
                        icon={
                          selectedHospital?.id ===
                          hospital.id
                            ? selectedHospitalIcon
                            : hospitalIcon
                        }
                        eventHandlers={{
                          click: () =>
                            handleSelectHospital(
                              hospital
                            ),
                        }}
                      >

                        <Popup>

                          <div className="hospital-popup">

                            <strong>
                              {hospital.name}
                            </strong>

                            <span>
                              {hospital.match}%
                              requirement
                              match
                            </span>

                            <span>
                              ⭐{" "}
                              {hospital.rating}
                            </span>

                            {hospital.distance !==
                              null && (
                              <span>
                                📍{" "}
                                {formatDistance(
                                  hospital.distance
                                )}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleSelectHospital(
                                  hospital
                                )
                              }
                            >
                              View hospital
                            </button>

                          </div>

                        </Popup>

                      </Marker>
                    )
                  )}

                  {/* ========================================
                      REAL NEARBY FACILITIES
                  ======================================== */}

                  {nearbyPlaces.map(
                    (place) => (
                      <Marker
                        key={`nearby-${place.id}`}
                        position={[
                          place.latitude,
                          place.longitude,
                        ]}
                        icon={
                          place.type ===
                          "Hospital"
                            ? nearbyHospitalIcon
                            : nearbyClinicIcon
                        }
                      >

                        <Popup>

                          <div className="nearby-popup">

                            <strong>
                              {place.name}
                            </strong>

                            <span className="nearby-popup-type">
                              {place.type}
                            </span>

                            <span>
                              📍{" "}
                              {formatDistance(
                                place.distance
                              )}
                            </span>

                            {place.address && (
                              <span>
                                {place.address}
                              </span>
                            )}

                            {place.phone && (
                              <span>
                                ☎{" "}
                                {place.phone}
                              </span>
                            )}

                            {place.openingHours && (
                              <span>
                                🕒{" "}
                                {
                                  place.openingHours
                                }
                              </span>
                            )}

                            {place.emergency && (
                              <span className="nearby-emergency">
                                Emergency services
                                mapped
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                selectNearbyPlace(
                                  place
                                )
                              }
                            >
                              View & route
                            </button>

                          </div>

                        </Popup>

                      </Marker>
                    )
                  )}

                  {/* ========================================
                      ROUTE
                  ======================================== */}

                  {route.length >
                    0 && (
                    <Polyline
                      positions={route}
                      pathOptions={{
                        color:
                          "#0e8f79",
                        weight: 6,
                        opacity: 0.85,
                      }}
                    />
                  )}

                </MapContainer>

                {/* ==========================================
                    MAP OVERLAY
                ========================================== */}

                <div className="map-overlay-card">

                  <div className="map-overlay-top">

                    <div>
                      <span>
                        MAP
                      </span>

                      <strong>
                        Healthcare near you
                      </strong>
                    </div>

                    <span className="live-map-badge">
                      ● LIVE
                    </span>

                  </div>

                  <p>
                    Showing personalized
                    hospitals and real
                    nearby healthcare
                    facilities.
                  </p>

                </div>

                {/* ==========================================
                    ROUTE CARD
                ========================================== */}

                {selectedHospital && (
                  <div className="route-card">

                    <div className="route-card-top">

                      <div>
                        <span className="route-label">
                          ROUTE TO
                        </span>

                        <strong>
                          {
                            selectedHospital.name
                          }
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHospital(
                            null
                          );
                          setRoute([]);
                          setRouteInfo(null);
                        }}
                      >
                        ×
                      </button>

                    </div>

                    {routeLoading && (
                      <div className="route-loading">
                        Calculating driving
                        route...
                      </div>
                    )}

                    {!routeLoading &&
                      routeError && (
                        <div className="route-error">
                          {routeError}
                        </div>
                      )}

                    {!routeLoading &&
                      !routeError &&
                      routeInfo && (
                        <>
                          <div className="route-stats">

                            <div>
                              <strong>
                                {routeInfo.distance.toFixed(
                                  1
                                )}{" "}
                                km
                              </strong>

                              <span>
                                road distance
                              </span>
                            </div>

                            <div>
                              <strong>
                                {formatDuration(
                                  routeInfo.duration
                                )}
                              </strong>

                              <span>
                                estimated drive
                              </span>
                            </div>

                          </div>

                          <button
                            type="button"
                            className="navigation-button"
                            onClick={
                              startNavigation
                            }
                          >
                            ↗ Start Navigation
                          </button>
                        </>
                      )}

                  </div>
                )}

              </div>
            )}

          </div>

        </main>

      </div>

      {/* ===================================================
          COMPARE BAR
      =================================================== */}

      {compareList.length > 0 && (
        <div className="compare-bar">

          <div>
            <strong>
              {compareList.length}
            </strong>{" "}
            hospitals selected for
            comparison
          </div>

          <div className="compare-bar-actions">

            <button
              type="button"
              onClick={() =>
                setCompareList([])
              }
            >
              Clear
            </button>

            <button
              type="button"
              className="compare-primary-button"
              onClick={() =>
                alert(
                  "Comparison screen will be added next."
                )
              }
            >
              Compare hospitals
            </button>

          </div>

        </div>
      )}

    </div>
  );
}