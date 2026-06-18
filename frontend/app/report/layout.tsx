'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import { MapPin, PlusCircle, User } from 'lucide-react';

export default function CitoyenLayout({ children }: { children: React.ReactNode }) {
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkLocalSession();
  }, [pathname]);

  const checkLocalSession = async () => {
    // 1. Lire l'ID stocké localement dans le téléphone
    const localUserId = localStorage.getItem('ecoreport_user_id');

    // Éviter une boucle infinie si on est déjà sur la page login
    if (!localUserId && pathname !== '/login') {
      router.push('/login');
      return;
    }

    if (localUserId) {
      // 2. Récupérer les points en temps réel de ce citoyen depuis Supabase
      const { data } = await supabase
        .from('users')
        .select('points')
        .eq('id', localUserId)
        .single();
        
      if (data) setUserPoints(data.points);
    }
    setLoading(false);
  };

  const navItems = [
    { label: 'Mes alertes', path: '/dashboard-citoyen', icon: MapPin },
    { label: 'Signaler', path: '/report', icon: PlusCircle },
    { label: 'Profil', path: '/profile', icon: User },
  ];

  if (loading && pathname !== '/login') {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Vérification du profil citoyen...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-50 shadow-2xl relative border-x border-slate-200/50 pb-20">
        
        <Header points={userPoints} />

        <div className="flex-1">{children}</div>

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