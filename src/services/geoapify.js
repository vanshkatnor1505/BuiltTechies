const GEOAPIFY_API_URL = "https://api.geoapify.com/v2/places";

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
      signal,
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