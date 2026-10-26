import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { notify } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { BUREAUS, COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, COMPLAINT_PRIORITIES, ROLES } from '../utils/constants';

export function ComplaintListPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState('All');
  const [bureau, setBureau] = useState('All');
  const [category, setCategory] = useState('All');
  const [complainantType, setComplainantType] = useState('All');
  const [isOverdue, setIsOverdue] = useState(searchParams.get('isOverdue') === 'true');

  const isStudentOrFaculty = user?.role === ROLES.STUDENT || user?.role === ROLES.FACULTY;
  const isPrincipal = user?.role === ROLES.PRINCIPAL;

  const getPageTitle = () => {
    if (isStudentOrFaculty) {
      return {
        title: 'My Complaints',
        sub: `Complaints filed by you (${user?.name || 'User'} - ${user?.institutionName || 'Tamil Nadu'})`
      };
    }
    if (isPrincipal) {
      return {
        title: 'College Complaints',
        sub: `All student and teacher complaints for ${user?.institutionName || 'your college'}`
      };
    }
    return {
      title: 'Complaints Directory',
      sub: 'All complaints across registered institutions'
    };
  };

  const titleInfo = getPageTitle();

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(status !== 'All' && { status }),
        ...(priority !== 'All' && { priority }),
        ...(bureau !== 'All' && { bureau }),
        ...(category !== 'All' && { category }),
        ...(complainantType !== 'All' && { complainantType }),
        ...(isOverdue && { isOverdue: 'true' })
      });

      const res = await api.get(`/complaints?${params.toString()}`);
      setComplaints(res.data.data.items || []);
      setTotal(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load complaints:', err);
      notify('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, bureau, category, complainantType, isOverdue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleExport = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || '/api'}/reports/export.csv?type=complaints`, '_blank');
    notify('Exporting complaints to CSV...', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
            {titleInfo.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {titleInfo.sub}
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/complaints/new"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Lodge a Complaint</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl border border-slate-700/50 p-4 shadow-xl space-y-3">
        {/* Principal Complainant Scope Filter */}
        {isPrincipal && (
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">View Complaints:</span>
            <button
              type="button"
              onClick={() => { setComplainantType('All'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                complainantType === 'All'
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
            >
              All College Complaints ({total})
            </button>
            <button
              type="button"
              onClick={() => { setComplainantType('Student'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                complainantType === 'Student'
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
            >
              🎓 From Students
            </button>
            <button
              type="button"
              onClick={() => { setComplainantType('Faculty'); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                complainantType === 'Faculty'
                  ? 'bg-purple-500 text-white shadow-glow-cyan'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
            >
              👨‍🏫 From Teachers
            </button>
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isStudentOrFaculty
                ? 'Search my complaints by Case ID, subject...'
                : 'Search complaints by Case ID, subject, student/teacher name...'
            }
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input transition-all"
          />
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2 text-slate-200 font-medium"
          >
            <option value="All" className="bg-[#0c1324]">All Statuses</option>
            {COMPLAINT_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#0c1324]">{s}</option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2 text-slate-200 font-medium"
          >
            <option value="All" className="bg-[#0c1324]">All Priorities</option>
            {COMPLAINT_PRIORITIES.map((p) => (
              <option key={p} value={p} className="bg-[#0c1324]">{p}</option>
            ))}
          </select>

          <select
            value={bureau}
            onChange={(e) => {
              setBureau(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2 text-slate-200 font-medium"
          >
            <option value="All" className="bg-[#0c1324]">All Bureaus</option>
            {BUREAUS.map((b) => (
              <option key={b} value={b} className="bg-[#0c1324]">{b}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2 text-slate-200 font-medium"
          >
            <option value="All" className="bg-[#0c1324]">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#0c1324]">{c}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setIsOverdue(!isOverdue);
              setPage(1);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center space-x-1.5 ${
              isOverdue
                ? 'bg-rose-950/80 text-rose-300 border-rose-500 shadow-glow-rose/30'
                : 'glass-panel text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Overdue Only</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatus('All');
              setPriority('All');
              setBureau('All');
              setCategory('All');
              setIsOverdue(false);
              setPage(1);
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl glass-panel text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="glass-panel rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Executing multi-parameter database query..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints match criteria"
            description="Adjust your search filters to expand queries across AICTE bureaus."
            actionText="Register Complaint"
            onAction={() => (window.location.href = '/complaints/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Case ID</th>
                  <th className="py-3.5 px-4">Subject & Institution</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Assigned Bureau</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Officer</th>
                  <th className="py-3.5 px-4">Disposal Due</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complaints.map((c) => {
                  const isPastDue =
                    c.expectedDisposalDate &&
                    new Date(c.expectedDisposalDate) < new Date() &&
                    !['Disposed', 'Closed'].includes(c.status);

                  return (
                    <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                        {c.caseId}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <Link
                          to={`/complaints/${c._id}`}
                          className="font-bold text-white hover:text-cyan-400 block line-clamp-1"
                        >
                          {c.subject}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {c.institutionName}
                        </span>
                        <div className="flex items-center flex-wrap gap-1 mt-1">
                          {c.complainantType === 'Faculty' ? (
                            <span className="inline-flex items-center text-[10px] text-purple-300 font-mono bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800">
                              👨‍🏫 Faculty: {c.complainantName || 'Teacher'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] text-cyan-300 font-mono bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-800">
                              🎓 Student: {c.complainantName || 'Student'}
                            </span>
                          )}
                          {c.emailVerified && (
                            <span className="inline-flex items-center text-[9px] text-emerald-300 font-mono bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                              ✓ Email Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {c.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {c.assignedBureau}
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {c.assignedOfficerName || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono text-[11px] ${
                            isPastDue ? 'text-rose-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {c.expectedDisposalDate
                            ? new Date(c.expectedDisposalDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                        {isPastDue && (
                          <span className="block text-[9px] text-rose-400 font-extrabold uppercase font-mono tracking-wider">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/complaints/${c._id}`}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
                        >
                          Dossier →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit) || 1}
          totalItems={total}
          onPageChange={setPage}
          limit={limit}
        />
      </div>
    </div>
  );
}
