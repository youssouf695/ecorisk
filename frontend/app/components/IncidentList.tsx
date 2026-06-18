// components/IncidentList.tsx
'use client';

interface IncidentListProps {
  reports: any[];
}

export default function IncidentList({ reports }: IncidentListProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">
          Flux d'incidents urbains
        </h2>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
          {reports.length} Enregistrés
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {reports.map((report) => (
          <div key={report.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-slate-300 transition shadow-sm">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">{report.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="capitalize font-medium">{report.category}</span>
                <span>•</span>
                {report.is_duplicate ? (
                  <span className="text-slate-400 font-medium">Suivi collectif</span>
                ) : (
                  <span className="text-emerald-600 font-bold">+{report.points_earned} Pts</span>
                )}
              </div>
            </div>
            
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
              report.severity === 'high' ? 'bg-red-100 text-red-700' :
              report.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {report.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}