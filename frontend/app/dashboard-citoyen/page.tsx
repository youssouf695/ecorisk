'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Trash2, 
  Construction, 
  Milk, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Filter
} from 'lucide-react';

export default function MesAlertesPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, resolved

  // Même dictionnaire d'icônes que la page report pour la cohérence visuelle
  const categoriesConfig: { [key: string]: { label: string; icon: any } } = {
    'déchets': { label: 'Ordures', icon: Trash2 },
    'gravats': { label: 'Gravats', icon: Construction },
    'plastique': { label: 'Plastique', icon: Milk },
    'encombrants': { label: 'Objets', icon: Package },
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [reports, filterStatus]);

  const fetchMyReports = async () => {
    setLoading(true);

    // 🔑 Récupération de l'ID utilisateur local
    const currentUserId = localStorage.getItem('ecoreport_user_id');

    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', currentUserId) // 👈 Filtrage sécurisé par l'utilisateur connecté
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    if (filterStatus === 'all') {
      setFilteredReports(reports);
    } else if (filterStatus === 'resolved') {
      setFilteredReports(reports.filter(r => r.status === 'resolved' || r.is_resolved === true));
    } else {
      setFilteredReports(reports.filter(r => r.status !== 'resolved' && !r.is_resolved));
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* EN-TÊTE DE PAGE */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900">Suivi du Terrain</h2>
        <p className="text-xs text-slate-400">Historique et statut de vos signalements</p>
      </div>

      {/* FILTRES DE STATUT DE SÉLECTION RAPIDE */}
      <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition ${
            filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
          }`}
        >
          Tous ({reports.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('pending')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition ${
            filterStatus === 'pending' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500'
          }`}
        >
          En cours
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('resolved')}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition ${
            filterStatus === 'resolved' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500'
          }`}
        >
          Traités
        </button>
      </div>

      {/* LISTE DES ALERTES FLUIDES */}
      {loading ? (
        <div className="space-y-3 pt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 w-full bg-slate-200/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/60 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
            <Filter className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">Aucun signalement trouvé</p>
          <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">Les alertes que vous envoyez sur le terrain s'afficheront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const config = categoriesConfig[report.category] || { label: 'Autre', icon: MapPin };
            const IconComponent = config.icon;
            
            const isDone = report.status === 'resolved' || report.is_resolved;

            return (
              <div key={report.id} className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs space-y-3 transition active:scale-[0.99]">
                
                {/* LIGNE SUPÉRIEURE : CATÉGORIE ET STATUT CHIP */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                      <IconComponent className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{config.label}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {new Date(report.created_at).toLocaleDateString('fr-FR')} à {new Date(report.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  {/* BADGE DE FLUX TRAVAIL DE LA MAIRIE */}
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isDone 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {isDone ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isDone ? 'Collecté' : 'En attente'}
                  </span>
                </div>

                {/* MILIEU : PHOTO INTERNE SI EXISTANTE + CONTENU */}
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{report.title}</p>
                  
                  {report.image_data && (
                    <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                      <img src={report.image_data} alt="Preuve" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* BAS : GRAVITÉ ET COORDONNÉES */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3 h-3 text-slate-300" />
                    <span>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                  </div>

                  <span className={`font-bold uppercase tracking-widest text-[9px] ${
                    report.severity === 'high' ? 'text-red-500' :
                    report.severity === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    Urgence {report.severity === 'high' ? 'Haute' : report.severity === 'medium' ? 'Moyenne' : 'Basse'}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}