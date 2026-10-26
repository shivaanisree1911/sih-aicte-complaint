import React from 'react';

export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, onClick, badge }) {
  const colorMap = {
    blue: 'bg-cyan-950/80 text-cyan-400 border-cyan-800 shadow-glow-cyan',
    amber: 'bg-amber-950/80 text-amber-400 border-amber-800',
    indigo: 'bg-indigo-950/80 text-indigo-400 border-indigo-800',
    emerald: 'bg-emerald-950/80 text-emerald-400 border-emerald-800 shadow-glow-emerald',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-800',
    rose: 'bg-rose-950/80 text-rose-400 border-rose-800 shadow-glow-rose',
    red: 'bg-red-950/80 text-red-400 border-red-800 shadow-glow-rose',
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`glass-panel-hover glass-panel rounded-2xl border border-slate-700/60 p-5 shadow-xl transition-all duration-200 bg-[#0c1324] ${
        onClick ? 'cursor-pointer hover:border-cyan-500/50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className={`p-3 rounded-xl border ${currentTheme}`}>
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-white tracking-tight mt-0.5 font-display">{value}</h3>
          </div>
        </div>
        {badge && (
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex items-center">
          {subtitle}
        </p>
      )}
    </div>
  );
}
