const GEOAPIFY_API_URL = "https://api.geoapify.com/v2/places";
const GEOAPIFY_GEOCODE_URL = "https://api.geoapify.com/v1/geocode/reverse";
const GEOAPIFY_SEARCH_GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";

const getApiKey = () => {
  const key = import.meta.env.VITE_GEOAPIFY_API_KEY;

  if (!key) {
    throw new Error(
      "Geoapify API key is missing. Check your .env.local file."
    );
  }

  return key;
};

const HEALTHCARE_CATEGORIES = [
  "healthcare.hospital",
  "healthcare.clinic_or_praxis",
  "healthcare.dentist",
];

export async function searchNearbyHealthcare({
  latitude,
  longitude,
  radius = 5000,
  limit = 20,
  signal,
}) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid location coordinates.");
  }

  const params = new URLSearchParams({
    categories: HEALTHCARE_CATEGORIES.join(","),
    filter: `circle:${longitude},${latitude},${radius * 1000}`,
    bias: `proximity:${longitude},${latitude}`,
    limit: String(Math.min(limit, 100)),
    apiKey: getApiKey(),
  });

  const response = await fetch(
    `${GEOAPIFY_API_URL}?${params.toString()}`,
    {
      signal: signal || AbortSignal.timeout(12000),
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `Geoapify Places request failed (${response.status}): ${message}`
    );
  }

  const data = await response.json();

  return data;
}

export async function reverseGeocodeLocation({ latitude, longitude }) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    apiKey: getApiKey(),
  });
  const response = await fetch(`${GEOAPIFY_GEOCODE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Location lookup failed (${response.status}).`);
  }
  const data = await response.json();
  return data.features?.[0]?.properties || {};
}

export async function geocodeLocation(query) {
  const normalizedQuery = typeof query === "string" ? query.trim() : "";
  if (!normalizedQuery) {
    throw new Error("Enter a city, address, or postal code.");
  }

  const params = new URLSearchParams({
    text: normalizedQuery,
    limit: "1",
    format: "geojson",
    apiKey: getApiKey(),
  });
  const response = await fetch(`${GEOAPIFY_SEARCH_GEOCODE_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Location search failed (${response.status}).`);
  }

  const data = await response.json();
  const location = data.features?.[0]?.properties;
  if (!Number.isFinite(location?.lat) || !Number.isFinite(location?.lon)) {
    throw new Error("We couldn't find that location. Try a nearby city or a more specific address.");
  }

  return location;
}