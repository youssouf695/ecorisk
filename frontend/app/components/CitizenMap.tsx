// components/CitizenMap.tsx
'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet par défaut avec Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Composant pour recentrer dynamiquement la carte sur la position du citoyen
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

interface CitizenMapProps {
  reports: any[];
  userLocation: { lat: number; lng: number } | null;
}

export default function CitizenMap({ reports, userLocation }: CitizenMapProps) {
  // Ngaoundéré par défaut si pas de localisation
  const defaultCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [7.3230, 13.5650];

  return (
    <div className="w-full h-[300px] rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-10">
      <MapContainer center={defaultCenter} zoom={14} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={defaultCenter} />

        {/* Marqueur de la position actuelle du citoyen */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
            <Popup><span className="font-bold text-emerald-600">Vous êtes ici</span></Popup>
          </Marker>
        )}

        {/* Affichage de tous les dépôts sauvages de la BD */}
        {reports.map((report) => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h4 className="font-bold text-slate-900 text-xs">{report.title}</h4>
                <p className="text-[10px] text-slate-500 capitalize">Catégorie : {report.category}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                  report.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {report.severity}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}