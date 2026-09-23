import { useState } from "react";
import { searchNearbyHealthcare } from "./geoapify";

export default function GeoapifyTest() {
  const [status, setStatus] = useState("Not tested");
  const [results, setResults] = useState([]);

  async function testSearch() {
    try {
      setStatus("Searching...");

      const data = await searchNearbyHealthcare({
        latitude: 30.7333,
        longitude: 76.7794,
        radius: 5,
        limit: 10,
      });

      setResults(data.features || []);
      setStatus(`Found ${data.features?.length || 0} places`);
    } catch (error) {
      console.error(error);
      setStatus(error.message);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Geoapify Test</h2>

      <button onClick={testSearch}>
        Test Hospital Search
      </button>

      <p>{status}</p>

      <pre>
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}