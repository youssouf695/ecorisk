'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
// Utilisation des icônes Lucide clean
import { MapPin, PlusCircle, User } from 'lucide-react';

export default function CitoyenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userPoints, setUserPoints] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const mockUserId = "11111111-1111-1111-1111-111111111111";

  useEffect(() => {
    fetchUserPoints();
  }, [pathname]);

  const fetchUserPoints = async () => {
    const { data } = await supabase.from('users').select('points').eq('id', mockUserId).single();
    if (data) setUserPoints(data.points);
  };

  // Liens de navigation pour la barre basse
  const navItems = [
    { label: 'Mes alertes', path: '/dashboard-citoyen', icon: MapPin },
    { label: 'Signaler', path: '/report', icon: PlusCircle },
    { label: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Frame aspect Mobile unique */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-50 shadow-2xl relative border-x border-slate-200/50 pb-20">
        
        {/* Header commun injecté en haut */}
        <Header points={userPoints} />

        {/* Contenu propre à la page (report ou profile) */}
        <div className="flex-1">
          {children}
        </div>

        {/* 📱 MENU MOBILE FIXE EN BAS DE L'ÉCRAN */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around px-4 z-50 rounded-t-xl shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center w-20 h-full transition-all gap-1 ${
                  isActive ? 'text-emerald-600 scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight uppercase font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}