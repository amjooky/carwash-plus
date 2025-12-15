'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, UserCog, Activity, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [dashboardRes, centersRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/centers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setData(dashboardRes.data);
      setCenters(centersRes.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;
  if (!data) return <div className="text-center">Failed to load data</div>;

  const globalStats = [
    { 
      name: 'Total Centers', 
      value: centers.length, 
      change: `${centers.filter(c => c.isActive).length} active`, 
      icon: Building2, 
      color: 'from-purple-500 to-pink-500',
      trend: 'up'
    },
    { 
      name: 'Total Revenue', 
      value: formatCurrency(data.month.revenue), 
      change: `${formatCurrency(data.today.revenue)} today`,
      icon: DollarSign, 
      color: 'from-green-500 to-emerald-500',
      trend: 'up'
    },
    { 
      name: 'Total Bookings', 
      value: data.month.bookings, 
      change: `${data.today.bookings} today`, 
      icon: Activity, 
      color: 'from-blue-500 to-cyan-500',
      trend: 'up'
    },
    { 
      name: 'Active Staff', 
      value: data.totals.activeStaff, 
      change: `${data.totals.customers} customers`, 
      icon: UserCog, 
      color: 'from-orange-500 to-red-500',
      trend: 'stable'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Global KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {globalStats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl ring-1 ring-purple-100 transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                  {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {stat.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                </div>
                <p className="mt-2 text-4xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-xs text-slate-500">{stat.change}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 shadow-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        ))}
      </div>

      {/* Centers Performance Grid */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Centers Performance</h2>
            <p className="mt-1 text-sm text-slate-600">Real-time monitoring of all locations</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              <CheckCircle className="h-4 w-4" />
              {centers.filter(c => c.isActive).length} Active
            </span>
            {centers.filter(c => !c.isActive).length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4" />
                {centers.filter(c => !c.isActive).length} Inactive
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {centers.map((center) => (
            <div key={center.id} className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 ring-1 ring-purple-200 transition hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{center.name}</h3>
                      <p className="text-sm text-slate-600">{center.city}, {center.state}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs text-slate-600">Capacity</p>
                      <p className="mt-1 text-lg font-bold text-purple-600">{center.capacity}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs text-slate-600">Open</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{center.openTime}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-xs text-slate-600">Close</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{center.closeTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${center.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {center.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {center.amenities && center.amenities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {center.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System-wide Metrics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white shadow-2xl">
          <h3 className="text-lg font-semibold opacity-90">Today's Activity</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bookings</span>
              <span className="text-2xl font-bold">{data.today.bookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <span className="text-2xl font-bold">{data.today.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Revenue</span>
              <span className="text-2xl font-bold">{formatCurrency(data.today.revenue)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">This Month</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Bookings</span>
              <span className="text-2xl font-bold text-blue-600">{data.month.bookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Revenue</span>
              <span className="text-2xl font-bold text-green-600">{formatCurrency(data.month.revenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Avg per Booking</span>
              <span className="text-2xl font-bold text-purple-600">{formatCurrency(data.month.revenue / data.month.bookings || 0)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Customers</span>
              <span className="text-2xl font-bold text-slate-900">{data.totals.customers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active Staff</span>
              <span className="text-2xl font-bold text-slate-900">{data.totals.activeStaff}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Pending</span>
              <span className="text-2xl font-bold text-orange-600">{data.totals.pendingBookings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 p-8 text-white shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <Link href="/superadmin/analytics">
            <button className="w-full rounded-xl bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105">
              <BarChart3 className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm font-semibold">View Analytics</p>
            </button>
          </Link>
          <Link href="/superadmin/bookings">
            <button className="w-full rounded-xl bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105">
              <Activity className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm font-semibold">All Bookings</p>
            </button>
          </Link>
          <Link href="/superadmin/customers">
            <button className="w-full rounded-xl bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105">
              <Users className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm font-semibold">All Customers</p>
            </button>
          </Link>
          <Link href="/superadmin/centers">
            <button className="w-full rounded-xl bg-white/10 p-4 backdrop-blur-sm transition hover:bg-white/20 hover:scale-105">
              <Building2 className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm font-semibold">Manage Centers</p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
