import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  School,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  Building2,
  User,
  Hash,
  BookOpen,
  FileText,
  Phone,
  Layers,
  Sparkles,
  Lock,
  ArrowLeft,
  Search,
  KeyRound
} from 'lucide-react';
import api from '../services/api';
import { notify } from '../hooks/useToast';
import { NetworkGlobe3D } from '../components/3d/NetworkGlobe3D';

export function PublicComplaintPage() {
  const navigate = useNavigate();

  // Complainant role: 'Student' | 'Faculty'
  const [complainantType, setComplainantType] = useState('Student');

  // Form Fields
  const [complainantName, setComplainantName] = useState('');
  const [complainantEmail, setComplainantEmail] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complainantIdNumber, setComplainantIdNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [institutionId, setInstitutionId] = useState('');
  const [category, setCategory] = useState('Student Grievances');
  const [priority, setPriority] = useState('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Email OTP Validation state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Institutions state
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        const res = await api.get('/institutions/public-list');
        const list = res.data.data || [];
        setInstitutions(list);
        if (list.length > 0) {
          // Preselect Thiagarajar College of Engineering if present, else first
          const tce = list.find(i => i.name.toLowerCase().includes('thiagarajar'));
          setInstitutionId(tce ? tce._id : list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchInstitutions();
  }, []);

  // Set category default based on role
  useEffect(() => {
    if (complainantType === 'Student') {
      setCategory('Student Grievances');
    } else {
      setCategory('Academic Issues');
    }
  }, [complainantType]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!complainantEmail || !complainantEmail.includes('@')) {
      setOtpError('Please enter a valid institutional or personal email address.');
      return;
    }

    try {
      setSendingOtp(true);
      setOtpError('');
      const res = await api.post('/complaints/public/send-otp', {
        email: complainantEmail.trim(),
        role: complainantType,
        name: complainantName.trim()
      });

      setOtpSent(true);
      setOtpPreview(res.data.data?.otpPreview || '');
      notify(`Verification code dispatched to ${complainantEmail}`, 'info');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to dispatch verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpError('');
      await api.post('/complaints/public/verify-otp', {
        email: complainantEmail.trim(),
        otpCode: otpCode.trim()
      });

      setEmailVerified(true);
      notify('Email validated successfully! You may now submit your grievance.', 'success');
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Handle Complaint Submission
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setOtpError('You must authenticate your email address before submitting.');
      notify('Please complete email validation first.', 'error');
      return;
    }

    if (!complainantName.trim() || !institutionId || !subject.trim() || !description.trim()) {
      notify('Please fill in all mandatory grievance information.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/complaints/public', {
        complainantType,
        complainantName: complainantName.trim(),
        complainantEmail: complainantEmail.trim(),
        complainantPhone: complainantPhone.trim(),
        complainantIdNumber: complainantIdNumber.trim(),
        department: department.trim(),
        institutionId,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        otpCode: otpCode.trim()
      });

      setSubmissionResult(res.data.data);
      notify(`Grievance registered! Tracking Case ID: ${res.data.data.caseId}`, 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to lodge grievance.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedInstitution = institutions.find(i => i._id === institutionId);

  // SUCCESS ACKNOWLEDGMENT VIEW
  if (submissionResult) {
    return (
      <div className="min-h-screen bg-[#060912] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="max-w-2xl w-full glass-panel-elevated rounded-3xl border border-emerald-500/40 p-8 sm:p-10 shadow-2xl bg-[#0a1222] text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-3xl flex items-center justify-center mx-auto shadow-glow-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-800">
              GRIEVANCE OFFICIALLY LODGED & VALIDATED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-3">
              Case Record: {submissionResult.caseId}
            </h1>
            <p className="text-xs text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Your grievance has been encrypted, assigned to the AICTE Public Grievance Redressal Cell (PGRC), and cross-referenced with Central Regulatory Intelligence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Complainant:</span>
              <span className="text-slate-100 font-bold">{complainantName} ({complainantType})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Validated Email:</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{complainantEmail}</span>
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Institution:</span>
              <span className="text-cyan-300 font-bold truncate max-w-xs">{selectedInstitution?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Regulatory Category:</span>
              <span className="text-slate-200">{category}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Overlap Engine Status:</span>
              <span className="text-cyan-400 font-bold">
                {submissionResult.detectedOverlapsCount > 0
                  ? `Correlated with ${submissionResult.detectedOverlapsCount} pattern(s)`
                  : 'Zero existing duplicates'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/track-complaint?caseId=${submissionResult.caseId}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan flex items-center justify-center space-x-2"
            >
              <span>Track Grievance Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => {
                setSubmissionResult(null);
                setSubject('');
                setDescription('');
                setEmailVerified(false);
                setOtpSent(false);
                setOtpCode('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl glass-panel text-slate-300 hover:text-white font-bold text-xs"
            >
              Lodge Another Grievance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>AICTE Sentinel Portal Login</span>
          </Link>

          <Link
            to="/track-complaint"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Existing Case ID</span>
          </Link>
        </div>

        {/* Portal Header */}
        <div className="glass-panel rounded-3xl border border-slate-700/70 p-6 sm:p-8 bg-gradient-to-r from-[#090f20] via-[#0b1428] to-[#070d1c] shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/60">
                  PUBLIC GRIEVANCE REDRESSAL PORTAL
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Southern Regional Office (Tamil Nadu)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                Student & Faculty Grievance Submission Portal
              </h1>
              <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Direct statutory grievance channel for verified students and teaching faculty across accredited Tamil Nadu technical institutions, featuring cryptographic OTP email validation and AICTE central dossier tracking.
              </p>
            </div>

            {/* Complainant Role Selector */}
            <div className="bg-[#060a14] p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setComplainantType('Student')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  complainantType === 'Student'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>I am a Student</span>
              </button>

              <button
                type="button"
                onClick={() => setComplainantType('Faculty')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  complainantType === 'Faculty'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <School className="w-4 h-4" />
                <span>I am a Teacher / Faculty</span>
              </button>
            </div>
          </div>
        </div>

        {/* Complaint Form */}
        <form onSubmit={handleSubmitComplaint} className="space-y-6">
          {/* Section 1: Academic Identity */}
          <div className="glass-panel rounded-3xl border border-slate-700/60 p-6 sm:p-8 bg-[#090e1d] shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <User className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-extrabold text-white font-display">
                1. {complainantType} Identification Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  placeholder={complainantType === 'Student' ? 'e.g. Praveen Kumar' : 'e.g. Dr. S. Radhakrishnan'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-slate-700 focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  {complainantType === 'Student' ? 'Student Roll / Registration No. *' : 'Faculty Employee Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={complainantIdNumber}
                  onChange={(e) => setComplainantIdNumber(e.target.value)}
                  placeholder={complainantType === 'Student' ? 'e.g. 21CS042' : 'e.g. FAC-TCE-1049'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-slate-700 focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Academic Department *
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-slate-700 focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Select Accredited Tamil Nadu Institution *
                </label>
                <select
                  required
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl text-slate-100 bg-[#0d1527] border border-slate-700 focus:border-cyan-400"
                >
                  {loadingInstitutions ? (
                    <option value="">Loading institutions registry...</option>
                  ) : (
                    institutions.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name} ({inst.district}, Tamil Nadu - {inst.aictePermanentId})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={complainantPhone}
                  onChange={(e) => setComplainantPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-slate-700 focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Email Validation & OTP Confirmation */}
          <div className="glass-panel rounded-3xl border border-cyan-800/50 p-6 sm:p-8 bg-[#091124] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white font-display">
                  2. Official Email Validation & Verification
                </h3>
              </div>

              {emailVerified && (
                <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-xs font-bold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Authenticated & Verified</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              To prevent fraudulent submissions, an official 6-digit confirmation OTP is issued to verify your institutional or personal email before the grievance enters the AICTE registry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-7">
                <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                  Official / Academic Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    disabled={emailVerified}
                    value={complainantEmail}
                    onChange={(e) => {
                      setComplainantEmail(e.target.value);
                      setEmailVerified(false);
                      setOtpSent(false);
                    }}
                    placeholder={complainantType === 'Student' ? 'student@tce.edu' : 'faculty@tce.edu'}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070c18] border border-slate-700 focus:border-cyan-400 font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="sm:col-span-5">
                {!emailVerified ? (
                  <button
                    type="button"
                    disabled={sendingOtp || !complainantEmail}
                    onClick={handleSendOtp}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>{sendingOtp ? 'Dispatching Code...' : (otpSent ? 'Resend Verification Code' : 'Send Verification Code')}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Identity Confirmed</span>
                  </div>
                )}
              </div>
            </div>

            {/* OTP Entry Card */}
            {otpSent && !emailVerified && (
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/80 space-y-3 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-xs text-cyan-300 font-bold">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span>Enter 6-Digit Verification Code sent to {complainantEmail}:</span>
                  </div>

                  {otpPreview && (
                    <span className="text-[11px] font-mono text-cyan-400 bg-[#070f22] px-2.5 py-1 rounded-lg border border-cyan-700/60">
                      Sandbox Code: <strong className="text-white tracking-widest">{otpPreview}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="••••••"
                    className="w-44 px-4 py-2 text-center tracking-[0.4em] font-mono text-sm font-extrabold rounded-xl text-white bg-[#060b17] border border-cyan-500/80 focus:border-cyan-300"
                  />

                  <button
                    type="button"
                    disabled={verifyingOtp || otpCode.trim().length !== 6}
                    onClick={handleVerifyOtp}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald disabled:opacity-50 cursor-pointer"
                  >
                    {verifyingOtp ? 'Verifying...' : 'Confirm & Validate Email'}
                  </button>
                </div>

                {otpError && (
                  <div className="text-xs text-rose-400 flex items-center space-x-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Grievance Details */}
          <div className="glass-panel rounded-3xl border border-slate-700/60 p-6 sm:p-8 bg-[#090e1d] shadow-xl space-y-5">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-extrabold text-white font-display">
                3. Grievance Substance & Classification
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Complaint Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl text-slate-100 bg-[#0d1527] border border-slate-700 focus:border-cyan-400"
                >
                  <option value="Student Grievances">Student Grievances (Hostel, Ragging, Facilities)</option>
                  <option value="Academic Issues">Academic Issues (Curriculum, Labs, Faculty)</option>
                  <option value="Infrastructure">Infrastructure & Campus Facilities</option>
                  <option value="Faculty and Staffing">Faculty and Staffing Deficiencies</option>
                  <option value="Admission and Fee Issues">Admission and Fee Issues</option>
                  <option value="Examination-Related Issues">Examination-Related Issues</option>
                  <option value="Regulatory Compliance">Regulatory & Mandatory Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Urgency / Priority Level *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl text-slate-100 bg-[#0d1527] border border-slate-700 focus:border-cyan-400"
                >
                  <option value="Medium">Standard / Medium Urgency (30 Days Disposal)</option>
                  <option value="High">High Urgency (15 Days Disposal)</option>
                  <option value="Critical">Critical / Immediate Statutory Attention</option>
                  <option value="Low">Low / Administrative Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Grievance Title / Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue (e.g. Non-accredited lab equipment in Electrical department)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-slate-700 focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Detailed Grievance Narrative *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive narrative of your grievance, including dates, specific locations, affected departments, and previous internal representations made to the institution..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#070b16] border border-slate-700 focus:border-cyan-400 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Submit Action Card */}
          <div className="glass-panel rounded-3xl border border-slate-700/60 p-6 bg-[#090e1a] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                Protected under Whistleblower & Academic Grievance Regulations. Transmitted via 256-Bit TLS encryption.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || !emailVerified}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-glow-cyan transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Transmitting to AICTE Dossier...' : 'Submit Official Grievance'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
