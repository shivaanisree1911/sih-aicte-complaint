import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-rose-100 text-rose-600 rounded-full mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">403 - Restricted Regulatory Access</h1>
      <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
        Your logged-in officer role lacks the statutory privileges required to access this resource or execute this administrative action.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
