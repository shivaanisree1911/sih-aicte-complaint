import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpRight,
  Layers,
  Activity,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Radio,
  Cpu,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';
import { StatusBadge, PriorityBadge, SeverityBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TiltCard } from '../components/3d/TiltCard';
import { NetworkGlobe3D } from '../components/3d/NetworkGlobe3D';
import { notify } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

export function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [regions, setRegions] = useState([]);
  const [ageing, setAgeing] = useState([]);
  const [recent, setRecent] = useState([]);

  const isStudent = user?.role === ROLES.STUDENT;
  const isFaculty = user?.role === ROLES.FACULTY;
  const isStudentOrFaculty = isStudent || isFaculty;
  const isPrincipal = user?.role === ROLES.PRINCIPAL;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, trendRes, workRes, regRes, ageRes, recRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/trends'),
        api.get('/dashboard/bureau-workload'),
        api.get('/dashboard/region-distribution'),
        api.get('/dashboard/ageing'),
        api.get('/dashboard/recent-activity')
      ]);

      setSummary(sumRes.data.data.summary);
      setTrends(trendRes.data.data.trends || []);
      setWorkload(workRes.data.data.workload || []);
      setRegions(regRes.data.data.distribution || []);
      setAgeing(ageRes.data.data.ageing || []);
      setRecent(recRes.data.data.recent || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      notify('Failed to connect to backend API telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Initializing AICTE Regulatory Intelligence Matrix..." />;
  }

  const NEON_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Dynamic Hero Section tailored to Role */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-700/50 p-6 sm:p-8 bg-gradient-to-r from-[#0c1324] via-[#091122] to-[#0d162d] shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>
                {isStudent
                  ? '🎓 STUDENT GRIEVANCE DASHBOARD'
                  : isFaculty
                  ? '👨‍🏫 TEACHER GRIEVANCE DASHBOARD'
                  : isPrincipal
                  ? '🏛️ COLLEGE PRINCIPAL DASHBOARD'
                  : 'GRIEVANCE REDRESSAL MONITOR'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
              {isStudentOrFaculty
                ? `Welcome, ${user?.name || 'Academic User'}`
                : isPrincipal
                ? `${user?.institutionName || 'College'} Grievance Console`
                : 'College Grievance Redressal Portal'}
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {isStudentOrFaculty
                ? `Logged in as verified ${isStudent ? 'Student' : 'Faculty'} at ${user?.institutionName || 'your institution'}. You can only view complaints you have submitted.`
                : isPrincipal
                ? `Authorized oversight of all grievances lodged by students and teaching staff of ${user?.institutionName || 'your college'}.`
                : 'Central administrative monitoring for Tamil Nadu colleges.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isStudentOrFaculty ? (
                <>
                  <Link
                    to="/complaints/new"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Lodge a Complaint</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <Link
                    to="/complaints"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-semibold"
                  >
                    <span>View My Complaints ({summary?.total || 0})</span>
                  </Link>
                </>
              ) : isPrincipal ? (
                <>
                  <Link
                    to="/complaints"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-glow-cyan transition-all"
                  >
                    <span>View All College Complaints ({summary?.total || 0})</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                  <Link
                    to="/complaints?complainantType=Student"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-cyan-300 text-xs font-semibold"
                  >
                    <span>🎓 From Students ({summary?.studentComplaints || 0})</span>
                  </Link>
                  <Link
                    to="/complaints?complainantType=Faculty"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-purple-300 text-xs font-semibold"
                  >
                    <span>👨‍🏫 From Teachers ({summary?.facultyComplaints || 0})</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/complaints"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-glow-cyan"
                  >
                    <span>All Complaints ({summary?.total || 0})</span>
                  </Link>
                  <Link
                    to="/overlaps"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-panel text-rose-300 text-xs font-semibold"
                  >
                    <span>Similar Cases ({summary?.activeOverlaps || 0})</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Embedded Interactive 3D Sphere in Hero */}
          <div className="lg:col-span-4 relative flex items-center justify-center">
            <div className="w-full max-w-[260px]">
              <NetworkGlobe3D height="210px" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metric Grid Tailored to Role */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TiltCard className="border-cyan-500/20 hover:border-cyan-500/50">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800/50">
              {isStudentOrFaculty ? 'Personal' : 'College'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">
            {isStudentOrFaculty ? 'My Complaints' : 'Total Complaints'}
          </p>
          <h3 className="text-3xl font-extrabold text-white mt-0.5 font-mono">{summary?.total || 0}</h3>
          <p className="text-[11px] text-slate-500 mt-2">
            {isStudentOrFaculty ? 'Submitted by you' : 'In your institution'}
          </p>
        </TiltCard>

        {isPrincipal ? (
          <>
            <TiltCard className="border-cyan-500/20 hover:border-cyan-500/50">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800/50">
                  Student Category
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">From Students</p>
              <h3 className="text-3xl font-extrabold text-cyan-300 mt-0.5 font-mono">{summary?.studentComplaints || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-2">Logged by enrolled students</p>
            </TiltCard>

            <TiltCard className="border-purple-500/20 hover:border-purple-500/50">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/40">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800/50">
                  Faculty Category
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">From Teachers</p>
              <h3 className="text-3xl font-extrabold text-purple-300 mt-0.5 font-mono">{summary?.facultyComplaints || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-2">Logged by teaching staff</p>
            </TiltCard>
          </>
        ) : (
          <>
            <TiltCard className="border-blue-500/20 hover:border-blue-500/50">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800/50">
                  Under Process
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">In Scrutiny</p>
              <h3 className="text-3xl font-extrabold text-white mt-0.5 font-mono">{summary?.underProcess || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-2">Being reviewed by committee</p>
            </TiltCard>

            <TiltCard className="border-amber-500/20 hover:border-amber-500/50">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800/50">
                  Pending
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">Pending Action</p>
              <h3 className="text-3xl font-extrabold text-white mt-0.5 font-mono">{summary?.pending || 0}</h3>
              <p className="text-[11px] text-slate-500 mt-2">Awaiting action</p>
            </TiltCard>
          </>
        )}

        <TiltCard className="border-emerald-500/20 hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/50">
              {summary?.disposalRate || 0}% Closed
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-4 uppercase tracking-wider">Resolved</p>
          <h3 className="text-3xl font-extrabold text-white mt-0.5 font-mono">{summary?.disposed || 0}</h3>
          <p className="text-[11px] text-slate-500 mt-2">Cases resolved and closed</p>
        </TiltCard>
      </div>

      {/* 3D Tilt Secondary Alert Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TiltCard className="border-rose-500/30 hover:border-rose-500/70 shadow-glow-rose/20">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/50">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-700 animate-pulse">
              HIGH PRIORITY
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wider">Multi-Bureau Overlaps</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-0.5 font-mono">{summary?.activeOverlaps || 0}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Cross-bureau alerts flagged</p>
        </TiltCard>

        <TiltCard className="border-rose-500/20 hover:border-rose-500/50">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded-full border border-rose-800/50">
              Past Due
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wider">Overdue Cases</p>
          <h3 className="text-2xl font-bold text-white mt-0.5 font-mono">{summary?.overdue || 0}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Exceeded 30-day deadline</p>
        </TiltCard>

        <TiltCard className="border-purple-500/20 hover:border-purple-500/50">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800/50">
              Rerouted
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wider">Transferred Cases</p>
          <h3 className="text-2xl font-bold text-white mt-0.5 font-mono">{summary?.transferred || 0}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Transferred across bureaus</p>
        </TiltCard>

        <TiltCard className="border-amber-500/20 hover:border-amber-500/50">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800/50">
              Executive
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-wider">Escalated to Leadership</p>
          <h3 className="text-2xl font-bold text-white mt-0.5 font-mono">{summary?.escalated || 0}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Pending Senior Advisor review</p>
        </TiltCard>
      </div>

      {/* Cyber Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart with Neon Gradients */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Monthly Grievance Inflow vs Resolution Trend</h3>
              <p className="text-xs text-slate-400">6-Month historical performance telemetry</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              Disposal Rate: {summary?.disposalRate || 0}%
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="neonCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="neonEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 19, 34, 0.95)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="received" name="Received" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#neonCyan)" />
                <Area type="monotone" dataKey="disposed" name="Disposed" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#neonEmerald)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Ageing Breakdown */}
        <div className="glass-panel rounded-2xl border border-slate-700/50 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Active Complaint Ageing</h3>
            <p className="text-xs text-slate-400 mb-4">Duration active cases have remained under investigation</p>

            <div className="space-y-3">
              {ageing.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-slate-300">{item.range}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700">
                    {item.count} cases
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-800/80">
            Cases exceeding 30 days trigger statutory alerts to Senior Management.
          </p>
        </div>
      </div>

      {/* Secondary Charts: Bureau Workload & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bureau Workload Bar Chart */}
        <div className="glass-panel rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white font-display">Bureau / Cell Workload Telemetry</h3>
          <p className="text-xs text-slate-400 mb-4">Active vs Disposed complaints across regulatory branches</p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workload} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="bureau"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => {
                    if (val.includes('RB')) return 'RB';
                    if (val.includes('PGRC')) return 'PGRC';
                    if (val.includes('Approval')) return 'Approval';
                    if (val.includes('Finance')) return 'Finance';
                    return 'Regional';
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 19, 34, 0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="active" name="Active Cases" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="disposed" name="Disposed Cases" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution Pie Chart */}
        <div className="glass-panel rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white font-display">Geographical Regional Spread</h3>
          <p className="text-xs text-slate-400 mb-4">Complaint distribution across 7 AICTE jurisdictions</p>

          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regions}
                  dataKey="count"
                  nameKey="region"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {regions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 19, 34, 0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Futuristic Recent Activity Stream */}
      <div className="glass-panel rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Live Grievance & Regulatory Action Stream</h3>
            <p className="text-xs text-slate-400">Chronological activity feed with automated cross-bureau overlap flags</p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Explore all complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-mono">Case ID</th>
                <th className="py-3.5 px-4">Institution Name</th>
                <th className="py-3.5 px-4">Assigned Bureau</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Investigating Officer</th>
                <th className="py-3.5 px-4">Overlap Indicator</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recent.map((c) => (
                <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                    {c.caseId}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white truncate max-w-xs">{c.institutionName}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{c.aictePermanentId}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {c.assignedBureau}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {c.assignedOfficerName || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4">
                    {c.overlapWarning ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-950 text-rose-300 border border-rose-600 shadow-glow-rose/40 animate-pulse">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        <span>{c.overlapWarning.severity} Overlap</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 font-mono text-[11px]">—</span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
