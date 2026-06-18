'use client';
import { useState, useEffect } from 'react';
import Header from '../app/components/Header';
import IncidentForm from '../app/components/IncidentForm';
import IncidentList from '../app/components/IncidentList';
import Link from 'next/link';

export default function HomePage() {
  // Gestion du carrousel d'images de dépôts sauvages / interventions
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80", // Exemple dépôt sauvage / déchet
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80", // Nettoyage / Environnement
    "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=800&q=80"  // Action citoyenne
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change toutes les 4 secondes
    return () => clearInterval(timer);
  }, [images.length]);

  // Logique PWA : Capturer l'événement d'installation sur smartphone / PC
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });
  }, []);

  const handlePwaInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-100 font-sans">
      
      {/* HEADER EXISTANT ICI... */}
      <Header points={0}/>

      {/* NEW HERO SECTION AVEC CARROUSEL INTEGRÉ */}
      <section className="relative px-6 py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden border-b border-slate-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* TEXTE & PROPOSITION DE VALEUR (COLONNE GAUCHE) */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold text-emerald-800 font-mono uppercase tracking-wider">
              Gestion des dépôts sauvages en temps réel
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Cartographier et éradiquer les décharges illégales.
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-normal leading-relaxed">
              EcoReport permet aux citoyens de signaler instantanément les dépôts sauvages et aux municipalités de planifier les interventions de nettoyage de manière ciblée.
            </p>
            
            {/* BOUTONS D'ACTION ET BANNIÈRE PWA */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/report" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-sm transition text-sm text-center tracking-wide uppercase">
                  Ouvrir l'Espace Signalement
                </Link>
                <Link href="/dashboard" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-sm transition text-sm text-center tracking-wide uppercase">
                  Console d'Administration
                </Link>
              </div>

              {/* Bloc d'installation PWA Mobile Intuitif */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Application mobile disponible</h3>
                  <p className="text-xs text-slate-500">Ajoutez EcoReport sur votre écran d'accueil sans passer par les stores.</p>
                </div>
                <button 
                  onClick={handlePwaInstall}
                  className="bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm shrink-0 uppercase tracking-wider"
                >
                  Installer la solution mobile
                </button>
              </div>
            </div>
          </div>

          {/* CARROUSEL DÉFILANT (COLONNE DROITE) */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Illustration de dépôt sauvage ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Filtre sombre discret pour garder le style technique */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              </div>
            ))}
            
            {/* Indicateurs de position du carrousel en bas à droite */}
            <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "w-6 bg-emerald-500" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* RESTE DES SECTIONS (SOLUTION, FOOTER...) */}
    </div>
  );
}