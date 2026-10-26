import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  Check,
  ChevronDown,
  Sparkles,
  Search,
  Clock,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ROLE_LABELS } from '../../utils/constants';

export function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & System Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-[11px] text-cyan-400 font-mono">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>AICTE COMMAND LIVE</span>
          </div>
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTime} IST</span>
          </div>
        </div>
      </div>

      {/* Center: Quick Search Trigger */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div
          onClick={() => navigate('/complaints')}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl glass-input cursor-pointer hover:border-slate-600 transition-all text-xs text-slate-400"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search Case ID, Institution, or Officer...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
            /
          </kbd>
        </div>
      </div>

      {/* Right side: Emergency Overlap Ticker, Notifications & User Avatar */}
      <div className="flex items-center space-x-3">
        {/* Quick Link to Overlaps */}
        <Link
          to="/overlaps"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:border-rose-500/60 transition-all shadow-glow-rose"
        >
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span>Overlap Console</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-glow-rose animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/60">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telemetry Alerts ({unreadCount})</span>
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No new alerts in telemetry buffer
                  </div>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n._id}
                      className={`p-3.5 transition-colors ${
                        !n.isRead ? 'bg-cyan-950/20' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <p className="text-xs font-bold text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                            {new Date(n.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            className="p-1 text-slate-500 hover:text-cyan-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-800 p-2 text-center bg-slate-950/60">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  View full telemetry log →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-glow-cyan border border-cyan-400/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-200 leading-tight">
                {user?.name || 'Officer'}
              </p>
              <p className="text-[10px] text-cyan-400 font-mono">
                {user?.role ? ROLE_LABELS[user.role] || user.role : ''}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel border border-slate-700/60 shadow-2xl z-50 py-2 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate font-mono">{user?.email}</p>
                <div className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  {ROLE_LABELS[user?.role] || user?.role}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/50"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Officer Credentials</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
