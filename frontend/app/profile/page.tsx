'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { 
  User, 
  Award, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  LogOut, 
  ChevronRight,
  Leaf
} from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    
    // 🔑 Récupération de l'ID de session locale
    const currentUserId = localStorage.getItem('ecoreport_user_id');

    if (!currentUserId) {
      router.push('/login');
      return;
    }
    
    // 1. Récupérer les infos en temps réel de l'utilisateur (points, nom, quartier)
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single();

    // 2. Récupérer les statistiques de ses signalements uniques
    const { data: reportsData } = await supabase
      .from('reports')
      .select('status, is_resolved')
      .eq('user_id', currentUserId);

    if (userData) {
      setProfile(userData);
    }

    if (reportsData) {
      const total = reportsData.length;
      const resolved = reportsData.filter(r => r.status === 'resolved' || r.is_resolved === true).length;
      setStats({ total, resolved });
    }

    setLoading(false);
  };

  // 🔑 Fonction pour vider la session locale et déconnecter proprement
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="flex items-center gap-4 py-4">
          <div className="w-16 h-16 bg-slate-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-24 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // Calcul du niveau basé sur les points (Exemple : 1 niveau tous les 100 points)
  const userPoints = profile?.points || 0;
  const currentLevel = Math.floor(userPoints / 100) + 1;
  const pointsToNextLevel = 100 - (userPoints % 100);

  return (
    <div className="p-4 space-y-5">
      
      {/* EN-TÊTE PROFIL */}
      <div className="flex items-center gap-4 py-2">
        <div className="w-16 h-16 rounded-full bg-emerald-600 border-4 border-white shadow-md flex items-center justify-center text-white">
          <User className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              {profile?.name || 'Citoyen ÉcoReport'}
            </h2>
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
            <MapPin className="w-3 h-3" />
            <span>{profile?.quartier || 'Ngaoundéré'}, Cameroun</span>
          </div>
        </div>
      </div>

      {/* COMPTEUR DE JAUGE DE NIVEAU (GAMIFICATION HACKATHON) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Leaf className="w-24 h-24 text-white" />
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Statut Éco-Citoyen</p>
            <h3 className="text-2xl font-black tracking-tight mt-0.5">Niveau {currentLevel}</h3>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">{userPoints} PTS</span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${userPoints % 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-right font-medium">
            Plus que <span className="text-white font-bold">{pointsToNextLevel} pts</span> avant le prochain niveau
          </p>
        </div>
      </div>

      {/* GRILLE DE STATISTIQUES DES IMPACTS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Signalements</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-400 font-bold">envoyés</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Impact Réel</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{stats.resolved}</span>
            <span className="text-xs text-slate-400 font-bold">nettoyés</span>
          </div>
        </div>
      </div>

      {/* OPTIONS DE L'APPLICATION / MENU DE PARAMÈTRES */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Général</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          <button type="button" className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/50 transition">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Classement de la commune</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* 🔑 Bouton branché avec handleLogout */}
          <button 
            type="button" 
            onClick={handleLogout}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-red-50/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-red-600">Se déconnecter</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* SECTION PIED DE PAGE HACKATHON INFO */}
      <div className="text-center pt-2">
        <p className="text-[9px] font-mono font-semibold tracking-wider text-slate-300 uppercase">
          EcoReport AI v1.0.0 • Codons pour la Planète
        </p>
      </div>

    </div>
  );
}