import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Shield, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import api from '../services/api';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { notify } from '../hooks/useToast';
import { ROLES, ROLE_LABELS, BUREAUS, REGIONS } from '../utils/constants';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');

  // Create User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.BUREAU_OFFICER,
    bureau: BUREAUS[0],
    region: 'Southern'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(role !== 'All' && { role })
      });

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data.items || []);
      setTotal(res.data.data.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
      notify('Failed to load users directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/admin/users', formData);
      notify('User account created successfully!', 'success');
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ROLES.BUREAU_OFFICER,
        bureau: BUREAUS[0],
        region: 'Southern'
      });
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive });
      notify(`User ${!user.isActive ? 'activated' : 'deactivated'}.`, 'success');
      fetchUsers();
    } catch (err) {
      notify('Failed to update user status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white font-display tracking-tight">
              User & Access Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              Role-Based Access Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage officer permissions, bureau assignments, and role-based access control
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-glow-cyan transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Officer</span>
        </button>
      </div>

      {/* Filter / Search */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 p-4 shadow-xl flex flex-col sm:flex-row gap-3 bg-[#0c1324]">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or official email..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-slate-100 placeholder:text-slate-500 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400 transition-all"
          />
        </form>

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="text-xs glass-input rounded-xl px-3 py-2.5 text-slate-200 font-medium bg-[#090e1a] border border-slate-700/80 cursor-pointer"
        >
          <option value="All" className="bg-[#0c1324] text-slate-100">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([k, label]) => (
            <option key={k} value={k} className="bg-[#0c1324] text-slate-100">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden bg-[#0c1324]">
        {loading ? (
          <LoadingSpinner text="Retrieving administrative user registry..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Officer Name & Email</th>
                  <th className="py-3.5 px-4">Role Title</th>
                  <th className="py-3.5 px-4">Affiliated Bureau</th>
                  <th className="py-3.5 px-4">Region Scope</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {u.name}
                      <span className="block text-[11px] font-normal text-slate-400 font-mono">
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-purple-300">{u.bureau}</td>
                    <td className="py-3.5 px-4 text-slate-300">{u.region}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleUserActive(u)}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          u.isActive
                            ? 'text-rose-400 hover:bg-rose-950/50 border border-rose-800/50'
                            : 'text-emerald-400 hover:bg-emerald-950/50 border border-emerald-800/50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
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

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Provision New AICTE Officer Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rajesh Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Official Email Address *</label>
            <input
              type="email"
              required
              placeholder="officer@aicte.gov.in"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Initial Temporary Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                {Object.entries(ROLE_LABELS).map(([k, label]) => (
                  <option key={k} value={k} className="bg-[#0c1324] text-slate-100">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Bureau *</label>
              <select
                value={formData.bureau}
                onChange={(e) => setFormData({ ...formData, bureau: e.target.value })}
                className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                <option value="All" className="bg-[#0c1324] text-slate-100">All Bureaus</option>
                {BUREAUS.map((b) => (
                  <option key={b} value={b} className="bg-[#0c1324] text-slate-100">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Region *</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full text-xs p-3 glass-input rounded-xl text-slate-100 bg-[#090e1a] border border-slate-700/80 cursor-pointer"
              >
                <option value="All" className="bg-[#0c1324] text-slate-100">All Regions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-[#0c1324] text-slate-100">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-glow-cyan disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Provision Officer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
