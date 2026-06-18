// components/IncidentForm.tsx
'use client';
import { useState } from 'react';
import { supabase } from '../supabaseClient';

interface IncidentFormProps {
  userId: string;
  onSuccess: () => void;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function IncidentForm({ userId, onSuccess, onLocationChange }: IncidentFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('déchets');
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');
  const [coords, setCoords] = useState({ lat: 4.051, lng: 9.767 }); // Douala par défaut

  const handleGeolocation = () => {
    setGeoStatus('Recherche...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          onLocationChange(latitude, longitude);
          setGeoStatus('GPS Actif');
        },
        () => { setGeoStatus('Erreur GPS (Default)'); }
      );
    } else {
      setGeoStatus('Non supporté');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    const { data, error } = await supabase.from('reports').insert([
      {
        user_id: userId,
        title,
        category,
        severity,
        latitude: coords.lat,
        longitude: coords.lng,
        description: "Signalement citoyen via application mobile PWA."
      }
    ]).select();

    setLoading(false);

    if (error) {
      alert("Erreur réseau");
      return;
    }

    const reportResult = data[0];
    if (reportResult.is_duplicate) {
      alert("Zone déjà répertoriée. Votre signalement appuie l'alerte communautaire (0 point).");
    } else {
      alert(`Signalement enregistré. +${reportResult.points_earned} Points Eco-Citoyen.`);
    }

    setTitle('');
    onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-base font-bold mb-4 text-slate-800 uppercase tracking-wider">
        Nouveau signalement
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Anomalie constatée</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Dépôt sauvage d'ordures" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-emerald-500" required />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-emerald-500 bg-white">
            <option value="déchets">Gestion des Déchets</option>
            <option value="caniveaux bouchés">Caniveau obstrué</option>
            <option value="pollution">Pollution / Odeurs</option>
            <option value="infrastructure dangereuse">Danger public</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Gravité</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-emerald-500 bg-white">
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Critique</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Position</label>
            <button type="button" onClick={handleGeolocation} className="w-full border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg p-3 text-xs font-bold hover:bg-emerald-100 transition truncate">
              {geoStatus || "Activer le GPS"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-lg shadow-sm transition disabled:opacity-50 text-sm uppercase tracking-wider">
          {loading ? "Envoi..." : "Envoyer le signalement"}
        </button>
      </form>
    </div>
  );
}