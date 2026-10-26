import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  User,
  Building2,
  GraduationCap,
  School,
  AlertCircle,
  ArrowRight,
  Globe2,
  Eye,
  EyeOff,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  UserPlus,
  LogIn,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NetworkGlobe3D } from '../components/3d/NetworkGlobe3D';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { notify } from '../hooks/useToast';

export function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('student'); // 'student' | 'faculty' | 'principal' | 'super_admin'
  const [regInstitutionId, setRegInstitutionId] = useState('');
  const [regRollOrEmployeeId, setRegRollOrEmployeeId] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Email verification (OTP)
  const [regOtpCode, setRegOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPreview, setOtpPreview] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Institutions list
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [helpModal, setHelpModal] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoadingInstitutions(true);
        const res = await api.get('/institutions/public-list');
        const list = res.data.data || [];
        setInstitutions(list);
        if (list.length > 0) {
          // Default to Thiagarajar College of Engineering if available
          const tce = list.find(i => i.name.toLowerCase().includes('thiagarajar'));
          setRegInstitutionId(tce ? tce._id : list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load colleges:', err);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    fetchColleges();
  }, []);

  const handleSendOtp = async () => {
    if (!regEmail || !regEmail.includes('@')) {
      setError('Please provide a valid email address first.');
      return;
    }

    try {
      setSendingOtp(true);
      setError('');
      const res = await api.post('/complaints/public/send-otp', {
        email: regEmail.trim(),
        role: regRole,
        name: regName.trim()
      });

      setOtpSent(true);
      setOtpPreview(res.data.data?.otpPreview || '');
      notify(`Verification code sent to ${regEmail}`, 'info');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!regOtpCode || regOtpCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setError('');
      await api.post('/complaints/public/verify-otp', {
        email: regEmail.trim(),
        otpCode: regOtpCode.trim()
      });

      setEmailVerified(true);
      notify('Email verified successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Login failed. Incorrect email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const selectedCollege = institutions.find(i => i._id === regInstitutionId);

      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        institutionId: regInstitutionId,
        institutionName: selectedCollege ? selectedCollege.name : '',
        rollOrEmployeeId: regRollOrEmployeeId.trim(),
        department: regDepartment.trim(),
        otpCode: regOtpCode.trim()
      });

      setSuccessMsg('Account created successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 700);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please check your information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060912] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-cyber-grid pointer-events-none opacity-40" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl glass-panel rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] bg-[#090e1d]">
        {/* Left Side: Overview & 3D Visualizer */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-slate-950/90 via-[#0a1122]/70 to-[#070d1a]/95">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow-cyan">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 block uppercase">
                  COLLEGE GRIEVANCE PORTAL
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Tamil Nadu Technical Institutions
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight font-display leading-tight">
              Student, Faculty & College Complaint System
            </h1>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Role-based grievance redressal platform where students and teachers submit complaints, and college principals oversee their institution.
            </p>
          </div>

          {/* 3D Visualizer */}
          <div className="my-2 relative flex items-center justify-center">
            <NetworkGlobe3D height="220px" />
          </div>

          {/* Role Summary Badges */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center space-x-1.5 font-bold">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Students</span>
              </span>
              <span className="text-[11px] text-slate-400">View only their own complaints</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center space-x-1.5 font-bold">
                <School className="w-4 h-4 text-purple-400" />
                <span>Teachers</span>
              </span>
              <span className="text-[11px] text-slate-400">View only their own complaints</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-300 flex items-center space-x-1.5 font-bold">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Principals</span>
              </span>
              <span className="text-[11px] text-slate-400">View all complaints for their college</span>
            </div>
          </div>
        </div>

        {/* Right Side: Simple Sign In & Register Console */}
        <div className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between bg-[#080d19]/95 backdrop-blur-xl">
          <div>
            {/* Top Switcher */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white font-display tracking-tight">
                  {mode === 'login' ? 'Sign In to Your Account' : 'Register New Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'login' ? 'Select your credentials to access your dashboard' : 'Create an account as Student, Teacher, or Principal'}
                </p>
              </div>
              <div className="p-2.5 rounded-2xl bg-cyan-950/70 border border-cyan-800/50 text-cyan-400">
                {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-[#090e1a] p-1 border border-slate-800/90 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. student@tce.edu or principal@tce.edu"
                      className="w-full pl-10 pr-4 py-3 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setHelpModal(true)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      Need Help?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Remember my login</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-cyan transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-3 cursor-pointer"
                >
                  <span>{loading ? 'Verifying Account...' : 'Sign In to Dashboard'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Don't have an account? <span className="font-bold text-cyan-400 underline">Register here</span>
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                {/* Role Selector Tabs */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    I am registering as:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('student')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-1 ${
                        regRole === 'student'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                          : 'bg-[#0d1424] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('faculty')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-1 ${
                        regRole === 'faculty'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-glow-cyan'
                          : 'bg-[#0d1424] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <School className="w-4 h-4" />
                      <span>Teacher</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('principal')}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center space-y-1 ${
                        regRole === 'principal'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-glow-cyan'
                          : 'bg-[#0d1424] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Principal</span>
                    </button>
                  </div>
                </div>

                {/* College Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Select Your College *
                  </label>
                  <select
                    required
                    value={regInstitutionId}
                    onChange={(e) => setRegInstitutionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl text-slate-100 bg-[#0d1527] border border-slate-700/80 focus:border-cyan-400 transition-all"
                  >
                    {loadingInstitutions ? (
                      <option value="">Loading Tamil Nadu colleges...</option>
                    ) : (
                      institutions.map((inst) => (
                        <option key={inst._id} value={inst._id}>
                          {inst.name} ({inst.district})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={regRole === 'student' ? 'e.g. Praveen Kumar' : 'e.g. Dr. S. K. Narayanan'}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      {regRole === 'student' ? 'Roll / Reg Number *' : (regRole === 'faculty' ? 'Faculty ID *' : 'Staff Code *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={regRollOrEmployeeId}
                      onChange={(e) => setRegRollOrEmployeeId(e.target.value)}
                      placeholder={regRole === 'student' ? 'e.g. 21CS042' : 'e.g. FAC-1049'}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                {/* Email & OTP Verification */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setEmailVerified(false);
                          setOtpSent(false);
                        }}
                        placeholder="e.g. name@tce.edu"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 font-mono"
                      />
                    </div>

                    {!emailVerified ? (
                      <button
                        type="button"
                        disabled={sendingOtp || !regEmail}
                        onClick={handleSendOtp}
                        className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center space-x-1 flex-shrink-0 disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{sendingOtp ? 'Sending...' : (otpSent ? 'Resend' : 'Send Code')}</span>
                      </button>
                    ) : (
                      <span className="px-3 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-[11px] flex items-center space-x-1 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {otpSent && !emailVerified && (
                    <div className="mt-2 p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={regOtpCode}
                          onChange={(e) => setRegOtpCode(e.target.value)}
                          placeholder="6-digit code"
                          className="w-28 px-2 py-1 text-xs text-center font-mono rounded-lg bg-[#070c18] border border-cyan-500 text-white"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                        >
                          Confirm
                        </button>
                      </div>
                      {otpPreview && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Code: <strong>{otpPreview}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Password (min 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-cyan transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>{loading ? 'Creating Account...' : `Register as ${regRole === 'student' ? 'Student' : (regRole === 'faculty' ? 'Teacher' : 'Principal')}`}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Already have an account? <span className="font-bold text-cyan-400 underline">Sign in here</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={helpModal}
        onClose={() => setHelpModal(false)}
        title="College Complaint Portal Assistance"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Welcome to the Tamil Nadu Technical Colleges Grievance Redressal System.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
              How Access Works:
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-400 text-[11px]">
              <li><strong>Students:</strong> Register with your college & student roll number. You can only view complaints you submit.</li>
              <li><strong>Teachers:</strong> Register with your college & faculty ID. You can only view complaints you submit.</li>
              <li><strong>Principals:</strong> Register as Principal of your college. You can view all complaints filed by students and teachers of your college.</li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setHelpModal(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-200 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
