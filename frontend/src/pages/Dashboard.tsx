import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { getEventsGeoJSON } from '../services/eventService';
import type { Feature } from 'geojson';
import type { Layer, Path } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const typeColors: Record<string, string> = {
  CONSTRUCTION: '#f59e0b',
  REGULATION: '#ef4444',
  EVENT: '#3b82f6',
  INCIDENT: '#8b5cf6',
  RESTRICTION: '#6b7280'
};

const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events-geojson'],
    queryFn: () => getEventsGeoJSON({ status: 'ACTIVE,PLANNED' })
  });

  const onEachFeature = (feature: Feature, layer: Layer) => {
    if (feature.properties) {
      const color = typeColors[feature.properties.eventType] || '#000';
      (layer as Path).setStyle({
        color: color,
        weight: 3,
        opacity: 0.8
      });
      
      layer.bindPopup(`
        <div class="p-2">
          <strong>${feature.properties.eventType}</strong><br/>
          <span class="text-sm">${feature.properties.subtype}</span><br/>
          ${feature.properties.details?.contractor ? `<span class="text-xs">${feature.properties.details.contractor}</span>` : ''}
        </div>
      `);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cityflow-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>Erreur lors du chargement des données</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800">Tableau de bord</h2>
        <p className="text-sm text-gray-600">
          {data?.features?.length || 0} événements actifs
        </p>
      </div>
      
      <MapContainer
        center={[46.8, -71.2]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data && (
          <GeoJSON
            data={data}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Dashboard;
