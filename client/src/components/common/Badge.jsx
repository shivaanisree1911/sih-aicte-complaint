import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    'Received': 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60 shadow-glow-cyan/20',
    'Pending': 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    'Under Process': 'bg-blue-950/60 text-blue-300 border-blue-800/60 shadow-glow-blue/20',
    'Transferred': 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    'Escalated': 'bg-rose-950/80 text-rose-300 border-rose-700/80 font-bold shadow-glow-rose/40 animate-pulse',
    'Disposed': 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    'Closed': 'bg-slate-900/80 text-slate-400 border-slate-700'
  };

  const style = styles[status] || 'bg-slate-900 text-slate-400 border-slate-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-md ${style}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    'Low': 'bg-slate-900/80 text-slate-400 border-slate-700',
    'Medium': 'bg-blue-950/50 text-blue-300 border-blue-800/50',
    'High': 'bg-amber-950/60 text-amber-300 border-amber-700/60',
    'Critical': 'bg-rose-950 text-rose-300 border-rose-500 font-extrabold shadow-glow-rose animate-pulse'
  };

  const style = styles[priority] || 'bg-slate-900 text-slate-400 border-slate-800';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wide uppercase border ${style}`}>
      {priority}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const styles = {
    'High': 'bg-rose-600 text-white font-extrabold shadow-glow-rose border border-rose-400',
    'Medium': 'bg-amber-600/90 text-white font-bold border border-amber-400',
    'Low': 'bg-blue-600/90 text-white font-semibold border border-blue-400'
  };

  const style = styles[severity] || 'bg-slate-600 text-white';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] tracking-wider uppercase shadow-md ${style}`}>
      {severity} Overlap
    </span>
  );
}

export function OverlapStatusBadge({ status }) {
  const styles = {
    'New': 'bg-rose-950/80 text-rose-300 border-rose-800',
    'Under Review': 'bg-amber-950/80 text-amber-300 border-amber-800',
    'Coordination Required': 'bg-purple-950/80 text-purple-300 border-purple-700 font-bold shadow-sm',
    'Resolved': 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
    'Dismissed as Not Related': 'bg-slate-900 text-slate-500 border-slate-800'
  };

  const style = styles[status] || 'bg-slate-900 text-slate-400 border-slate-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${style}`}>
      {status}
    </span>
  );
}
