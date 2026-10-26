import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, totalItems, onPageChange, limit = 10 }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/60 px-4 py-3 sm:px-6 rounded-b-2xl">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-white">{start}</span> to{' '}
            <span className="font-bold text-white">{end}</span> of{' '}
            <span className="font-bold text-white font-mono">{totalItems}</span> records
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-xl px-2.5 py-1.5 text-slate-400 border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="relative inline-flex items-center px-4 py-1.5 text-xs font-mono font-bold text-cyan-400 border border-slate-800 bg-slate-950">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-xl px-2.5 py-1.5 text-slate-400 border border-slate-800 bg-slate-900 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
