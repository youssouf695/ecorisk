'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import dynamic from 'next/dynamic';
import { Shield, MapPin, AlertTriangle, CheckCircle2, RefreshCw, BarChart3, Layers, User } from 'lucide-react';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('Tous');
  const [leafletReady, setLeafletReady] = useState(false);

  const ngaoundereCenter: [number, number] = [7.3236, 13.5831];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setLeafletReady(true);
    }
    fetchReports();
  }, []);

  // 1. REQUÊTE SUPABASE MODIFIÉE AVEC LA JOINTURE 'users'
  const fetchReports = async () => {
    setLoading(true);
    try {
      // 1. On récupère d'abord tous les rapports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // 2. On récupère tous les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, quartier');

      if (usersError) throw usersError;

      // 3. On fusionne les données à la main en faisant correspondre les IDs
      const joinedData = (reportsData || []).map(report => {
        const author = (usersData || []).find(user => user.id === report.user_id);
        return {
          ...report,
          users: author ? { name: author.name, quartier: author.quartier } : null
        };
      });

      setReports(joinedData);
    } catch (err) {
      console.error(err);
      alert("Erreur de chargement des données municipales");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ severity: newStatus })
        .eq('id', reportId);

      if (error) throw error;
      setReports(reports.map(r => r.id === reportId ? { ...r, severity: newStatus } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = useMemo(() => {
    return filterSeverity === 'Tous' 
      ? reports 
      : reports.filter(r => r.severity === filterSeverity);
  }, [reports, filterSeverity]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      urgents: reports.filter(r => r.severity === 'Élevée' && !r.is_duplicate).length,
      doublons: reports.filter(r => r.is_duplicate).length,
      resolus: reports.filter(r => r.severity === 'Résolu').length,
    };
  }, [reports]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* BANDEAU EN-TÊTE */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-950">Hôtel de Ville de Ngaoundéré</h1>
              <p className="text-xs text-emerald-600 font-bold tracking-wide">EcoReport AI • Centre de Gestion Urbaine</p>
            </div>
          </div>
          
          <button 
            onClick={fetchReports}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black py-3 px-5 rounded-xl transition shadow-sm self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Mettre à jour la grille
          </button>
        </div>

        {/* COMPTEURS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total incidents</p>
              <h3 className="text-xl font-black text-slate-950 mt-0.5">{stats.total}</h3>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-300" />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-black text-red-500 tracking-wider">Urgences actives</p>
              <h3 className="text-xl font-black text-red-600 mt-0.5">{stats.urgents}</h3>
            </div>
            <AlertTriangle className="w-5 h-5 text-red-200" />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-black text-amber-600 tracking-wider">Doublons filtrés</p>
              <h3 className="text-xl font-black text-amber-600 mt-0.5">{stats.doublons}</h3>
            </div>
            <Layers className="w-5 h-5 text-amber-200" />
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Cas résolus</p>
              <h3 className="text-xl font-black text-emerald-600 mt-0.5">{stats.resolus}</h3>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          </div>
        </div>

        {/* SECTION DOUBLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CARTE INTERACTIVE */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">Cartographie en temps réel</span>
              </div>
            </div>

            <div className="w-full flex-1 bg-slate-100 relative">
              {leafletReady ? (
                <MapContainer center={ngaoundereCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredReports.map((report) => (
                    report.latitude && report.longitude && (
                      <Marker key={report.id} position={[report.latitude, report.longitude]}>
                        <Popup>
                          <div className="p-1 font-sans space-y-1">
                            <span className="text-[9px] font-black uppercase text-emerald-600 block">{report.category}</span>
                            <strong className="text-xs text-slate-900 block">{report.title}</strong>
                            {/* Signature de l'auteur dans le Pop-up de la carte */}
                            <div className="text-[10px] text-slate-600 bg-slate-50 p-1 rounded border border-slate-100 flex items-center gap-1 mt-1">
                              <span>👤</span>
                              <span>Par : <strong>{report.users?.name || 'Anonyme'}</strong> ({report.users?.quartier || 'N/A'})</span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-400">
                  Initialisation du module cartographique...
                </div>
              )}
            </div>
          </div>

          {/* FIL DES INCIDENTS AVEC AUTEUR */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col h-[500px]">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">Registre d'incidents</span>
              <select 
                value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-[11px] font-black rounded-lg py-1.5 px-3 focus:outline-none focus:border-emerald-600 text-slate-700 cursor-pointer"
              >
                <option value="Tous">Toutes les catégories</option>
                <option value="Élevée">Urgence Élevée</option>
                <option value="Moyenne">Gravité Moyenne</option>
                <option value="Faible">Faible / Standard</option>
                <option value="Résolu">Résolus</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="text-center py-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tri des requêtes citoyennes...</div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 font-medium">Aucun incident détecté.</div>
              ) : (
                filteredReports.map((report) => (
                  <div 
                    key={report.id} 
                    className={`p-3 rounded-xl border transition flex flex-col gap-2 bg-slate-50/50 ${
                      report.is_duplicate ? 'border-amber-100 opacity-60 bg-amber-50/20' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-slate-600">
                        {report.category}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {report.is_duplicate && (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Doublon AI
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          report.severity === 'Élevée' ? 'bg-red-50 text-red-600' :
                          report.severity === 'Moyenne' ? 'bg-amber-50 text-amber-700' :
                          report.severity === 'Résolu' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {report.severity || 'Faible'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{report.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{report.description || "Aucun complément."}</p>
                    </div>

                    {/* 👤 BADGE DE L'AUTEUR DU SIGNALEMENT */}
                    <div className="bg-white border border-slate-100 rounded-lg p-2 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Par : <strong className="text-slate-900">{report.users?.name || 'Citoyen Anonyme'}</strong></span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                        📍 {report.users?.quartier || 'Ngaoundéré'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 mt-0.5">
                      <div className="flex items-center gap-1 text-[9px] font-mono font-medium text-slate-400">
                        Lat: {report.latitude?.toFixed(3) || 'N/A'} | Lon: {report.longitude?.toFixed(3) || 'N/A'}
                      </div>
                      
                      {report.severity !== 'Résolu' && (
                        <button
                          onClick={() => updateStatus(report.id, 'Résolu')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider rounded-md transition"
                        >
                          Fermer le cas
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}