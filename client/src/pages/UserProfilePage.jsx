import React from 'react';
import { User, Shield, Building2, MapPin, Mail, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/constants';

export function UserProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl bg-[#0c1324]">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-6 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-glow-cyan">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white font-display">{user?.name}</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            <div className="mt-2.5 inline-flex items-center space-x-1 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{ROLE_LABELS[user?.role] || user?.role}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex justify-between py-2.5 border-b border-slate-800/80">
            <span className="text-slate-400 font-medium">Assigned Bureau / Cell</span>
            <strong className="text-cyan-300">{user?.bureau || 'All Bureaus'}</strong>
          </div>
          <div className="flex justify-between py-2.5 border-b border-slate-800/80">
            <span className="text-slate-400 font-medium">Regional Jurisdiction</span>
            <strong className="text-slate-200">{user?.region || 'All Regions'}</strong>
          </div>
          <div className="flex justify-between py-2.5 border-b border-slate-800/80">
            <span className="text-slate-400 font-medium">Account Status</span>
            <span className="inline-flex items-center text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Active Officer Credentials
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-slate-400 font-medium">Authentication Authority</span>
            <span className="font-mono text-slate-400">AICTE National Headquarters, New Delhi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
