import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Layers, ShieldAlert } from 'lucide-react';
import { SeverityBadge } from '../common/Badge';

export function OverlapBanner({ overlaps = [] }) {
  if (!overlaps || overlaps.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {overlaps.map((overlap) => (
        <div
          key={overlap._id}
          className="rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-purple-950/70 p-5 shadow-glow-rose backdrop-blur-xl relative overflow-hidden"
        >
          {/* Neon pulsating glow corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 bg-rose-950 text-rose-400 rounded-xl border border-rose-700/60 shadow-glow-rose flex-shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <h4 className="text-sm font-bold text-white font-display">
                    Cross-Bureau Overlap Flagged — Inter-Bureau Coordination Mandatory
                  </h4>
                  <SeverityBadge severity={overlap.severity} />
                </div>
                <p className="text-xs text-rose-200/80 mt-1 font-mono">
                  Involved Cases: <span className="font-bold text-white">{overlap.caseIds?.join(' & ')}</span> •
                  Bureaus: <span className="text-cyan-300 font-bold">{overlap.bureausInvolved?.join(' + ')}</span>
                </p>
                {overlap.matchReasons && overlap.matchReasons.length > 0 && (
                  <ul className="mt-2 text-xs text-slate-300 list-disc list-inside space-y-0.5">
                    {overlap.matchReasons.map((reason, idx) => (
                      <li key={idx} className="leading-relaxed">{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <Link
              to={`/overlaps/${overlap._id}`}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-glow-rose transition-all whitespace-nowrap transform hover:scale-[1.02]"
            >
              <Layers className="w-4 h-4" />
              <span>Enter Overlap Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
