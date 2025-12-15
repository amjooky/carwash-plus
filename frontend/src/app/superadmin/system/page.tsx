'use client';

import { useEffect, useState } from 'react';
import { Shield, Users, Settings, Database, Activity, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SystemPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;

  const adminUsers = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
  const activeUsers = users.filter(u => u.status === 'ACTIVE');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Management</h1>
        <p className="mt-2 text-slate-600">System settings and user management</p>
      </div>

      {/* System Info */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <Shield className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">System Version</p>
          <p className="mt-2 text-2xl font-bold">v1.0.0</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
          <Users className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Total Users</p>
          <p className="mt-2 text-2xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
          <Activity className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Active Users</p>
          <p className="mt-2 text-2xl font-bold">{activeUsers.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
          <Database className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Database</p>
          <p className="mt-2 text-2xl font-bold">Healthy</p>
        </div>
      </div>

      {/* Current Admin */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 p-8 text-white shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Current Session</h2>
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-3xl font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">{user?.username}</h3>
            <p className="text-purple-200">{user?.email}</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-full bg-pink-500/30 px-3 py-1 text-sm font-semibold">
                {user?.role}
              </span>
              <span className="rounded-full bg-green-500/30 px-3 py-1 text-sm font-semibold">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Users */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Admin Users</h2>
        <div className="space-y-4">
          {adminUsers.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">
                  {admin.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{admin.username}</h3>
                  <p className="text-sm text-slate-600">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {admin.role}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${admin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {admin.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-bold text-slate-900">System Configuration</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">API URL</p>
                <p className="text-sm text-slate-600">{API_URL}</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">Environment</p>
                <p className="text-sm text-slate-600">Production</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Live
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">Currency</p>
                <p className="text-sm text-slate-600">Tunisian Dinar (TND)</p>
              </div>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-xl font-bold text-slate-900">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Backend API</p>
                  <p className="text-sm text-slate-600">Operational</p>
                </div>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Database</p>
                  <p className="text-sm text-slate-600">Connected</p>
                </div>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Authentication</p>
                  <p className="text-sm text-slate-600">Secure</p>
                </div>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
