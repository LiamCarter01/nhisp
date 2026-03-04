/**
 * Admin Users Management Page
 * ============================
 * Admin can view, create, activate/deactivate users.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { usersApi } from '../../api/services';
import type { User, UserRole } from '../../api/types';
import { LoadingSpinner } from '../../components';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'ClaimsOfficer', label: 'Claims Officer' },
  { value: 'Citizen', label: 'Citizen' },
];

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    role: UserRole;
    national_id: string;
    phone_number: string;
  }>({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role: 'Citizen' as UserRole,
    national_id: '',
    phone_number: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await usersApi.list();
      setUsers(res.data.results);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.create(createForm);
      toast.success('User created successfully!');
      setShowCreate(false);
      setCreateForm({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        role: 'Citizen' as UserRole,
        national_id: '',
        phone_number: '',
      });
      await fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(error.response?.data?.error?.message || 'Failed to create user.');
    }
  };

  const toggleActive = async (user: User) => {
    try {
      if (user.is_active) {
        await usersApi.deactivate(user.id);
        toast.success(`${user.first_name} deactivated.`);
      } else {
        await usersApi.activate(user.id);
        toast.success(`${user.first_name} activated.`);
      }
      await fetchUsers();
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all portal users and their roles.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          {showCreate ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Create New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={createForm.first_name}
                onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={createForm.last_name}
                onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                className="input-field"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
              <input
                type="text"
                value={createForm.national_id}
                onChange={(e) => setCreateForm({ ...createForm, national_id: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={createForm.phone_number}
                onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Create User
          </button>
        </form>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto card p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                  {user.first_name} {user.last_name}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                <td className="py-3 px-4">
                  <span className="badge-info text-xs">
                    {user.role || 'Citizen'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {dayjs(user.date_joined).format('MMM D, YYYY')}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => toggleActive(user)}
                    className={`text-xs font-medium px-3 py-1 rounded ${
                      user.is_active
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
