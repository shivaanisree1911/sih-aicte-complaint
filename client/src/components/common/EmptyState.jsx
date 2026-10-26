import React from 'react';
import { FolderSearch } from 'lucide-react';

export function EmptyState({
  title = 'No records located',
  description = 'No matching information found in the regulatory database.',
  actionText,
  onAction,
  icon: Icon = FolderSearch
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-dashed border-slate-800 my-4">
      <div className="p-3.5 bg-slate-900 text-cyan-400 rounded-2xl border border-slate-800 shadow-glow-cyan/20 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white font-display">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
