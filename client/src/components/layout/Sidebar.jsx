import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Layers,
  BarChart3,
  Users,
  ShieldCheck,
  UserCircle,
  PlusCircle,
  Cpu,
  Globe2,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

export function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  const isStudentOrFaculty = user?.role === ROLES.STUDENT || user?.role === ROLES.FACULTY;
  const isPrincipal = user?.role === ROLES.PRINCIPAL;

  const getNavigation = () => {
    if (isStudentOrFaculty) {
      return [
        { name: 'My Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'My Complaints', to: '/complaints', icon: FileText },
        { name: 'Lodge a Complaint', to: '/complaints/new', icon: PlusCircle, highlight: true },
        { name: 'My Profile', to: '/profile', icon: UserCircle }
      ];
    }

    if (isPrincipal) {
      return [
        { name: 'College Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'College Complaints', to: '/complaints', icon: FileText },
        { name: 'Similar Complaints', to: '/overlaps', icon: Layers },
        { name: 'College Reports', to: '/reports', icon: BarChart3 },
        { name: 'Profile', to: '/profile', icon: UserCircle }
      ];
    }

    // Admin & Officers
    return [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Colleges', to: '/institutions', icon: Building2 },
      { name: 'All Complaints', to: '/complaints', icon: FileText },
      { name: 'Similar Complaints', to: '/overlaps', icon: Layers, highlight: true },
      { name: 'Reports', to: '/reports', icon: BarChart3 },
      { name: 'Users', to: '/admin/users', icon: Users, roles: [ROLES.SUPER_ADMIN] },
      { name: 'Audit Log', to: '/admin/audit-logs', icon: ShieldCheck, roles: [ROLES.SUPER_ADMIN, ROLES.SENIOR_MANAGEMENT, ROLES.AUDITOR] },
      { name: 'Profile', to: '/profile', icon: UserCircle }
    ];
  };

  const allowedNav = getNavigation().filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const getPortalTitle = () => {
    if (user?.role === ROLES.STUDENT) return { title: 'STUDENT PORTAL', sub: user.institutionName || 'Tamil Nadu' };
    if (user?.role === ROLES.FACULTY) return { title: 'TEACHER PORTAL', sub: user.institutionName || 'Tamil Nadu' };
    if (user?.role === ROLES.PRINCIPAL) return { title: 'PRINCIPAL PORTAL', sub: user.institutionName || 'College Head' };
    return { title: 'COMPLAINT PORTAL', sub: 'Tamil Nadu Region' };
  };

  const portalInfo = getPortalTitle();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#080d18]/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-glow-cyan">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-[#080d18]" />
            </div>
            <div>
              <span className="text-xs font-extrabold tracking-wider text-white font-display uppercase block">
                {portalInfo.title}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider block font-medium truncate max-w-[140px]">
                {portalInfo.sub}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <NavLink
            to="/complaints/new"
            onClick={() => onClose && onClose()}
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-white font-bold text-xs shadow-glow-cyan transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lodge a Complaint</span>
          </NavLink>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-1">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 transition-colors group-hover:text-cyan-400" />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Public Grievance Portal Link for Students & Faculty */}
        <div className="p-3 mx-3 my-2 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-800/60">
          <div className="text-[11px] font-bold text-white flex items-center space-x-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Public Grievance Portal</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Students & Teachers Channel</p>
          <a
            href="/lodge-complaint"
            target="_blank"
            rel="noreferrer"
            className="mt-2 w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center justify-between transition-colors border border-cyan-500/30"
          >
            <span>Lodge Grievance</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Telemetry Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center justify-between mb-1 text-slate-400 font-sans">
            <span className="flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">Atlas Cloud Sync</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <p className="text-[9px] text-slate-500">
            AICTE Regulatory Portal v2.6.4
          </p>
        </div>
      </aside>
    </>
  );
}
