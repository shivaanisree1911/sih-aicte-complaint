import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Inbox,
  Check
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
              Notifications & Regulatory Alerts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              {unreadCount} Unread
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time automated alerts for cross-bureau overlaps, investigations, escalations, and statutory deadlines
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-950/80 text-cyan-300 hover:bg-cyan-900/80 border border-cyan-800 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
              : 'glass-panel text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filter === 'unread'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
              : 'glass-panel text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324]">
        {loading ? (
          <LoadingSpinner text="Loading notification alerts..." />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No {filter === 'unread' ? 'unread' : ''} notifications at this time.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/60">
            {filtered.map((n) => {
              const isOverlap = n.type === 'OVERLAP_DETECTED';
              const isOverdue = n.type === 'CASE_OVERDUE';
              const isEscalated = n.type === 'CASE_ESCALATED';

              return (
                <li
                  key={n._id}
                  className={`p-4 sm:p-5 transition-colors flex items-start justify-between gap-4 ${
                    !n.isRead ? 'bg-cyan-950/20' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-2.5 rounded-xl mt-0.5 flex-shrink-0 ${
                        isOverlap
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          : isOverdue
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                          : isEscalated
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                          : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
                      }`}
                    >
                      {isOverlap ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : isOverdue ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {n.overlapId && (
                      <Link
                        to={`/overlaps/${n.overlapId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900/60"
                      >
                        <span>Overlap</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}

                    {n.complaintId && !n.overlapId && (
                      <Link
                        to={`/complaints/${n.complaintId}`}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800 hover:bg-cyan-900/60"
                      >
                        <span>Case</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}

                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        title="Mark as read"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
