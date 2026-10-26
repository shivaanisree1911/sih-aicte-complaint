import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  User,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Upload,
  Download,
  Plus,
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  Edit,
  Layers,
  Sparkles,
  Shield,
  FileCheck,
  Send
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Timeline } from '../components/complaints/Timeline';
import { OverlapBanner } from '../components/complaints/OverlapBanner';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { notify } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { BUREAUS, COMPLAINT_STATUSES, ROLES } from '../utils/constants';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [overlaps, setOverlaps] = useState([]);
  const [officers, setOfficers] = useState([]);

  // Modals
  const [assignModal, setAssignModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [remarkModal, setRemarkModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  // Form states
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [newBureau, setNewBureau] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.data.complaint);
      setHistory(res.data.data.history || []);
      setOverlaps(res.data.data.overlaps || []);
    } catch (err) {
      console.error('Failed to load complaint:', err);
      notify('Failed to load complaint dossier.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await api.get('/admin/users?limit=50');
      setOfficers(res.data.data.items || []);
    } catch {
      // Non-critical if user lacks admin query permission
    }
  };

  useEffect(() => {
    fetchComplaintData();
    fetchOfficers();
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.patch(`/complaints/${id}/assign`, {
        officerId: selectedOfficer,
        remarks: modalRemarks
      });
      notify('Officer assigned successfully.', 'success');
      setAssignModal(false);
      setModalRemarks('');
      fetchComplaintData();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to assign officer.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!newBureau) return;
    try {
      setActionLoading(true);
      await api.patch(`/complaints/${id}/transfer`, {
        newBureau,
        remarks: modalRemarks
      });
      notify(`Complaint successfully transferred to ${newBureau}.`, 'success');
      setTransferModal(false);
      setModalRemarks('');
      fetchComplaintData();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to transfer complaint.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    try {
      setActionLoading(true);
      await api.patch(`/complaints/${id}/status`, {
        status: newStatus,
        remarks: modalRemarks
      });
      notify(`Status transitioned to ${newStatus}.`, 'success');
      setStatusModal(false);
      setModalRemarks('');
      fetchComplaintData();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!window.confirm('Are you sure you want to escalate this complaint to Senior Management?')) return;
    try {
      await api.post(`/complaints/${id}/escalate`, {
        remarks: 'Direct regulatory escalation initiated from case command console.'
      });
      notify('Case successfully escalated to Senior Management!', 'success');
      fetchComplaintData();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to escalate case.', 'error');
    }
  };

  const handleAddRemark = async (e) => {
    e.preventDefault();
    if (!modalRemarks.trim()) return;
    try {
      setActionLoading(true);
      await api.post(`/complaints/${id}/remarks`, { remarks: modalRemarks });
      notify('Remark recorded in case timeline.', 'success');
      setRemarkModal(false);
      setModalRemarks('');
      fetchComplaintData();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to record remark.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const data = new FormData();
    data.append('document', uploadFile);

    try {
      setActionLoading(true);
      await api.post(`/complaints/${id}/documents`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify('Supporting document uploaded and logged.', 'success');
      setUploadModal(false);
      setUploadFile(null);
      fetchComplaintData();
    } catch (err) {
      notify(err.response?.data?.message || 'File upload failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving complaint dossier and chronology..." />;
  }

  if (!complaint) {
    return (
      <EmptyState
        title="Case Not Found"
        description="The requested complaint record does not exist."
      />
    );
  }

  const isAuditor = user?.role === ROLES.AUDITOR;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/complaints"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints Central Dossier</span>
        </Link>
        <span className="font-mono text-xs font-bold px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800 rounded-xl shadow-glow-cyan">
          {complaint.caseId}
        </span>
      </div>

      {/* Cross-Bureau Overlap Alerts Banner */}
      <OverlapBanner overlaps={overlaps} />

      {/* Case Overview Card */}
      <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl bg-[#0c1324]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-xl font-extrabold text-white font-display tracking-tight leading-snug">
                {complaint.subject}
              </h1>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <div className="mt-3 flex items-center space-x-2 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <Link
                to={`/institutions/${complaint.institutionId}`}
                className="font-bold text-slate-100 hover:text-cyan-400 transition-colors"
              >
                {complaint.institutionName}
              </Link>
              <span className="font-mono text-cyan-400">({complaint.aictePermanentId})</span>
            </div>

            {/* Complainant Identity & Verification Dossier */}
            <div className="mt-3 p-3 rounded-xl bg-[#090f1e] border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] text-slate-400 uppercase">Complainant:</span>
                <span className="font-bold text-white flex items-center space-x-1">
                  <span>{complaint.complainantType === 'Faculty' ? '👨‍🏫' : '🎓'}</span>
                  <span>{complaint.complainantName || 'Anonymous Complainant'}</span>
                  <span className="text-slate-400 font-normal">({complaint.complainantType || 'Student'})</span>
                </span>
              </div>

              {complaint.complainantEmail && (
                <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-cyan-300">{complaint.complainantEmail}</span>
                  {complaint.emailVerified ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold">
                      ✓ Authenticated via OTP
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800">
                      Unverified
                    </span>
                  )}
                </div>
              )}

              {complaint.complainantIdNumber && (
                <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-300">
                  <span className="text-slate-400">ID / Roll:</span>
                  <span className="text-slate-100">{complaint.complainantIdNumber}</span>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              <h4 className="font-bold text-cyan-400 mb-1 uppercase tracking-wider text-[11px]">
                Allegation / Grievance Summary:
              </h4>
              <p>{complaint.description}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          {!isAuditor && (
            <div className="flex flex-wrap lg:flex-col gap-2 min-w-[200px]">
              <button
                onClick={() => setStatusModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Update Status</span>
              </button>

              <button
                onClick={() => setAssignModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assign Officer</span>
              </button>

              <button
                onClick={() => setTransferModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-800 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Transfer Bureau</span>
              </button>

              <button
                onClick={handleEscalate}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border border-rose-800 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Escalate Case</span>
              </button>

              <button
                onClick={() => setRemarkModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-200 hover:text-white hover:border-slate-500 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Remark</span>
              </button>

              <button
                onClick={() => setUploadModal(true)}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-200 hover:text-white hover:border-cyan-500/50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Attach Evidence</span>
              </button>
            </div>
          )}
        </div>

        {/* Case Metadata Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Assigned Bureau</span>
            <p className="font-bold text-cyan-300 mt-1">{complaint.assignedBureau}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Investigating Officer</span>
            <p className="font-bold text-slate-200 mt-1">{complaint.assignedOfficerName || 'Unassigned'}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Date Received</span>
            <p className="font-bold text-slate-200 mt-1 font-mono">
              {new Date(complaint.receivedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-slate-400 font-medium">Statutory Disposal Target</span>
            <p className="font-bold text-slate-200 mt-1 font-mono">
              {complaint.expectedDisposalDate
                ? new Date(complaint.expectedDisposalDate).toLocaleDateString()
                : 'Not Set'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Timeline History & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chronological Action History Timeline */}
        <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-700/80 p-6 shadow-xl bg-[#0c1324]">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                Chronological Case History & Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable, append-only ledger of regulatory actions, officer assignments, and transfers
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800">
              {history.length} Actions Logged
            </span>
          </div>

          <Timeline history={history} />
        </div>

        {/* Supporting Documents Vault */}
        <div className="glass-panel rounded-3xl border border-slate-700/80 p-6 shadow-xl bg-[#0c1324] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-display">Attached Evidence</h3>
              <button
                onClick={() => setUploadModal(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
              >
                + Upload
              </button>
            </div>

            {(!complaint.documents || complaint.documents.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500 font-sans">
                No supporting evidentiary documents uploaded for this case dossier yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {complaint.documents.map((doc, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 truncate mr-2">
                      <Paperclip className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {doc.originalName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || '/api'}/complaints/${complaint._id}/documents/${doc.documentId || doc._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-cyan-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Download Secure Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 bg-cyan-950/20 rounded-xl border border-cyan-800/40 text-[11px] text-cyan-300 mt-4 font-mono">
            All document downloads require active AICTE token authentication.
          </div>
        </div>
      </div>

      {/* Assign Officer Modal */}
      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Investigating Officer">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Investigating Officer *</label>
            <select
              required
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Assignment Mandate / Instructions</label>
            <textarea
              rows={3}
              placeholder="Instructions or mandate for the assigned officer..."
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
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
              {actionLoading ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Bureau Modal */}
      <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="Transfer Complaint Bureau">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Destination Bureau / Cell *</label>
            <select
              required
              value={newBureau}
              onChange={(e) => setNewBureau(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 cursor-pointer"
            >
              <option value="" className="bg-[#0c1324] text-slate-400">-- Select Target Bureau --</option>
              {BUREAUS.filter((b) => b !== complaint.assignedBureau).map((b) => (
                <option key={b} value={b} className="bg-[#0c1324] text-slate-100">
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Statutory Transfer Justification *</label>
            <textarea
              required
              rows={3}
              placeholder="State regulatory rationale for cross-bureau transfer..."
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setTransferModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md"
            >
              {actionLoading ? 'Transferring...' : 'Execute Inter-Bureau Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Transition Case Regulatory Status">
        <form onSubmit={handleStatusChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Regulatory Status *</label>
            <select
              required
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 cursor-pointer"
            >
              <option value="" className="bg-[#0c1324] text-slate-400">-- Select New Status --</option>
              {COMPLAINT_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#0c1324] text-slate-100">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Decision & Investigation Remarks</label>
            <textarea
              rows={3}
              placeholder="Explain committee decision, findings, or disposal orders..."
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStatusModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan"
            >
              {actionLoading ? 'Updating...' : 'Commit Status Transition'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Remarks Modal */}
      <Modal isOpen={remarkModal} onClose={() => setRemarkModal(false)} title="Record Case Action Remark">
        <form onSubmit={handleAddRemark} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Remarks *</label>
            <textarea
              required
              rows={4}
              placeholder="Enter official investigation update, meeting note, or stakeholder communication..."
              value={modalRemarks}
              onChange={(e) => setModalRemarks(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setRemarkModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan"
            >
              {actionLoading ? 'Recording...' : 'Commit Remark'}
            </button>
          </div>
        </form>
      </Modal>

      {/* File Upload Modal */}
      <Modal isOpen={uploadModal} onClose={() => setUploadModal(false)} title="Attach Supporting Evidence Document">
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Document File *</label>
            <input
              type="file"
              required
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-200 bg-[#090e1a] border border-slate-700/80 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Accepted: PDF, Images, Word DOC/DOCX, Excel (Max 10MB)</p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setUploadModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading || !uploadFile}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan disabled:opacity-50"
            >
              {actionLoading ? 'Uploading...' : 'Upload & Encrypt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
