'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser';
import { Leaf, Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États de la gestion de l'OTP pour la connexion
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // --- 1. VÉRIFIER SI L'UTILISATEUR EXISTE & ENVOYER L'OTP ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      // Vérifier si le citoyen existe déjà dans la table 'users'
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .maybeSingle();

      if (error) throw error;

      if (!user) {
        alert("Aucun compte n'est associé à cet email. Veuillez vous inscrire.");
        router.push('/register'); // Redirection automatique vers l'inscription
        return;
      }

      setUserData(user);

      // 🎲 Générer le code OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);

      // 🚀 SÉCURITÉ HACKATHON : Affichage immédiat en console avant l'envoi réseau
      console.log("====================================");
      console.log(`[EcoReport AI] CODE OTP (CONNEXION) : ${otp}`);
      console.log("====================================");

      const now = new Date().toLocaleString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Envoi du mail via ton instance EmailJS
      await emailjs.send(
        'service_9ytobcs',
        'template_6658w2o',
        {
          name: user.name,
          time: now,
          message: otp, // Utilise la variable brute pour ton superbe design HTML
          to_email: email,
        },
        'zHlNT2HaQOPgo5Y37'
      );

      setIsOtpSent(true);
      alert(`Code de connexion envoyé à ${email}`);
    } catch (err) {
      console.error("Détails de l'erreur d'envoi :", err);
      
      // 🔥 LE SAUVETAGE HACKATHON : Même si le réseau ou EmailJS plante, on force l'accès
      setIsOtpSent(true);
      alert("Note : Problème de réseau pour l'envoi du mail, mais le code a été généré dans votre console !");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VALIDER L'OTP DE CONNEXION & INITIALISER LA SESSION ---
  const handleVerifyAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtpInput !== generatedOtp) {
      alert("Code OTP incorrect.");
      return;
    }

    // Sauvegarde locale de la session sur le téléphone
    localStorage.setItem('ecoreport_user_id', userData.id);
    localStorage.setItem('ecoreport_user_name', userData.name);

    alert(`Ravi de vous revoir, ${userData.name} !`);
    router.push('/report');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-6 border border-slate-200/60">
        
        {/* LOGO & EN-TÊTE */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-md">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">EcoReport AI</h1>
          <p className="text-xs text-slate-400">Gouvernance urbaine participative • Connexion</p>
        </div>

        {!isOtpSent ? (
          /* ÉTAPE 1 : DEMANDE D'OTP PAR EMAIL */
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider pl-1">Votre Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre-adresse@email.com" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-emerald-600 placeholder-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl text-xs tracking-widest uppercase shadow-md transition flex items-center justify-center gap-2 pt-4"
            >
              {loading ? "Vérification..." : "Recevoir mon code d'accès"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* LIEN DE SWITCH VERS L'INSCRIPTION */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400 font-medium">
                Nouveau sur la plateforme ?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Créer un compte
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* ÉTAPE 2 : VALIDATION DU CODE REÇU */
          <form onSubmit={handleVerifyAndLogin} className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-center">
              <p className="text-[11px] text-emerald-800 font-medium">
                Saisissez le code de sécurité temporaire envoyé à <strong>{email}</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center mb-1">Code de connexion</label>
              <div className="relative max-w-[200px] mx-auto">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input 
                  type="text" 
                  maxLength={6} 
                  required 
                  value={userOtpInput} 
                  onChange={(e) => setUserOtpInput(e.target.value)}
                  placeholder="000000"
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 text-center text-sm font-mono font-bold tracking-[0.5em] focus:outline-none focus:border-emerald-500 transition placeholder-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-xs tracking-widest uppercase shadow-md transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Vérifier & Entrer
              </button>

              <button
                type="button" 
                onClick={() => setIsOtpSent(false)}
                className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide py-1"
              >
                Retour
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}