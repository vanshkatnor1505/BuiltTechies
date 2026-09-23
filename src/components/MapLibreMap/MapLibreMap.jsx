import { useEffect, useRef, useState } from "react";
import {
  Map,
  NavigationControl,
  Marker,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_CENTER = [76.7794, 30.7333];

export default function MapLibreMap({
  userLocation,
  facilities = [],
  selectedFacility,
  onSelectFacility,
  route = null,
  mapCenter = null,
  showUserLocation = true,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const initialMapCenterRef = useRef(mapCenter);
  const initialUserLocationRef = useRef(userLocation);
  const [mapReady, setMapReady] = useState(false);

  /*
   * ---------------------------------------------------------
   * CREATE MAP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    console.log("Geoapify key exists:", Boolean(apiKey));

    if (!apiKey) {
      console.error("VITE_GEOAPIFY_API_KEY is missing.");
      return;
    }

    /*
     * We intentionally use Geoapify RASTER tiles here.
     *
     * This avoids the vector style.json rendering path.
     */
    const rasterTiles =
      `https://maps.geoapify.com/v1/tile/osm-bright/` +
      `{z}/{x}/{y}.png?apiKey=${apiKey}`;

    const initialCenter = initialMapCenterRef.current || (initialUserLocationRef.current
      ? [initialUserLocationRef.current.lon, initialUserLocationRef.current.lat]
      : DEFAULT_CENTER);

    console.log("Creating MapLibre raster map...");
    console.log("Initial center:", initialCenter);

    const map = new Map({
      container: mapContainer.current,

      center: initialCenter,

      zoom: initialMapCenterRef.current
        ? 5
        : initialUserLocationRef.current
          ? 13
          : 10,

      attributionControl: true,

      style: {
        version: 8,

        sources: {
          "geoapify-raster": {
            type: "raster",
            tiles: [rasterTiles],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 20,
          },
        },

        layers: [
          {
            id: "geoapify-raster-layer",
            type: "raster",
            source: "geoapify-raster",

            paint: {
              "raster-opacity": 1,
              "raster-fade-duration": 0,
            },
          },
        ],
      },
    });

    map.addControl(
      new NavigationControl(),
      "top-right"
    );

    map.on("load", () => {
      console.log("SUCCESS: Raster map loaded.");

      setMapReady(true);
      map.resize();
    });

    map.on("error", (event) => {
      console.error("MAP ERROR:", event);

      if (event?.error) {
        console.error(
          "Map error details:",
          event.error
        );
      }
    });

    map.on("idle", () => {
      console.log("Map is idle and rendered.");
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(mapContainer.current);

    return () => {
      resizeObserver.disconnect();

      markersRef.current.forEach((marker) => {
        marker.remove();
      });

      markersRef.current = [];

      userMarkerRef.current?.remove();
      userMarkerRef.current = null;

      map.remove();

      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * UPDATE USER LOCATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady || !userLocation || mapCenter) return;

    const center = [
      Number(userLocation.lon),
      Number(userLocation.lat),
    ];

    if (!center.every(Number.isFinite)) return;

    map.flyTo({
      center,
      zoom: 13,
      essential: true,
    });
  }, [mapCenter, mapReady, userLocation]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady || !Array.isArray(mapCenter)) return;

    const nationwideFacilities = facilities.filter(
      (facility) => facility.nationwide,
    );

    if (nationwideFacilities.length > 0) {
      const coordinates = nationwideFacilities
        .map((facility) => [Number(facility.lon), Number(facility.lat)])
        .filter(([longitude, latitude]) =>
          Number.isFinite(longitude) && Number.isFinite(latitude),
        );

      if (coordinates.length > 0) {
        const longitudes = coordinates.map(([longitude]) => longitude);
        const latitudes = coordinates.map(([, latitude]) => latitude);

        const bounds = [
          [Math.min(...longitudes), Math.min(...latitudes)],
          [Math.max(...longitudes), Math.max(...latitudes)],
        ];

        map.resize();
        map.fitBounds(bounds, {
          padding: { top: 120, right: 80, bottom: 120, left: 80 },
          maxZoom: 5,
          duration: 700,
        });

        map.once("idle", () => {
          map.fitBounds(bounds, {
            padding: { top: 120, right: 80, bottom: 120, left: 80 },
            maxZoom: 5,
            duration: 0,
          });
        });
        return;
      }
    }

    const center = mapCenter.map(Number);

    if (!center.every(Number.isFinite)) return;

    map.flyTo({
      center,
      zoom: 5,
      essential: true,
    });
  }, [facilities, mapCenter, mapReady]);

  /*
   * ---------------------------------------------------------
   * FACILITY MARKERS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    // Remove old markers
    markersRef.current.forEach((marker) => {
      marker.remove();
    });

    markersRef.current = [];

    facilities.forEach((facility) => {
      const longitude = Number(facility.lon);
      const latitude = Number(facility.lat);

      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return;
      }

      const markerElement =
        document.createElement("div");

      markerElement.style.width = "30px";
      markerElement.style.height = "30px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.background = facility.nationwide
        ? "#0f766e"
        : "#dc2626";
      markerElement.style.zIndex = facility.nationwide ? "20" : "10";
      markerElement.style.border =
        "3px solid white";
      markerElement.style.boxShadow =
        "0 3px 10px rgba(0, 0, 0, 0.35)";
      markerElement.style.cursor = "pointer";

      markerElement.textContent = "H";
      markerElement.style.display = "grid";
      markerElement.style.placeItems = "center";
      markerElement.style.color = "white";
      markerElement.style.fontSize = "14px";
      markerElement.style.fontWeight = "900";
      markerElement.style.fontFamily = "Arial, sans-serif";

      markerElement.title =
        facility.nationwide
          ? `${facility.name || "Hospital"} - specialist match`
          : facility.name || "Healthcare facility";

      markerElement.addEventListener(
        "click",
        () => {
          if (onSelectFacility) {
            onSelectFacility(facility);
          }
        }
      );

      const marker = new Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => {
        marker.remove();
      });

      markersRef.current = [];
    };
  }, [facilities, mapReady, onSelectFacility]);

  useEffect(() => {
    const map = mapRef.current;
    const sourceId = "route-source";
    const layerId = "route-line";

    if (!map || !mapReady) return;

    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    if (!Array.isArray(route) || route.length < 2) return;

    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: route,
        },
      },
    });

    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#2563eb",
        "line-width": 5,
        "line-opacity": 0.82,
      },
    });

    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }

      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [mapReady, route]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    if (!showUserLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (!userLocation) return;

    const longitude = Number(userLocation.lon);
    const latitude = Number(userLocation.lat);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return;
    }

    const markerElement = document.createElement("div");
    markerElement.style.width = "18px";
    markerElement.style.height = "18px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.background = "#2563eb";
    markerElement.style.border = "4px solid white";
    markerElement.style.boxShadow = "0 0 0 6px rgba(37, 99, 235, 0.25)";
    markerElement.title = "Your current location";

    const marker = new Marker({
      element: markerElement,
      anchor: "center",
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    userMarkerRef.current = marker;

    return () => {
      marker.remove();
      userMarkerRef.current = null;
    };
  }, [mapReady, showUserLocation, userLocation]);

  /*
   * ---------------------------------------------------------
   * SELECTED FACILITY
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady || !selectedFacility) return;

    const longitude = Number(selectedFacility.lon);
    const latitude = Number(selectedFacility.lat);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return;
    }

    map.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      essential: true,
    });
  }, [mapReady, selectedFacility]);

  /*
   * ---------------------------------------------------------
   * MAP CONTAINER
   * ---------------------------------------------------------
   */

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}