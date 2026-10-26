import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, Eye, Terminal } from 'lucide-react';
import api from '../services/api';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { notify } from '../hooks/useToast';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [action, setAction] = useState('All');
  const [resourceType, setResourceType] = useState('All');

  // Metadata Inspector Modal
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(action !== 'All' && { action }),
        ...(resourceType !== 'All' && { resourceType })
      });

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res.data.data.items || []);
      setTotal(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      notify('Failed to load regulatory audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, action, resourceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
              Statutory Audit & Activity Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Immutable Tamper-Evident Trail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable regulatory audit log tracking all complaints, transfers, escalations, and system logins
          </p>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 p-4 shadow-xl flex flex-col sm:flex-row gap-3 bg-[#0c1324]">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by Officer Name, Action, or Resource ID..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 transition-all"
          />
        </form>

        <select
          value={resourceType}
          onChange={(e) => {
            setResourceType(e.target.value);
            setPage(1);
          }}
          className="text-xs glass-input rounded-xl px-3 py-2.5 text-slate-200 font-medium bg-[#090e1a] border border-slate-700/80 cursor-pointer"
        >
          <option value="All" className="bg-[#0c1324] text-slate-100">All Resources</option>
          <option value="Complaint" className="bg-[#0c1324] text-slate-100">Complaint</option>
          <option value="Institution" className="bg-[#0c1324] text-slate-100">Institution</option>
          <option value="Overlap" className="bg-[#0c1324] text-slate-100">Overlap</option>
          <option value="User" className="bg-[#0c1324] text-slate-100">User</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324]">
        {loading ? (
          <LoadingSpinner text="Retrieving regulatory audit trail..." />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No audit entries"
            description="No audit events recorded matching current criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Resource Target</th>
                  <th className="py-3.5 px-4 font-mono">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="font-bold text-white">{log.actorName}</span>
                      <span className="block text-[10px] text-cyan-400 font-mono">{log.actorEmail}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      <strong className="text-white">{log.resourceType}:</strong>{' '}
                      <span className="font-mono text-cyan-400 text-[10px]">{log.resourceId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-cyan-400 hover:text-white px-2.5 py-1 rounded-lg glass-panel hover:border-cyan-500/50 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <Pagination
            currentPage={page}
            totalItems={total}
            pageSize={limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Inspect Modal */}
      <Modal isOpen={!!inspectLog} onClose={() => setInspectLog(null)} title="Audit Event Metadata Payload">
        {inspectLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-400">Action:</span> <strong className="text-cyan-300 ml-1">{inspectLog.action}</strong>
              </div>
              <div>
                <span className="text-slate-400">Actor:</span> <strong className="text-white ml-1">{inspectLog.actorName}</strong>
              </div>
              <div>
                <span className="text-slate-400">Timestamp:</span> <strong className="text-slate-200 ml-1 font-mono">{new Date(inspectLog.createdAt).toISOString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Resource:</span> <strong className="text-slate-200 ml-1">{inspectLog.resourceType} ({inspectLog.resourceId})</strong>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-cyan-400 mb-1.5 block uppercase tracking-wider">
                Sanitized JSON Payload:
              </span>
              <pre className="p-4 bg-[#050811] text-emerald-400 rounded-2xl text-xs overflow-x-auto font-mono border border-slate-800/80 leading-relaxed">
                {JSON.stringify(inspectLog.metadata || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
