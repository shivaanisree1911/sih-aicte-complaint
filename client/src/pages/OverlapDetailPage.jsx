import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Building2,
  AlertTriangle,
  Link2,
  CheckCircle2,
  XCircle,
  UserCheck,
  FileText,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Shield,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { SeverityBadge, OverlapStatusBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { notify } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { OVERLAP_STATUSES, ROLES } from '../utils/constants';

export function OverlapDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [overlap, setOverlap] = useState(null);
  const [officers, setOfficers] = useState([]);

  // Modals
  const [linkModal, setLinkModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [dismissModal, setDismissModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);

  // Form states
  const [coordinatingOfficerId, setCoordinatingOfficerId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [dismissalReason, setDismissalReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOverlap = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/overlaps/${id}`);
      setOverlap(res.data.data.overlap);
    } catch (err) {
      console.error('Failed to load overlap details:', err);
      notify('Failed to load overlap dossier.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await api.get('/admin/users?limit=50');
      setOfficers(res.data.data.items || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOverlap();
    fetchOfficers();
  }, [id]);

  const handleLinkCases = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/overlaps/${id}/link-cases`, { remarks });
      notify('Cases cross-linked for formal inter-bureau coordination!', 'success');
      setLinkModal(false);
      setRemarks('');
      fetchOverlap();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to link cases.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignCoordinator = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/overlaps/${id}/review`, {
        reviewStatus: 'Under Review',
        coordinatingOfficerId,
        reviewRemarks: remarks
      });
      notify('Coordinating officer assigned.', 'success');
      setAssignModal(false);
      setRemarks('');
      fetchOverlap();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to assign coordinator.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.post(`/overlaps/${id}/resolve`, { remarks });
      notify('Overlap marked as resolved.', 'success');
      setResolveModal(false);
      setRemarks('');
      fetchOverlap();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to resolve overlap.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async (e) => {
    e.preventDefault();
    if (!dismissalReason.trim()) return;
    try {
      setActionLoading(true);
      await api.post(`/overlaps/${id}/dismiss`, { dismissalReason });
      notify('Overlap dismissed with documented justification.', 'success');
      setDismissModal(false);
      setDismissalReason('');
      fetchOverlap();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to dismiss overlap.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading cross-bureau overlap dossier..." />;
  }

  if (!overlap) {
    return (
      <EmptyState
        title="Overlap Record Not Found"
        description="The requested overlap alert does not exist."
      />
    );
  }

  const isAuditor = user?.role === ROLES.AUDITOR;

  return (
    <div className="space-y-6">
      {/* Header Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/overlaps"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overlap Monitoring Console</span>
        </Link>
        <span className="text-xs font-mono text-cyan-400">
          Detected: {new Date(overlap.detectedAt).toLocaleString()}
        </span>
      </div>

      {/* Main Alert Dossier Card */}
      <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl bg-[#0c1324]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-xl font-extrabold text-white font-display">
                Cross-Bureau Case Conflict: {overlap.institutionName}
              </h1>
              <SeverityBadge severity={overlap.severity} />
              <OverlapStatusBadge status={overlap.reviewStatus} />
            </div>

            <p className="text-xs text-slate-400 mt-2.5 flex items-center">
              <Building2 className="w-4 h-4 text-cyan-400 mr-1.5 flex-shrink-0" />
              <span>AICTE Permanent ID:</span>
              <strong className="ml-1 text-cyan-300 font-mono">{overlap.aictePermanentId}</strong>
              <span className="mx-2 text-slate-600">•</span>
              <span>Involved Cases:</span>
              <span className="ml-1 font-mono font-bold text-white">{overlap.caseIds?.join(' & ')}</span>
            </p>
          </div>

          {/* Action Buttons */}
          {!isAuditor && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLinkModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan transition-all"
              >
                <Link2 className="w-4 h-4" />
                <span>Link Cases for Coordination</span>
              </button>

              <button
                onClick={() => setAssignModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>Assign Coordinating Officer</span>
              </button>

              <button
                onClick={() => setResolveModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Resolved</span>
              </button>

              <button
                onClick={() => setDismissModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border border-rose-800 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Dismiss as Not Related</span>
              </button>
            </div>
          )}
        </div>

        {/* Explainable Matching Logic Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-200">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h4 className="font-bold text-cyan-300 uppercase tracking-wider flex items-center font-display">
              <AlertTriangle className="w-4 h-4 text-amber-400 mr-2" />
              Automated Detection Analysis & Explainable Correlation:
            </h4>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800">
              Content Similarity Index: {Math.round(overlap.similarityScore * 100)}%
            </span>
          </div>

          <ul className="list-disc list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
            {overlap.matchReasons?.map((reason, idx) => (
              <li key={idx} className="leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>

          {overlap.coordinatingOfficerName && overlap.coordinatingOfficerName !== 'Unassigned' && (
            <p className="mt-4 pt-3 border-t border-cyan-900/50 font-semibold text-slate-300">
              Assigned Coordinating Officer:{' '}
              <span className="text-cyan-400 font-bold">{overlap.coordinatingOfficerName}</span>
            </p>
          )}

          {overlap.reviewRemarks && (
            <p className="mt-2 text-slate-300 italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
              Coordination Remarks: "{overlap.reviewRemarks}"
            </p>
          )}

          {overlap.dismissalReason && (
            <p className="mt-2 text-rose-300 font-medium bg-rose-950/30 p-2.5 rounded-xl border border-rose-800">
              Dismissal Justification: "{overlap.dismissalReason}"
            </p>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison of Overlapping Cases */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider font-display">
          Side-by-Side Case Dossier ({overlap.complaintIds?.length || 0} Parallel Cases)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {overlap.complaintIds?.map((c) => (
            <div
              key={c._id}
              className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 shadow-xl space-y-4 flex flex-col justify-between bg-[#0c1324]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-mono font-bold text-sm text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-xl">
                    {c.caseId}
                  </span>
                  <div className="flex space-x-1.5">
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-bold text-white">{c.subject}</h4>
                  <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed font-sans">
                    {c.description}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Assigned Bureau</span>
                    <strong className="text-cyan-300 font-semibold">{c.assignedBureau}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Complaint Category</span>
                    <span className="font-medium text-slate-200">{c.category}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Investigating Officer</span>
                    <span className="font-medium text-slate-200">
                      {c.assignedOfficerName || c.assignedOfficer?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Date Received</span>
                    <span className="font-mono text-slate-300">
                      {new Date(c.receivedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <Link
                  to={`/complaints/${c._id}`}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2.5 text-xs font-bold rounded-xl glass-panel text-cyan-300 hover:text-white hover:border-cyan-500/50 transition-colors"
                >
                  <span>Open Full Case Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link Cases Modal */}
      <Modal isOpen={linkModal} onClose={() => setLinkModal(false)} title="Link Cases for Cross-Bureau Coordination">
        <form onSubmit={handleLinkCases} className="space-y-4">
          <p className="text-xs text-slate-300">
            Linking these complaints establishes a joint regulatory coordination flag. Investigating officers from both bureaus will share findings and be notified of actions taken on either case.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Coordination Remarks / Joint Committee Mandate *
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Joint inspection scheduled between PGRC and Regulation Bureau to verify allegations collectively..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setLinkModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan"
            >
              {actionLoading ? 'Linking...' : 'Establish Inter-Bureau Coordination'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Coordinator Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Cross-Bureau Coordinating Officer">
        <form onSubmit={handleAssignCoordinator} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Coordinating Officer *</label>
            <select
              required
              value={coordinatingOfficerId}
              onChange={(e) => setCoordinatingOfficerId(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 cursor-pointer"
            >
              <option value="" className="bg-[#0c1324] text-slate-400">-- Choose Authorized Officer --</option>
              {officers.map((off) => (
                <option key={off._id} value={off._id} className="bg-[#0c1324] text-slate-100">
                  {off.name} ({off.role} - {off.bureau})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Review Remarks</label>
            <textarea
              rows={3}
              placeholder="Instructions for coordinating officer..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAssignModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan"
            >
              {actionLoading ? 'Assigning...' : 'Assign Coordinator'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve Overlap Modal */}
      <Modal isOpen={resolveModal} onClose={() => setResolveModal(false)} title="Mark Overlap as Resolved">
        <form onSubmit={handleResolve} className="space-y-4">
          <p className="text-xs text-slate-300">
            Confirm that the parallel proceedings have reached consensus, joint orders have been issued, or cases have concluded without regulatory conflict.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Resolution Summary *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Unified show-cause notice issued; PGRC grievance disposed following compliance report..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setResolveModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
            >
              {actionLoading ? 'Resolving...' : 'Confirm Resolved'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dismiss Overlap Modal */}
      <Modal isOpen={dismissModal} onClose={() => setDismissModal(false)} title="Dismiss Overlap as Not Related">
        <form onSubmit={handleDismiss} className="space-y-4">
          <p className="text-xs text-slate-300">
            If human review determines that these cases concern independent matters requiring no inter-bureau coordination, record a formal justification.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Dismissal Justification (Mandatory) *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Explain why these complaints, although belonging to the same institution, do not warrant shared regulatory coordination..."
              value={dismissalReason}
              onChange={(e) => setDismissalReason(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setDismissModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !dismissalReason.trim()}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-50"
            >
              {actionLoading ? 'Dismissing...' : 'Dismiss Overlap'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
