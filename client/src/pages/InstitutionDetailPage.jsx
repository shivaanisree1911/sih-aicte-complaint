import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  AlertTriangle,
  Plus,
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { OverlapBanner } from '../components/complaints/OverlapBanner';
import { notify } from '../hooks/useToast';

export function InstitutionDetailPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [overlaps, setOverlaps] = useState([]);

  useEffect(() => {
    const fetchInstitutionData = async () => {
      try {
        setLoading(true);
        const [instRes, compRes, overRes] = await Promise.all([
          api.get(`/institutions/${id}`),
          api.get(`/institutions/${id}/complaints`),
          api.get(`/overlaps?search=${id}`)
        ]);

        setInstitution(instRes.data.data.institution);
        setMetrics(instRes.data.data.metrics);
        setComplaints(compRes.data.data.complaints || []);
        setOverlaps(overRes.data.data.items || []);
      } catch (err) {
        console.error('Failed to load institution details:', err);
        notify('Failed to load institution profile.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutionData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Retrieving Tamil Nadu institution dossier..." />;
  }

  if (!institution) {
    return (
      <EmptyState
        title="Institution Not Found"
        description="The requested institution record does not exist or has been removed."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/institutions"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tamil Nadu Institutions Directory</span>
        </Link>
      </div>

      {/* Active Cross-Bureau Overlap Alerts Banner if any */}
      <OverlapBanner overlaps={overlaps} />

      {/* Institution Dossier Card */}
      <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl bg-[#0c1324]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl flex-shrink-0 shadow-glow-cyan">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <h1 className="text-xl font-extrabold text-white font-display">{institution.name}</h1>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  AICTE ID: {institution.aictePermanentId}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-xl text-xs font-bold ${
                    institution.institutionStatus === 'Approved'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : institution.institutionStatus === 'Under Scrutiny'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  }`}
                >
                  {institution.institutionStatus}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 flex items-center">
                <MapPin className="w-4 h-4 text-cyan-400 mr-1.5 flex-shrink-0" />
                <span>{institution.address}, {institution.district}, {institution.state} (Southern Regional Office Jurisdiction)</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                {institution.contactDetails?.phone && (
                  <span className="flex items-center font-mono">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                    {institution.contactDetails.phone}
                  </span>
                )}
                {institution.contactDetails?.email && (
                  <span className="flex items-center">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                    {institution.contactDetails.email}
                  </span>
                )}
                {institution.contactDetails?.principalName && (
                  <span className="flex items-center">
                    Principal: <strong className="ml-1 text-slate-200">{institution.contactDetails.principalName}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <Link
              to={`/complaints/new?institutionId=${institution._id}`}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Complaint</span>
            </Link>
          </div>
        </div>

        {/* Institution Stats Row */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
          <div className="p-3.5 rounded-2xl glass-panel bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Complaints</span>
            <p className="text-2xl font-black text-white mt-0.5">{metrics?.totalComplaints || 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-panel bg-amber-950/20 border border-amber-800/40">
            <span className="text-xs text-amber-400 font-medium">Active Grievances</span>
            <p className="text-2xl font-black text-amber-300 mt-0.5">{metrics?.activeComplaints || 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl glass-panel bg-emerald-950/20 border border-emerald-800/40">
            <span className="text-xs text-emerald-400 font-medium">Disposed Cases</span>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">{metrics?.disposedComplaints || 0}</p>
          </div>
        </div>
      </div>

      {/* Linked Complaints History */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Complete Complaint & Case Dossier</h3>
            <p className="text-xs text-slate-400">Chronological registry of all past and ongoing regulatory actions for this institution</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            {complaints.length} Records
          </span>
        </div>

        {complaints.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No complaints recorded for this institution in the central registry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-mono">Case ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Bureau</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Received Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {c.caseId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-100 max-w-sm truncate">
                      {c.subject}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {c.category}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-300">
                      {c.assignedBureau}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {new Date(c.receivedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg glass-panel text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
