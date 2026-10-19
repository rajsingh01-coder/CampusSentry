'use client';

import React, { useState, useMemo } from 'react';
import { useDemoStore } from '@/store/demo-store';
import { StaffUser, StaffRole, AccountStatus } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { useAccessibleDialog } from '@/lib/use-accessible-dialog';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Shield,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { staffUsers, addStaffUser, updateStaffUser, visitorRequests } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const addDialogProps = useAccessibleDialog(isAddModalOpen, () => setIsAddModalOpen(false));
  const editDialogProps = useAccessibleDialog(isEditModalOpen, () => setIsEditModalOpen(false));

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Campus Security');
  const [role, setRole] = useState<StaffRole>('Security/Staff');
  const [assignedGate, setAssignedGate] = useState('Main Gate 1');
  const [accountStatus, setAccountStatus] = useState<AccountStatus>('Active');
  const [staffFormError, setStaffFormError] = useState('');

  const filteredStaff = useMemo(() => {
    return staffUsers.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (statusFilter !== 'all' && user.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.department.toLowerCase().includes(q) ||
          user.staffId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [staffUsers, roleFilter, statusFilter, searchQuery]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (staffUsers.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) {
      setStaffFormError('An account already uses this email address.');
      return;
    }

    addStaffUser({
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role,
      status: accountStatus,
      assignedGate,
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setStaffFormError('');
  };

  const handleUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    if (staffUsers.some((user) => user.staffId !== selectedStaff.staffId && user.email.toLowerCase() === email.trim().toLowerCase())) {
      setStaffFormError('Another account already uses this email address.');
      return;
    }

    updateStaffUser(selectedStaff.staffId, {
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      role,
      status: accountStatus,
      assignedGate,
    });

    setIsEditModalOpen(false);
    setStaffFormError('');
  };

  const openEdit = (staff: StaffUser) => {
    setStaffFormError('');
    setSelectedStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setDepartment(staff.department);
    setRole(staff.role);
    setAssignedGate(staff.assignedGate);
    setAccountStatus(staff.status);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Security Personnel Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              {staffUsers.length} active demo accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer gate security operators, cabin assistants, and supervisors dispatching visitor meeting requests.
          </p>
        </div>

        <button
          onClick={() => {
            setStaffFormError('');
            setName('');
            setEmail('');
            setDepartment('Campus Security');
            setRole('Security/Staff');
            setAssignedGate('Main Gate 1');
            setAccountStatus('Active');
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Staff Member
        </button>
      </div>

      {/* Security Architecture Note */}
      <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Security Boundary Notice:</strong> This table manages client-side demo roles and simulated gate operators. In production, authentication boundaries and role-based access control (RBAC) are strictly enforced server-side by backend OAuth / JWT tokens.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, email, department, or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Security/Staff">Security/Staff</option>
            <option value="Supervisor">Supervisor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Location</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Requests Dispatched</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.staffId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{staff.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{staff.staffId}</span>
                        <span className="text-[11px] text-slate-400 block">{staff.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        staff.role === 'Admin'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : staff.role === 'Supervisor'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {staff.role}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{staff.department}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {staff.assignedGate}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {staff.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> {staff.status}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 text-sm">{staff.submittedRequestsCount}</span>
                    <span className="text-slate-400 text-[11px] ml-1">requests</span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {formatDateTime(staff.lastActive)}
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(staff)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Edit Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div {...addDialogProps} aria-labelledby="add-staff-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="add-staff-title" className="font-semibold text-sm">Add Staff Account</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              {staffFormError && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{staffFormError}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepak Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="staff@campussentry.edu"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStaffFormError(''); }}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Security/Staff">Security/Staff</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Gate / Station</label>
                <input
                  type="text"
                  value={assignedGate}
                  onChange={(e) => setAssignedGate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div {...editDialogProps} aria-labelledby="edit-staff-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="edit-staff-title" className="font-semibold text-sm">Edit Staff Account</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              {staffFormError && <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{staffFormError}</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStaffFormError(''); }}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StaffRole)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Security/Staff">Security/Staff</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={accountStatus}
                    onChange={(e) => setAccountStatus(e.target.value as AccountStatus)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Gate / Station</label>
                <input
                  type="text"
                  value={assignedGate}
                  onChange={(e) => setAssignedGate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Update Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
