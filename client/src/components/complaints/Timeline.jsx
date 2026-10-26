import React from 'react';
import {
  FilePlus,
  UserCheck,
  RefreshCw,
  ArrowRightLeft,
  AlertTriangle,
  MessageSquare,
  FileUp,
  Link as LinkIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';

export function Timeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <div className="text-xs text-slate-500 py-6 text-center font-mono">No recorded timeline transactions.</div>;
  }

  const getActionConfig = (actionType) => {
    switch (actionType) {
      case 'CREATED':
        return { icon: FilePlus, color: 'bg-cyan-500 shadow-glow-cyan', title: 'Complaint Registered' };
      case 'ASSIGNED':
        return { icon: UserCheck, color: 'bg-blue-500 shadow-glow-blue', title: 'Officer Assigned' };
      case 'STATUS_CHANGE':
        return { icon: RefreshCw, color: 'bg-amber-500 shadow-glow-amber', title: 'Status Transitioned' };
      case 'TRANSFERRED':
        return { icon: ArrowRightLeft, color: 'bg-purple-500', title: 'Inter-Bureau Transfer' };
      case 'ESCALATED':
        return { icon: AlertTriangle, color: 'bg-rose-500 shadow-glow-rose', title: 'Case Escalated' };
      case 'REMARK_ADDED':
        return { icon: MessageSquare, color: 'bg-slate-600', title: 'Officer Remark Added' };
      case 'DOCUMENT_UPLOADED':
        return { icon: FileUp, color: 'bg-teal-500', title: 'Supporting Document Uploaded' };
      case 'LINKED_OVERLAP':
        return { icon: LinkIcon, color: 'bg-amber-600 shadow-glow-amber', title: 'Inter-Bureau Coordination Established' };
      case 'DISPOSED':
      case 'CLOSED':
        return { icon: CheckCircle2, color: 'bg-emerald-500 shadow-md', title: 'Complaint Disposed' };
      default:
        return { icon: Clock, color: 'bg-slate-500', title: 'Workflow Transaction' };
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((event, idx) => {
          const isLast = idx === history.length - 1;
          const config = getActionConfig(event.actionType);
          const Icon = config.icon;

          return (
            <li key={event._id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3.5 items-start">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-[#080d19] text-white ${config.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 glass-panel rounded-2xl p-4 border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white font-display">{config.title}</p>
                      <time className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.createdAt).toLocaleString()}
                      </time>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{event.remarks}</p>

                    {(event.previousBureau || event.newBureau) && (
                      <div className="mt-2 text-[11px] text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-lg inline-block font-mono">
                        Bureau: {event.previousBureau || 'None'} → {event.newBureau}
                      </div>
                    )}

                    {(event.previousStatus || event.newStatus) && event.actionType === 'STATUS_CHANGE' && (
                      <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-lg inline-block font-mono ml-2">
                        Status: {event.previousStatus} → {event.newStatus}
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      Action logged by: <span className="text-cyan-400 font-semibold">{event.officerDisplayName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
