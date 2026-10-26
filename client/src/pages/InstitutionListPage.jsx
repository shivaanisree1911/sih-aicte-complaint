import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MapPin,
  ExternalLink,
  FileText,
  AlertCircle,
  Phone,
  User,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { notify } from '../hooks/useToast';
import { TAMIL_NADU_DISTRICTS } from '../utils/constants';

export function InstitutionListPage() {
  const [institutions, setInstitutions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All');
  const [status, setStatus] = useState('All');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    aictePermanentId: '',
    name: '',
    institutionType: 'Engineering & Technology',
    address: '',
    state: 'Tamil Nadu',
    district: 'Chennai',
    region: 'Southern',
    contactDetails: { phone: '', email: '', principalName: '', website: '' }
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(district !== 'All' && { search: district }),
        ...(status !== 'All' && { status })
      });

      const res = await api.get(`/institutions?${params.toString()}`);
      setInstitutions(res.data.data.items || []);
      setTotal(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load institutions:', err);
      notify('Failed to load institutions directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [page, district, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchInstitutions();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/institutions', formData);
      notify('Institution registered successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        aictePermanentId: '',
        name: '',
        institutionType: 'Engineering & Technology',
        address: '',
        state: 'Tamil Nadu',
        district: 'Chennai',
        region: 'Southern',
        contactDetails: { phone: '', email: '', principalName: '', website: '' }
      });
      fetchInstitutions();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to register institution.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
              Tamil Nadu Technical Institutions Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Southern Region • {total} Institutions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Centralized directory of AICTE approved colleges, engineering universities, and polytechnics across Tamil Nadu
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Institution</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 p-4 shadow-xl flex flex-col md:flex-row gap-3 bg-[#0c1324]">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Institution Name, AICTE Permanent ID (e.g., 1-109012341), or City..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 transition-all"
          />
        </form>

        <div className="flex items-center space-x-2.5">
          {/* District Selector */}
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2.5 text-slate-200 font-medium bg-[#090e1a] border border-slate-700/80 cursor-pointer"
          >
            <option value="All" className="bg-[#0c1324] text-slate-100">All TN Districts</option>
            {TAMIL_NADU_DISTRICTS.map((d) => (
              <option key={d} value={d} className="bg-[#0c1324] text-slate-100">
                {d}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs glass-input rounded-xl px-3 py-2.5 text-slate-200 font-medium bg-[#090e1a] border border-slate-700/80 cursor-pointer"
          >
            <option value="All" className="bg-[#0c1324] text-slate-100">All Statuses</option>
            <option value="Approved" className="bg-[#0c1324] text-slate-100">Approved</option>
            <option value="Under Scrutiny" className="bg-[#0c1324] text-slate-100">Under Scrutiny</option>
            <option value="Show Cause Issued" className="bg-[#0c1324] text-slate-100">Show Cause Issued</option>
            <option value="Withdrawn" className="bg-[#0c1324] text-slate-100">Withdrawn</option>
            <option value="Suspended" className="bg-[#0c1324] text-slate-100">Suspended</option>
          </select>

          <button
            type="button"
            onClick={fetchInstitutions}
            className="px-4 py-2.5 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324]">
        {loading ? (
          <LoadingSpinner text="Searching Tamil Nadu institutions registry..." />
        ) : institutions.length === 0 ? (
          <EmptyState
            title="No institutions found"
            description="No institutions match your search query or selected district filter."
            actionText="Register New Institution"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">AICTE Permanent ID</th>
                  <th className="py-3.5 px-4">Institution Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location (TN)</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-center">Active Complaints</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {institutions.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      {inst.aictePermanentId}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <Link
                        to={`/institutions/${inst._id}`}
                        className="font-bold text-slate-100 hover:text-cyan-400 block text-xs group-hover:translate-x-0.5 transition-all"
                      >
                        {inst.name}
                      </Link>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {inst.address}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {inst.institutionType}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span>{inst.district}, Tamil Nadu</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inst.institutionStatus === 'Approved'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : inst.institutionStatus === 'Under Scrutiny'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {inst.institutionStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          (inst.complaintCount || 0) > 2
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : (inst.complaintCount || 0) > 0
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {inst.complaintCount || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/institutions/${inst._id}`}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg glass-panel text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors inline-flex items-center space-x-1"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <Link
                          to={`/complaints/new?institutionId=${inst._id}`}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-cyan-950/70 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                        >
                          + Log Case
                        </Link>
                      </div>
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

      {/* Add Institution Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register AICTE Institution (Tamil Nadu)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                AICTE Permanent ID *
              </label>
              <input
                type="text"
                required
                placeholder="1-1090XXXXX"
                value={formData.aictePermanentId}
                onChange={(e) => setFormData({ ...formData, aictePermanentId: e.target.value })}
                className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Institution Type *
              </label>
              <select
                value={formData.institutionType}
                onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                <option value="Engineering & Technology" className="bg-[#0c1324] text-slate-100">Engineering & Technology</option>
                <option value="Management" className="bg-[#0c1324] text-slate-100">Management</option>
                <option value="Pharmacy" className="bg-[#0c1324] text-slate-100">Pharmacy</option>
                <option value="Architecture" className="bg-[#0c1324] text-slate-100">Architecture</option>
                <option value="Polytechnic" className="bg-[#0c1324] text-slate-100">Polytechnic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Full Official Institution Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., College of Engineering Guindy, Anna University"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Campus Address *
            </label>
            <input
              type="text"
              required
              placeholder="Street / Campus Road / Sector"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                District (Tamil Nadu) *
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-[#0c1324] text-slate-100">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                State
              </label>
              <input
                type="text"
                disabled
                value="Tamil Nadu"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                AICTE Region
              </label>
              <input
                type="text"
                disabled
                value="Southern"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h4 className="text-xs font-bold text-cyan-400 mb-2 uppercase tracking-wider">
              Official Contact & Principal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Principal / Dean Name</label>
                <input
                  type="text"
                  placeholder="Dr. Full Name"
                  value={formData.contactDetails.principalName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactDetails: { ...formData.contactDetails, principalName: e.target.value }
                    })
                  }
                  className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="principal@college.edu"
                  value={formData.contactDetails.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactDetails: { ...formData.contactDetails, email: e.target.value }
                    })
                  }
                  className="w-full text-xs p-2.5 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan transition-all disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register in Tamil Nadu Directory'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
