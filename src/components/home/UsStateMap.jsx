import React, { useState, useEffect } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MessageCircle } from "lucide-react";

// States marked red (not served) — independent state-based marketplaces (except Georgia) + specific additions
const RED_STATES = new Set([
  // Specifically requested
  "Maryland", "New Jersey", "Virginia", "Nevada", "California", "Idaho", "Illinois",
  // All state-based marketplace (SBM) states except Georgia
  "Colorado", "Connecticut", "Kentucky", "Maine", "Massachusetts", "Minnesota",
  "New Mexico", "New York", "Pennsylvania", "Rhode Island", "Vermont", "Washington",
  "West Virginia",
]);

const GEO_URL =
  "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

const copy = {
  en: {
    title: "Can I get coverage in my state?",
    subtitle: "Click your state to find out.",
    available: "Coverage Available",
    unavailable: "Not Available",
    coveredMsg: "✅ We can help you find coverage in",
    notCoveredMsg: "❌ We don't currently serve",
    notCoveredSub: "Contact us to learn more.",
    cta: "Get My Free Quote",
    alaskaHawaii: "Alaska & Hawaii residents: contact us directly.",
  },
  es: {
    title: "¿Puedo obtener cobertura en mi estado?",
    subtitle: "Haz clic en tu estado para obtener información.",
    available: "Cobertura disponible",
    unavailable: "No disponible",
    coveredMsg: "✅ Podemos ayudarte en",
    notCoveredMsg: "❌ No operamos actualmente en",
    notCoveredSub: "Contáctanos para más información.",
    cta: "Obtener cotización gratis",
    alaskaHawaii: "Residentes de Alaska y Hawái: contáctenos directamente.",
  },
};

export default function UsStateMap({ lang = "en", onGetQuote }) {
  const [geoData, setGeoData] = useState(null);
  const [selected, setSelected] = useState(null);
  const c = copy[lang] || copy.en;

  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  const isCovered = selected && !RED_STATES.has(selected);

  const styleFeature = (feature) => ({
    fillColor: RED_STATES.has(feature.properties.name) ? "#ef4444" : "#22c55e",
    weight: 1.5,
    color: "#fff",
    fillOpacity: 0.75,
  });

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.name;
    layer.on({
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.95, weight: 2.5 }),
      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.75, weight: 1.5 }),
      click: () => setSelected(name),
    });
  };

  return (
    <section className="py-12 px-4 max-w-5xl mx-auto" style={{ position: "relative", zIndex: 0, isolation: "isolate" }}>
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5f] text-center mb-2">
        {c.title}
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">{c.subtitle}</p>

      {/* Map */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-200 shadow-md"
        style={{ height: "420px", background: "#dbeafe", position: "relative", zIndex: 0, isolation: "isolate" }}
      >
        {geoData ? (
          <MapContainer
            bounds={[[24.5, -125], [49.5, -66]]}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            attributionControl={false}
            style={{ height: "100%", width: "100%", background: "#dbeafe" }}
          >
            <GeoJSON
              key="us-states"
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading map…
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-sm text-gray-600 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-500 inline-block" />
          {c.available}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-500 inline-block" />
          {c.unavailable}
        </div>
        <span className="text-gray-400 text-xs">· {c.alaskaHawaii}</span>
      </div>

      {/* State detail card */}
      {selected && (
        <div
          className={`mt-5 rounded-2xl p-6 border text-center transition-all ${
            isCovered
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p className="font-bold text-xl text-[#1e3a5f] mb-1">{selected}</p>
          {isCovered ? (
            <>
              <p className="text-green-700 text-sm mb-4">
                {c.coveredMsg} <strong>{selected}</strong>!
              </p>
              {onGetQuote && (
                <button
                  onClick={onGetQuote}
                  className="bg-[#1e3a5f] text-white font-bold rounded-full px-7 py-3 text-sm hover:bg-[#162d4a] transition-colors"
                >
                  {c.cta}
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-red-700 text-sm">
                {c.notCoveredMsg} <strong>{selected}</strong>. {c.notCoveredSub}
              </p>
              <a
                href="https://wa.me/18774582557"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 bg-[#22c55e] text-white font-semibold rounded-full px-6 py-2 text-sm hover:bg-[#16a34a] transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </>
          )}
        </div>
      )}
    </section>
  );
}