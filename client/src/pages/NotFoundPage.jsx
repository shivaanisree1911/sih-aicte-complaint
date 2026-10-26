import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-slate-100 text-slate-400 rounded-full mb-4">
        <HelpCircle className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-2">
        The requested URL was not found in the AICTE grievance management portal.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
