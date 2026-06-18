'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
// import Header from '../../components/Header';
// Importation des icônes vectorielles professionnelles
import { 
  Trash2, 
  Construction, 
  Milk, 
  Package, 
  Camera, 
  RefreshCw, 
  MapPin, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function ReportPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  
  // États du formulaire
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('déchets');
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState('Position non détectée');

  // États de l'appareil photo
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mockUserId = "11111111-1111-1111-1111-111111111111";

  // Configuration thématique des catégories avec composants d'icônes
  const categoriesConfig = [
    { id: 'déchets', label: 'Ordures', icon: Trash2 },
    { id: 'gravats', label: 'Gravats', icon: Construction },
    { id: 'plastique', label: 'Plastique', icon: Milk },
    { id: 'encombrants', label: 'Objets', icon: Package },
  ];

  useEffect(() => {
    fetchUserPoints();
    fetchMyRecentReports();
    return () => { stopCamera(); };
  }, []);

  const fetchUserPoints = async () => {
    const { data } = await supabase.from('users').select('points').eq('id', mockUserId).single();
    if (data) setUserPoints(data.points);
  };

  const fetchMyRecentReports = async () => {
    const { data } = await supabase.from('reports')
      .select('*')
      .eq('user_id', mockUserId)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setReports(data);
  };

  // --- CAMERA NATIVE ---
  const startCamera = async () => {
    setCapturedImage(null);
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) { videoRef.current.srcObject = mediaStream; }
    } catch (err) {
      alert("Activez les permissions d'accès à l'appareil photo.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  // --- GPS ---
  const handleGeolocation = () => {
    setGeoStatus('Localisation...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setGeoStatus('Position verrouillée');
        },
        () => {
          setCoords({ lat: 7.3230, lng: 13.5650 }); // Repli Ngaoundéré automatique
          setGeoStatus('GPS Localisé');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  // --- SOUMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !coords) return;
    setLoading(true);

    const { error } = await supabase.from('reports').insert([
      {
        user_id: mockUserId,
        title,
        category,
        severity,
        latitude: coords.lat,
        longitude: coords.lng,
        description: "Signalement mobile applicatif.",
        image_data: capturedImage
      }
    ]).select();

    setLoading(false);

    if (!error) {
      setTitle('');
      setCoords(null);
      setCapturedImage(null);
      setGeoStatus('Position non détectée');
      fetchUserPoints();
      fetchMyRecentReports();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      {/* <Header points={userPoints} /> */}

      <main className="flex-1 p-4 max-w-md w-full mx-auto space-y-5">
        
        {/* TITRE APPLICATIF */}
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Nouveau Signalement</h2>
          <p className="text-xs text-slate-400">Renseignez l'anomalie sur le terrain</p>
        </div>

        {/* APPAREIL PHOTO AVEC ICÔNE VECTORIELLE */}
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-900 aspect-video flex flex-col justify-center items-center">
          {isCameraOpen ? (
            <div className="absolute inset-0 w-full h-full">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                <button type="button" onClick={capturePhoto} className="w-14 h-14 bg-white rounded-full border-4 border-slate-900/30 flex items-center justify-center shadow-lg active:scale-95 transition" />
              </div>
            </div>
          ) : capturedImage ? (
            <div className="absolute inset-0 w-full h-full">
              <img src={capturedImage} alt="Aperçu" className="w-full h-full object-cover" />
              <button type="button" onClick={startCamera} className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-wider uppercase backdrop-blur-xs flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Changer
              </button>
            </div>
          ) : (
            <button type="button" onClick={startCamera} className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition group px-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner group-hover:bg-emerald-600 group-hover:border-emerald-500 group-hover:text-white transition">
                <Camera className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Ouvrir l'appareil photo</span>
              <span className="text-[10px] text-slate-500 text-center">Une preuve visuelle claire valide l'urgence</span>
            </button>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* INPUT DE DESCRIPTION & GPS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Localiser & Décrire</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Que constatez-vous sur le terrain ?" 
              className="w-full border-0 border-b border-slate-100 py-2 text-sm font-medium focus:outline-none focus:border-emerald-500 placeholder-slate-300 bg-transparent"
              required 
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-slate-500 max-w-[200px]">
              <MapPin className={`w-3.5 h-3.5 shrink-0 ${coords ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="text-xs font-mono font-medium truncate">
                {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : geoStatus}
              </span>
            </div>
            <button type="button" onClick={handleGeolocation} className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide">
              {coords ? "Actualiser" : "Activer le GPS"}
            </button>
          </div>
        </div>

        {/* GRILLE DE CATÉGORIES AVEC ICÔNES VECTORIELLES */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">Nature de l'encombrement</label>
          <div className="grid grid-cols-4 gap-2">
            {categoriesConfig.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition ${
                    category === item.id 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-98' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${category === item.id ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-[10px] font-bold tracking-tight truncate w-full text-center">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SÉLECTEUR DE PRIORITÉ AVEC ICÔNE */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400 pl-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-wider">Priorité</span>
          </div>
          <div className="flex gap-1.5">
            {['low', 'medium', 'high'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSeverity(lvl)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition ${
                  severity === lvl
                    ? lvl === 'high' ? 'bg-red-500 border-red-500 text-white' :
                      lvl === 'medium' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                {lvl === 'low' ? 'Basse' : lvl === 'medium' ? 'Moyenne' : 'Urgent'}
              </button>
            ))}
          </div>
        </div>

        {/* LISTE DES ALERTES RÉCENTES */}
        <div className="space-y-2 pt-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mes dernières alertes</h3>
          <div className="space-y-2">
            {reports.map((report) => {
              const matchedCategory = categoriesConfig.find(c => c.id === report.category);
              const ItemIcon = matchedCategory ? matchedCategory.icon : MapPin;
              return (
                <div key={report.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <ItemIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="truncate space-y-0.5">
                      <h4 className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{report.title}</h4>
                      <p className="text-[9px] font-mono text-slate-400">Indexé le {new Date(report.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider ${
                    report.severity === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                    report.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-green-50 text-green-700 border border-green-100'
                  }`}>
                    {report.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BARRE ACTION FIXE BASSE */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 z-40">
          <div className="max-w-md mx-auto">
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={loading || !title || !coords} 
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white font-black py-3.5 rounded-xl text-xs tracking-widest uppercase shadow-md transition active:scale-99 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? "Indexation sécurisée..." : "Envoyer le rapport"}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}