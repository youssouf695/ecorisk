'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser';
import { Mail, User, MapPin, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  
  // États d'inscription
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [quartier, setQuartier] = useState('Baladji');
  const [loading, setLoading] = useState(false);
  
  // États de la gestion de l'OTP
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // --- 1. GÉNÉRER ET ENVOYER LE CODE OTP ---
// --- 1. GÉNÉRER ET ENVOYER LE CODE OTP ---
const sendOtpEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);

    // Génère un code à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    // 🚀 SÉCURITÉ HACKATHON : Affichage immédiat du code dans la console du navigateur
    console.log("====================================");
    console.log(`[EcoReport AI] CODE OTP (INSCRIPTION) : ${otp}`);
    console.log("====================================");

    // Date et heure locales pour Ngaoundéré
    const now = new Date().toLocaleString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    try {
      // Routage et injection des variables directement dans ton template HTML EmailJS
      await emailjs.send(
        'service_9ytobcs',
        'template_6658w2o',
        {
          name: name,
          time: now,
          message: `Votre code de validation à usage unique pour l'application EcoReport est : ${otp}`,
          to_email: email,
        },
        'zHlNT2HaQOPgo5Y37'
      );

      setIsOtpSent(true);
      alert(`Un code de validation a été envoyé à ${email}`);
    } catch (error) {
      console.error("Erreur d'envoi OTP:", error);
      // En mode hackathon, on laisse quand même l'utilisateur avancer si le réseau coupe
      setIsOtpSent(true); 
      alert("Note : Problème de réseau pour l'envoi du mail, mais le code a été généré en console !");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VÉRIFIER L'OTP ET ENREGISTRER DANS SUPABASE ---
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtpInput !== generatedOtp) {
      alert("Code OTP incorrect. Veuillez réessayer.");
      return;
    }

    setLoading(true);

    try {
      // Insertion du nouveau citoyen dans la table 'users' de Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name, 
            email, 
            quartier, 
            points: 10 // Petit bonus de points pour lancer la gamification
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Sauvegarde locale de la session pour l'appareil
        localStorage.setItem('ecoreport_user_id', data.id);
        
        alert("Compte créé avec succès ! Bienvenue sur EcoReport.");
        router.push('/report'); // Redirection vers l'interface de signalement
      }
    } catch (error: any) {
      console.error("Erreur d'enregistrement:", error);
      alert("Erreur lors de la création du profil. Cet email est peut-être déjà lié à un compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 text-slate-900 px-4 py-12 antialiased">
      <div className="max-w-md w-full mx-auto space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
        
        {/* EN-TÊTE */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Rejoindre EcoReport</h2>
          <p className="text-xs text-slate-400">Devenez acteur du changement dans votre commune</p>
        </div>

        {!isOtpSent ? (
          /* ÉTAPE 1 : FORMULAIRE D'INSCRIPTION */
          <form onSubmit={sendOtpEmail} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">Nom Complet</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amadou Bouba"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500 transition placeholder-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre-adresse@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500 transition placeholder-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">Quartier (Ngaoundéré)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select 
                  value={quartier} onChange={(e) => setQuartier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-emerald-500 transition text-slate-700"
                >
                  <option value="Baladji">Baladji</option>
                  <option value="Dang">Dang (Université)</option>
                  <option value="Sabongari">Sabongari</option>
                  <option value="Joli Soir">Joli Soir</option>
                  <option value="Burkina">Burkina</option>
                </select>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black py-3.5 rounded-xl text-xs tracking-widest uppercase shadow-md transition active:scale-99 flex items-center justify-center gap-2 pt-4"
            >
              {loading ? "Génération du code..." : "Recevoir mon code OTP"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* ÉTAPE 2 : CLAVIER DE SAISIE DU CODE VALIDATION */
          <form onSubmit={handleVerifyAndRegister} className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
              <p className="text-[11px] text-emerald-800 font-medium">
                Un e-mail contenant un code de vérification à 6 chiffres a été envoyé à <strong>{email}</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center mb-1">Entrez le code OTP</label>
              <div className="relative max-w-[200px] mx-auto">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text" maxLength={6} required value={userOtpInput} onChange={(e) => setUserOtpInput(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 text-center text-sm font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition placeholder-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black py-3.5 rounded-xl text-xs tracking-widest uppercase shadow-md transition active:scale-99 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? "Vérification..." : "Valider & M'inscrire"}
              </button>

              <button
                type="button" onClick={() => setIsOtpSent(false)}
                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide py-1"
              >
                Modifier mes informations
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}