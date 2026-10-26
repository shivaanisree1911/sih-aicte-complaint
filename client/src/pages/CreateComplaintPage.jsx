import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FilePlus,
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Shield,
  Phone,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { notify } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { BUREAUS, COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, ROLES } from '../utils/constants';

export function CreateComplaintPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const [institutionId, setInstitutionId] = useState(searchParams.get('institutionId') || user?.institutionId || '');
  const [complainantType, setComplainantType] = useState(user?.role === ROLES.FACULTY ? 'Faculty' : 'Student');
  const [complainantName, setComplainantName] = useState(user?.name || '');
  const [complainantEmail, setComplainantEmail] = useState(user?.email || '');
  const [complainantIdNumber, setComplainantIdNumber] = useState(user?.rollOrEmployeeId || '');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [assignedBureau, setAssignedBureau] = useState(BUREAUS[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [expectedDisposalDate, setExpectedDisposalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        const res = await api.get('/institutions?limit=100');
        const list = res.data.data.items || [];
        setInstitutions(list);
        if (!institutionId && list.length > 0) {
          if (user?.institutionId) {
            setInstitutionId(user.institutionId);
          } else {
            const tce = list.find(i => i.name.toLowerCase().includes('thiagarajar'));
            setInstitutionId(tce ? tce._id : list[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, []);

  const selectedInstObj = institutions.find(i => i._id === institutionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institutionId || !subject || !description) {
      notify('Please fill in all mandatory fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/complaints', {
        institutionId,
        complainantType,
        complainantName: complainantName.trim() || 'Anonymous Complainant',
        complainantEmail: complainantEmail.trim(),
        complainantIdNumber: complainantIdNumber.trim(),
        category,
        priority,
        assignedBureau,
        subject,
        description,
        expectedDisposalDate
      });

      const { complaint, detectedOverlapsCount } = res.data.data;
      setCreatedResult({ complaint, detectedOverlapsCount });
      notify(`Case ${complaint.caseId} recorded successfully!`, 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to register complaint.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdResult) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 animate-fade-in">
        <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl text-center bg-[#0d1424]">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-emerald">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white font-display">Complaint Logged Successfully</h2>
          <p className="text-xs text-slate-400 mt-1">
            Assigned Permanent Case Tracking Dossier:
          </p>
          <div className="inline-block mt-2 px-4 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 font-mono text-cyan-300 font-bold text-sm tracking-wide">
            {createdResult.complaint.caseId}
          </div>

          {/* Overlap Engine Alert if Overlaps Detected */}
          {createdResult.detectedOverlapsCount > 0 ? (
            <div className="mt-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-left">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                    Potential Cross-Bureau Overlap Flagged! ({createdResult.detectedOverlapsCount} concurrent case)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    The AICTE Automated Conflict Engine flagged concurrent active proceedings for this institution across multiple Bureaus. Joint coordination has been triggered.
                  </p>
                  <div className="mt-3">
                    <Link
                      to="/overlaps"
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose transition-all"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Review Overlap Dossier</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              No concurrent cross-bureau conflicts detected for this institution at this time.
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-3">
            <Link
              to={`/complaints/${createdResult.complaint._id}`}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan transition-all"
            >
              Open Full Case Dossier
            </Link>
            <Link
              to="/complaints"
              className="px-5 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              Return to Registry
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/complaints"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>
      </div>

      <div className="glass-panel-elevated rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl bg-[#0c1324]">
        <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-5 mb-6">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl shadow-glow-cyan">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white font-display tracking-tight">
              Lodge a Complaint
            </h1>
            <p className="text-xs text-slate-400">
              Submit your official grievance for institutional review and resolution
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* College Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
              Associated College (Tamil Nadu) *
            </label>
            <select
              required
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl font-medium focus:ring-1 focus:ring-cyan-400 text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
            >
              <option value="" className="bg-[#0c1324] text-slate-400">
                -- Select Institution from Tamil Nadu Registry --
              </option>
              {institutions.map((inst) => (
                <option key={inst._id} value={inst._id} className="bg-[#0c1324] text-slate-100 py-1.5">
                  {inst.name} ({inst.aictePermanentId} - {inst.district}, Tamil Nadu)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Institution Telemetry Card */}
          {selectedInstObj && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{selectedInstObj.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedInstObj.aictePermanentId}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{selectedInstObj.district}, {selectedInstObj.state}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{selectedInstObj.contactDetails?.principalName || 'Principal'}</span>
                  </span>
                  {selectedInstObj.contactDetails?.phone && (
                    <span className="flex items-center space-x-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{selectedInstObj.contactDetails.phone}</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  selectedInstObj.institutionStatus === 'Approved'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : selectedInstObj.institutionStatus === 'Under Scrutiny'
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                }`}>
                  {selectedInstObj.institutionStatus}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                Complaint Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 glass-input rounded-xl font-medium focus:ring-1 focus:ring-cyan-400 text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0c1324] text-slate-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs p-3 glass-input rounded-xl font-medium focus:ring-1 focus:ring-cyan-400 text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-[#0c1324] text-slate-100">
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Bureau */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
                Assigned Bureau / Cell *
              </label>
              <select
                value={assignedBureau}
                onChange={(e) => setAssignedBureau(e.target.value)}
                className="w-full text-xs p-3 glass-input rounded-xl font-bold text-cyan-300 focus:ring-1 focus:ring-cyan-400 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                {BUREAUS.map((b) => (
                  <option key={b} value={b} className="bg-[#0c1324] text-slate-100">
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
              Grievance Subject / Core Allegation *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Deficient computer laboratories and structural safety hazards..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
              Detailed Description & Regulatory Evidence *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Provide comprehensive details of the grievance, affected stakeholders (students, faculty), regulatory provisions involved, and supporting documentation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 leading-relaxed font-sans"
            />
          </div>

          {/* Expected Disposal Date */}
          <div className="max-w-xs">
            <label className="block text-xs font-bold text-slate-200 mb-1.5 uppercase tracking-wider">
              Statutory Disposal Target Date
            </label>
            <input
              type="date"
              value={expectedDisposalDate}
              onChange={(e) => setExpectedDisposalDate(e.target.value)}
              className="w-full text-xs p-3 glass-input rounded-xl focus:ring-1 focus:ring-cyan-400 text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-800">
            <Link
              to="/complaints"
              className="px-5 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-glow-cyan transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>{submitting ? 'Registering into Central Vault...' : 'Register Complaint in AICTE Registry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
