import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Building2,
  Layers,
  Clock,
  AlertTriangle,
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge, SeverityBadge } from '../components/common/Badge';
import { notify } from '../hooks/useToast';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('bureau');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);

  const tabs = [
    { id: 'bureau', label: 'Bureau Workload & Disposal', endpoint: '/reports/bureau' },
    { id: 'region', label: 'Region-wise Summary', endpoint: '/reports/region' },
    { id: 'institution', label: 'Tamil Nadu Institution Summary', endpoint: '/reports/institution' },
    { id: 'status', label: 'Status Distribution', endpoint: '/reports/status' },
    { id: 'overdue', label: 'Overdue Complaints Audit', endpoint: '/reports/overdue' },
    { id: 'overlaps', label: 'Cross-Bureau Overlaps Audit', endpoint: '/reports/overlaps' },
    { id: 'officer', label: 'Officer Workload Ledger', endpoint: '/reports/officer-workload' }
  ];

  const fetchReport = async (tabId) => {
    const active = tabs.find((t) => t.id === tabId);
    if (!active) return;

    try {
      setLoading(true);
      const res = await api.get(active.endpoint);
      setReportData(res.data.data.report || []);
    } catch (err) {
      console.error('Failed to load report:', err);
      notify('Failed to generate report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const handleExportCSV = (type = 'complaints') => {
    window.open(`${import.meta.env.VITE_API_BASE_URL || '/api'}/reports/export.csv?type=${type}`, '_blank');
    notify(`Exporting ${type} CSV report...`, 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
              Regulatory Analytics & Statutory Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Audit-Grade Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade performance metrics, disposal rates, and inter-bureau tracking reports
          </p>
        </div>
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <button
            onClick={() => handleExportCSV('complaints')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Complaints CSV</span>
          </button>
          <button
            onClick={() => handleExportCSV('overlaps')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Overlaps CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Formula Note Banner */}
      <div className="p-4 bg-cyan-950/20 rounded-2xl border border-cyan-500/20 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Statutory Disposal Rate Formula:</span>
          <span className="font-mono bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-lg border border-cyan-800 text-[11px] font-bold">
            (Disposed Cases ÷ Total Received Cases) × 100%
          </span>
        </div>
        <span className="text-[11px] text-cyan-400 font-mono">
          Evaluated dynamically from live AICTE MongoDB Atlas cluster
        </span>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan'
                : 'glass-panel text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data Table Container */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324] p-1">
        {loading ? (
          <LoadingSpinner text="Generating database aggregation report..." />
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'bureau' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Bureau / Cell</th>
                    <th className="py-3.5 px-4 text-center">Total Complaints</th>
                    <th className="py-3.5 px-4 text-center">Received</th>
                    <th className="py-3.5 px-4 text-center">Pending Scrutiny</th>
                    <th className="py-3.5 px-4 text-center">Under Process</th>
                    <th className="py-3.5 px-4 text-center">Transferred</th>
                    <th className="py-3.5 px-4 text-center">Escalated</th>
                    <th className="py-3.5 px-4 text-center">Disposed</th>
                    <th className="py-3.5 px-4 text-right">Disposal Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{r.bureau}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">{r.total}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{r.received}</td>
                      <td className="py-3.5 px-4 text-center text-amber-400 font-semibold">{r.pending}</td>
                      <td className="py-3.5 px-4 text-center text-cyan-400 font-semibold">{r.underProcess}</td>
                      <td className="py-3.5 px-4 text-center text-purple-400 font-semibold">{r.transferred}</td>
                      <td className="py-3.5 px-4 text-center text-rose-400 font-bold">{r.escalated}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">{r.disposed}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">
                        {r.disposalRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'region' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">AICTE Regional Jurisdiction</th>
                    <th className="py-3.5 px-4 text-center">Total Complaints</th>
                    <th className="py-3.5 px-4 text-center">Active Complaints</th>
                    <th className="py-3.5 px-4 text-center">Disposed Complaints</th>
                    <th className="py-3.5 px-4 text-right">Disposal Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((r, idx) => {
                    const rate = r.totalComplaints > 0
                      ? Math.round((r.disposedComplaints / r.totalComplaints) * 100)
                      : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">{r.region} Region</td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">{r.totalComplaints}</td>
                        <td className="py-3.5 px-4 text-center text-amber-400 font-semibold">{r.activeComplaints}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">{r.disposedComplaints}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === 'institution' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Institution Name</th>
                    <th className="py-3.5 px-4 font-mono">Permanent ID</th>
                    <th className="py-3.5 px-4 text-center">Total Complaints</th>
                    <th className="py-3.5 px-4 text-center">Active</th>
                    <th className="py-3.5 px-4 text-center">Disposed</th>
                    <th className="py-3.5 px-4 text-center">Cross-Bureau Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{r.institutionName}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400">{r.aictePermanentId}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">{r.totalComplaints}</td>
                      <td className="py-3.5 px-4 text-center text-amber-400 font-semibold">{r.activeComplaints}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">{r.disposedComplaints}</td>
                      <td className="py-3.5 px-4 text-center">
                        {r.hasCrossBureauActivity ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
                            Multiple Bureaus ({r.bureausCount})
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Single Bureau</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'status' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Complaint Lifecycle Status</th>
                    <th className="py-3.5 px-4 text-right">Count of Complaints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-cyan-300">
                        {r.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'overdue' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-mono">Case ID</th>
                    <th className="py-3.5 px-4">Institution</th>
                    <th className="py-3.5 px-4">Bureau</th>
                    <th className="py-3.5 px-4">Assigned Officer</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4 text-right">Days Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{r.caseId}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{r.institutionName}</td>
                      <td className="py-3.5 px-4 font-semibold text-cyan-300">{r.assignedBureau}</td>
                      <td className="py-3.5 px-4 text-slate-300">{r.assignedOfficerName || 'Unassigned'}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(r.expectedDisposalDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-400 font-mono">
                        +{r.daysOverdue} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'overlaps' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Severity</th>
                    <th className="py-3.5 px-4">Institution Name</th>
                    <th className="py-3.5 px-4 font-mono">Involved Case IDs</th>
                    <th className="py-3.5 px-4">Bureaus</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Detected At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <SeverityBadge severity={o.severity} />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{o.institutionName}</td>
                      <td className="py-3.5 px-4 font-mono text-cyan-300 font-bold">{o.caseIds?.join(' & ')}</td>
                      <td className="py-3.5 px-4 font-semibold text-purple-300">{o.bureausInvolved?.join(' + ')}</td>
                      <td className="py-3.5 px-4 text-slate-300">{o.reviewStatus}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {new Date(o.detectedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'officer' && (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Officer Name</th>
                    <th className="py-3.5 px-4">Affiliated Bureau</th>
                    <th className="py-3.5 px-4 text-center">Total Assigned</th>
                    <th className="py-3.5 px-4 text-center">Active Cases</th>
                    <th className="py-3.5 px-4 text-center">Disposed Cases</th>
                    <th className="py-3.5 px-4 text-right">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((o, idx) => {
                    const rate = o.totalAssigned > 0
                      ? Math.round((o.disposedAssigned / o.totalAssigned) * 100)
                      : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          {o.name}
                          <span className="block text-[10px] text-slate-400 font-normal font-mono">{o.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-cyan-300 font-semibold">{o.bureau}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">{o.totalAssigned}</td>
                        <td className="py-3.5 px-4 text-center text-amber-400 font-semibold">{o.activeAssigned}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">{o.disposedAssigned}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
