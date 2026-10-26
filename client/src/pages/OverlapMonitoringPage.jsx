import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2
} from 'lucide-react';
import api from '../services/api';
import { SeverityBadge, OverlapStatusBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { notify } from '../hooks/useToast';
import { OVERLAP_SEVERITIES, OVERLAP_STATUSES } from '../utils/constants';

export function OverlapMonitoringPage() {
  const [overlaps, setOverlaps] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All');
  const [reviewStatus, setReviewStatus] = useState('All');

  const fetchOverlaps = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(severity !== 'All' && { severity }),
        ...(reviewStatus !== 'All' && { reviewStatus })
      });

      const res = await api.get(`/overlaps?${params.toString()}`);
      setOverlaps(res.data.data.items || []);
      setTotal(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load overlaps:', err);
      notify('Failed to load cross-bureau overlap records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverlaps();
  }, [page, severity, reviewStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOverlaps();
  };

  const handleRunScan = async () => {
    try {
      setScanning(true);
      const res = await api.post('/overlaps/scan');
      notify(`Full registry scan complete! Identified ${res.data.data.detectedCount} cross-bureau conflicts.`, 'success');
      fetchOverlaps();
    } catch (err) {
      notify(err.response?.data?.message || 'Overlap scan failed.', 'error');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
              Cross-Bureau Overlap Monitoring Console
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Automated Conflict Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated intelligence identifying parallel active complaints across PGRC, RB & Southern Regional Offices
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-200 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Running Detection Matrix...' : 'Trigger Full AICTE Scan'}</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="glass-panel-elevated p-4 sm:p-5 rounded-2xl border border-cyan-500/30 text-white shadow-xl flex items-start space-x-4 bg-[#0a1224]">
        <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl flex-shrink-0 shadow-glow-cyan">
          <Layers className="w-6 h-6" />
        </div>
        <div className="text-xs leading-relaxed">
          <h3 className="font-bold text-sm text-cyan-300 font-display">How Cross-Bureau Overlap Detection Works</h3>
          <p className="text-slate-300 mt-1 leading-relaxed">
            The automated engine applies a multi-pass heuristic and semantic matching pipeline: (1) Same Institution & Different Active Bureaus (PGRC + RB);
            (2) Jaccard token-similarity scoring on grievance text; (3) Correlated regulatory domains (e.g., Infrastructure vs Regulatory Compliance).
            Flagged cases trigger coordinated joint review rather than destructive data merging.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 p-4 shadow-xl flex flex-col sm:flex-row gap-3 bg-[#0c1324]">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Institution, AICTE Permanent ID, or Case IDs..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 transition-all"
          />
        </form>

        <div className="flex items-center space-x-2.5">
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2.5 text-slate-200 font-medium bg-[#090e1a] border border-slate-700/80 cursor-pointer"
          >
            <option value="All" className="bg-[#0c1324] text-slate-100">All Severities</option>
            {OVERLAP_SEVERITIES.map((s) => (
              <option key={s} value={s} className="bg-[#0c1324] text-slate-100">
                {s} Severity
              </option>
            ))}
          </select>

          <select
            value={reviewStatus}
            onChange={(e) => {
              setReviewStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2.5 text-slate-200 font-medium bg-[#090e1a] border border-slate-700/80 cursor-pointer"
          >
            <option value="All" className="bg-[#0c1324] text-slate-100">All Review Statuses</option>
            {OVERLAP_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-[#0c1324] text-slate-100">
                {st}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchOverlaps}
            className="px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Overlaps Table */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324]">
        {loading ? (
          <LoadingSpinner text="Computing cross-bureau overlap matrix..." />
        ) : overlaps.length === 0 ? (
          <EmptyState
            title="No Overlap Alerts Found"
            description="No concurrent cross-bureau overlaps found matching the active criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Institution Name</th>
                  <th className="py-3.5 px-4 font-mono">Involved Case IDs</th>
                  <th className="py-3.5 px-4">Bureaus Involved</th>
                  <th className="py-3.5 px-4">Correlation Factors</th>
                  <th className="py-3.5 px-4">Review Status</th>
                  <th className="py-3.5 px-4">Coordinating Officer</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overlaps.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/overlaps/${item._id}`}
                        className="font-bold text-slate-100 hover:text-cyan-400 block line-clamp-1 transition-colors"
                      >
                        {item.institutionName}
                      </Link>
                      <span className="font-mono text-[10px] text-cyan-400">
                        {item.aictePermanentId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.caseIds?.join(' & ')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-purple-300">
                      {item.bureausInvolved?.join(' + ')}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-400 text-[11px]">
                        {item.matchReasons?.[0] || 'Active parallel cases'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <OverlapStatusBadge status={item.reviewStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {item.coordinatingOfficerName || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/overlaps/${item._id}`}
                        className="px-3 py-1 text-xs font-bold rounded-lg glass-panel text-cyan-300 hover:text-white hover:border-cyan-500/50 transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
