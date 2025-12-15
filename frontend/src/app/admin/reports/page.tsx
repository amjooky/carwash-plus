'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Calendar, BarChart3, PieChart } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;
  if (!data) return <div className="text-center">Failed to load reports</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="mt-2 text-slate-600">Business insights and performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold">{data.month.revenue.toFixed(0)} TND</p>
              <p className="mt-1 text-xs opacity-75">This month</p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Bookings</p>
              <p className="mt-2 text-3xl font-bold">{data.month.bookings}</p>
              <p className="mt-1 text-xs opacity-75">This month</p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Customers</p>
              <p className="mt-2 text-3xl font-bold">{data.totals.customers}</p>
              <p className="mt-1 text-xs opacity-75">Total active</p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Avg Booking</p>
              <p className="mt-2 text-3xl font-bold">
                {data.month.bookings > 0 ? (data.month.revenue / data.month.bookings).toFixed(0) : 0} TND
              </p>
              <p className="mt-1 text-xs opacity-75">Per transaction</p>
            </div>
            <div className="rounded-full bg-white/20 p-3">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Revenue Trend</h2>
              <p className="text-sm text-slate-600">Last 14 days performance</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.trends?.revenue && data.trends.revenue.length > 0 ? data.trends.revenue.slice(-14).map((item: any, idx: number) => {
              const maxRevenue = Math.max(...data.trends.revenue.map((r: any) => r.revenue));
              const percentage = (item.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-slate-600">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1">
                    <div className="h-10 overflow-hidden rounded-lg bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm font-semibold text-slate-900">
                    {item.revenue.toFixed(0)} TND
                  </span>
                </div>
              );
            }) : <p className="py-8 text-center text-slate-500">No revenue data available</p>}
          </div>
        </div>

        {/* Booking Trend */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Booking Trend</h2>
              <p className="text-sm text-slate-600">Last 14 days activity</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.trends?.bookings && data.trends.bookings.length > 0 ? data.trends.bookings.slice(-14).map((item: any, idx: number) => {
              const maxBookings = Math.max(...data.trends.bookings.map((b: any) => b.bookings));
              const percentage = (item.bookings / maxBookings) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-slate-600">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1">
                    <div className="h-10 overflow-hidden rounded-lg bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm font-semibold text-slate-900">
                    {item.bookings}
                  </span>
                </div>
              );
            }) : <p className="py-8 text-center text-slate-500">No booking data available</p>}
          </div>
        </div>
      </div>

      {/* Service Performance */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Service Performance</h2>
            <p className="text-sm text-slate-600">Top services by booking count</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.popularServices.map((service: any, idx: number) => (
            <div
              key={service.id}
              className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-xs text-slate-600">{service.center}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                  #{idx + 1}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-600">Bookings</span>
                <span className="text-2xl font-bold text-slate-900">{service.bookings}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Performance Summary</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-sm opacity-75">Today</p>
            <p className="mt-2 text-3xl font-bold">{data.today.bookings}</p>
            <p className="mt-1 text-sm">bookings • {data.today.revenue.toFixed(0)} TND revenue</p>
          </div>
          <div>
            <p className="text-sm opacity-75">Active Staff</p>
            <p className="mt-2 text-3xl font-bold">{data.totals.activeStaff}</p>
            <p className="mt-1 text-sm">team members working</p>
          </div>
          <div>
            <p className="text-sm opacity-75">Pending</p>
            <p className="mt-2 text-3xl font-bold">{data.totals.pendingBookings}</p>
            <p className="mt-1 text-sm">bookings awaiting processing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
