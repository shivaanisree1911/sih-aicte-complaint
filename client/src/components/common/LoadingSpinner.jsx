import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Querying telemetry matrix...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-cyan-400 animate-spin mb-3`} />
        <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/20 pointer-events-none" />
      </div>
      <p className="text-xs font-mono font-medium text-slate-400 mt-2">{text}</p>
    </div>
  );
}
