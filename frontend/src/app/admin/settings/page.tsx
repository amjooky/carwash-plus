'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Shield, Bell, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCenters(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">Manage your profile and system preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600">Username</p>
                <p className="text-lg font-bold text-slate-900">{user?.username}</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-600" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-slate-600" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">Role</p>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-3">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">Booking Notifications</p>
                <p className="text-sm text-slate-600">Get notified about new bookings</p>
              </div>
              <div className="flex h-6 w-11 items-center rounded-full bg-blue-600 px-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition"></div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">Email Reports</p>
                <p className="text-sm text-slate-600">Daily summary via email</p>
              </div>
              <div className="flex h-6 w-11 items-center rounded-full bg-blue-600 px-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition"></div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
              <div>
                <p className="font-semibold text-slate-900">Staff Updates</p>
                <p className="text-sm text-slate-600">Alerts for staff changes</p>
              </div>
              <div className="flex h-6 w-11 items-center rounded-full bg-slate-300 px-1">
                <div className="h-4 w-4 rounded-full bg-white transition"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centers Overview */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-3">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Wash Centers</h2>
            <p className="text-sm text-slate-600">Active locations in the system</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((center) => (
            <div key={center.id} className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-4">
              <h3 className="font-bold text-slate-900">{center.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{center.address}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-slate-600">{center.city}</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-8 text-white shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold">System Information</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="font-bold">Version</h3>
            <p className="mt-2 text-2xl">1.0.0</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="font-bold">Platform</h3>
            <p className="mt-2 text-2xl">CarWash+</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="font-bold">Environment</h3>
            <p className="mt-2 text-2xl">Production</p>
          </div>
        </div>
      </div>
    </div>
  );
}
