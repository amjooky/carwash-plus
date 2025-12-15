'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function OwnerDashboard() {
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenter();
  }, []);

  const fetchCenter = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/centers/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCenter(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Center Assigned</h2>
          <p className="text-slate-600">Please contact the administrator to assign a center to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back!</h1>
        <p className="text-slate-600 mt-1">Here's what's happening with {center.name} today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <Calendar className="h-8 w-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Today's Bookings</p>
          <p className="text-3xl font-bold mt-2">12</p>
          <p className="text-xs mt-2 opacity-75">↑ 8% from yesterday</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
          <DollarSign className="h-8 w-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Today's Revenue</p>
          <p className="text-3xl font-bold mt-2">$850</p>
          <p className="text-xs mt-2 opacity-75">↑ 12% from yesterday</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
          <Users className="h-8 w-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Active Staff</p>
          <p className="text-3xl font-bold mt-2">{center.staff?.length || 0}</p>
          <p className="text-xs mt-2 opacity-75">On duty now</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white">
          <TrendingUp className="h-8 w-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Capacity</p>
          <p className="text-3xl font-bold mt-2">{center.capacity}</p>
          <p className="text-xs mt-2 opacity-75">Vehicles at once</p>
        </div>
      </div>

      {/* Center Info Card */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Center Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-600">Address</p>
            <p className="font-semibold text-slate-900">{center.address}</p>
            <p className="text-sm text-slate-600">{center.city}, {center.state} {center.zipCode}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Contact</p>
            <p className="font-semibold text-slate-900">{center.phone}</p>
            <p className="text-sm text-slate-600">{center.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Operating Hours</p>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-semibold text-slate-900">{center.openTime} - {center.closeTime}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600">Services</p>
            <p className="font-semibold text-slate-900">{center.services?.length || 0} services available</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button className="rounded-xl bg-purple-100 p-6 text-left hover:bg-purple-200 transition">
          <Building2 className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-bold text-slate-900">Edit Center Details</h3>
          <p className="text-sm text-slate-600 mt-1">Update information, hours, and location</p>
        </button>

        <button className="rounded-xl bg-blue-100 p-6 text-left hover:bg-blue-200 transition">
          <Users className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-bold text-slate-900">Manage Services</h3>
          <p className="text-sm text-slate-600 mt-1">Add, edit, or remove services</p>
        </button>

        <button className="rounded-xl bg-green-100 p-6 text-left hover:bg-green-200 transition">
          <Calendar className="h-8 w-8 text-green-600 mb-2" />
          <h3 className="font-bold text-slate-900">View Bookings</h3>
          <p className="text-sm text-slate-600 mt-1">Check upcoming appointments</p>
        </button>
      </div>
    </div>
  );
}
