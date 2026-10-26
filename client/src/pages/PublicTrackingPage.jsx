import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Layers,
  User,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';

export function PublicTrackingPage() {
  const [searchParams] = useSearchParams();
  const initialCaseId = searchParams.get('caseId') || '';

  const [caseIdInput, setCaseIdInput] = useState(initialCaseId);
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = async (idToQuery) => {
    const id = idToQuery || caseIdInput;
    if (!id || !id.trim()) {
      setError('Please provide a valid Case ID.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setComplaint(null);
      setHistory([]);

      const res = await api.get(`/complaints/public/track/${id.trim()}`);
      setComplaint(res.data.data.complaint);
      setHistory(res.data.data.history || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Grievance case dossier not found. Please verify your Case ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCaseId) {
      fetchStatus(initialCaseId);
    }
  }, [initialCaseId]);

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <Link
            to="/lodge-complaint"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lodge New Student / Faculty Grievance</span>
          </Link>

          <Link
            to="/login"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
          >
            AICTE Officer Console →
          </Link>
        </div>

        {/* Tracking Header */}
        <div className="glass-panel rounded-3xl border border-slate-700/70 p-6 sm:p-8 bg-[#090f20] shadow-2xl text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow-cyan">
            <Search className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            AICTE Grievance Status Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Real-time regulatory tracking for student and teacher complaints lodged with the All India Council for Technical Education.
          </p>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchStatus();
            }}
            className="max-w-md mx-auto mt-6 flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={caseIdInput}
                onChange={(e) => setCaseIdInput(e.target.value)}
                placeholder="e.g. CASE-2026-0038"
                className="w-full px-4 py-3 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-cyan-500/50 focus:border-cyan-400 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Searching...' : 'Track Case'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Complaint Details Card */}
        {complaint && (
          <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 bg-[#0a1222] shadow-2xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800">
                  {complaint.caseId}
                </span>
                <h2 className="text-xl font-extrabold text-white font-display mt-2">
                  {complaint.subject}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Institution</span>
                <span className="font-bold text-slate-100 block mt-0.5 truncate">{complaint.institutionName}</span>
                <span className="font-mono text-[10px] text-cyan-400 block mt-0.5">ID: {complaint.aictePermanentId}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Assigned Bureau</span>
                <span className="font-bold text-slate-100 block mt-0.5">{complaint.assignedBureau}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">SRO Chennai</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Lodge Date</span>
                <span className="font-bold text-slate-100 block mt-0.5 font-mono">
                  {new Date(complaint.receivedAt).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Email Authenticated</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Disposal Target</span>
                <span className="font-bold text-cyan-300 block mt-0.5 font-mono">
                  {new Date(complaint.expectedDisposalDate).toLocaleDateString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{complaint.nextAction || 'Bureau Review'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
                Grievance Summary:
              </span>
              <p className="leading-relaxed">{complaint.description}</p>
            </div>

            {/* Official Timeline */}
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Statutory Processing Timeline & Remarks</span>
              </h3>

              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No historical actions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">
                            {h.officerDisplayName} ({h.actionType})
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{h.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
