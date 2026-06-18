// components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  points: number;
}

export default function Header({ points }: HeaderProps) {
  const pathname = usePathname();

  // Fonction utilitaire pour surligner la route active sans fioritures
  const linkClass = (path: string) => {
    const base = "text-sm font-medium transition-colors duration-150";
    const active = "text-slate-900 font-semibold";
    const inactive = "text-slate-500 hover:text-slate-900";
    return `${base} ${pathname === path ? active : inactive}`;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* BLOC GAUCHE : LOGO & NAVIGATION */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-lg tracking-tight text-slate-900">
              EcoReport
            </span>
            {/* <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
              v1.0
            </span> */}
          </Link>

          {/* LIENS DE NAVIGATION PRINCIPAUX */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={linkClass('/')}>
              Accueil
            </Link>
            <Link href="/report" className={linkClass('/report')}>
              Signaler un dépôt
            </Link>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              Console Municipale
            </Link>
          </nav>
        </div>

        {/* BLOC DROITE : POINTS CITOYENS & PROFIL */}
        <div className="flex items-center gap-4">
          
          {/* Compteur de points Eco-Citoyen */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-800 tracking-wide uppercase">
              {points} Pts
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Menu Profil / Compte Minimaliste */}
          <div className="flex items-center gap-3 pl-1">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">Demo User</span>
              <span className="text-[10px] font-mono text-slate-400">Citoyen</span>
            </div>
            
            {/* Avatar Placeholder style Vercel */}
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold border border-slate-200 shadow-sm cursor-pointer hover:opacity-80 transition">
              DU
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}