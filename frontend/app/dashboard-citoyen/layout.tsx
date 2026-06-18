'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import Header from '../components/Header';
import { MapPin, PlusCircle, User } from 'lucide-react';

export default function CitoyenLayout({ children }: { children: React.ReactNode }) {
  const [userPoints, setUserPoints] = useState(0);
  const [loadingSession, setLoadingSession] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    checkUserSession();
  }, [pathname]);

  const checkUserSession = async () => {
    // 1. Récupérer la session active de Supabase
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // 2. Si connecté, récupérer ses points réels
      fetchUserPoints(session.user.id);
    } else {
      // --- ASTUCE HACKATHON : Connexion automatique si aucune session ---
      // Cela évite l'écran de login fastidieux devant le jury
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'citoyen@ecoreport.com', // Crée ce compte rapidement dans ton auth Supabase
        password: 'password123',
      });
      
      if (signInData?.user) {
        fetchUserPoints(signInData.user.id);
      }
    }
    setLoadingSession(false);
  };

  const fetchUserPoints = async (userId: string) => {
    const { data } = await supabase.from('users').select('points').eq('id', userId).single();
    if (data) setUserPoints(data.points);
  };

  const navItems = [
    { label: 'Mes alertes', path: '/dashboard-citoyen', icon: MapPin },
    { label: 'Signaler', path: '/report', icon: PlusCircle },
    { label: 'Profil', path: '/profile', icon: User },
  ];

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-medium text-slate-400">
        Chargement de la session...
      </div>
    );
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