import React from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEventsGeoJSON } from "../hooks/useEvents";
import type { Feature } from "geojson";
import type { Layer, Path } from "leaflet";
import "leaflet/dist/leaflet.css";

const typeColors: Record<string, string> = {
  CONSTRUCTION: "#f59e0b",
  REGULATION: "#ef4444",
  EVENT: "#3b82f6",
  INCIDENT: "#8b5cf6",
  RESTRICTION: "#6b7280",
};

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useEventsGeoJSON();

  const onEachFeature = (feature: Feature, layer: Layer) => {
    if (feature.properties) {
      const color = typeColors[feature.properties.eventType] || "#000";
      (layer as Path).setStyle({
        color,
        weight: 3,
        opacity: 0.8,
      });

      const popup = document.createElement("div");
      popup.className = "p-2";

      const eventType = document.createElement("strong");
      eventType.textContent = String(feature.properties.eventType ?? "");
      popup.append(eventType, document.createElement("br"));

      const subtype = document.createElement("span");
      subtype.className = "text-sm";
      subtype.textContent = String(feature.properties.subtype ?? "");
      popup.append(subtype, document.createElement("br"));

      const contractor = feature.properties.details?.contractor;
      if (contractor) {
        const contractorLabel = document.createElement("span");
        contractorLabel.className = "text-xs";
        contractorLabel.textContent = String(contractor);
        popup.append(contractorLabel);
      }

      layer.bindPopup(popup);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-cityflow-600" />
          <p className="mt-4 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-red-600">
          <p>Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="absolute left-4 top-4 z-10 rounded-lg bg-white p-4 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800">Tableau de bord</h2>
        <p className="text-sm text-gray-600">
          {data?.features?.length || 0} événements actifs
        </p>
      </div>

      <MapContainer center={[46.8, -71.2]} zoom={13} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data && <GeoJSON data={data} onEachFeature={onEachFeature} />}
      </MapContainer>
    </div>
  );
};

export default Dashboard;
