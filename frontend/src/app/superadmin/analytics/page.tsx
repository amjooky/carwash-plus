'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Activity, Calendar, Target } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
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

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;
  if (!data) return <div className="text-center">Failed to load</div>;

  const kpiCards = [
    { name: 'Total Revenue', value: formatCurrency(data.month.revenue), change: '+12.5%', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { name: 'Total Bookings', value: data.month.bookings, change: '+8.2%', icon: Activity, color: 'from-blue-500 to-cyan-500' },
    { name: 'Active Customers', value: data.totals.customers, change: '+15.3%', icon: Users, color: 'from-purple-500 to-pink-500' },
    { name: 'Completion Rate', value: '94.2%', change: '+2.1%', icon: Target, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advanced Analytics</h1>
          <p className="mt-2 text-slate-600">Comprehensive business intelligence and insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-lg border border-purple-300 bg-white px-4 py-2 font-semibold focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.name} className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-purple-100">
            <div className="flex items-center justify-between">
              <div className={`rounded-full bg-gradient-to-br ${kpi.color} p-3`}>
                <kpi.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-600">{kpi.change}</span>
            </div>
            <p className="mt-4 text-sm text-slate-600">{kpi.name}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Bookings Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-6 text-xl font-bold text-slate-900">Revenue Trend</h3>
          <div className="space-y-3">
            {data.trends?.revenue && data.trends.revenue.length > 0 ? data.trends.revenue.slice(-10).map((item: any, idx: number) => {
              const maxRevenue = Math.max(...data.trends.revenue.map((r: any) => r.revenue));
              const percentage = (item.revenue / maxRevenue) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-slate-600">
                    {new Date(item.date).toLocaleDateString('fr-TN', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1">
                    <div className="h-10 overflow-hidden rounded-lg bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold">{formatCurrency(item.revenue)}</span>
                </div>
              );
            }) : <p className="py-8 text-center text-slate-500">No revenue data</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-6 text-xl font-bold text-slate-900">Booking Trend</h3>
          <div className="space-y-3">
            {data.trends?.bookings && data.trends.bookings.length > 0 ? data.trends.bookings.slice(-10).map((item: any, idx: number) => {
              const maxBookings = Math.max(...data.trends.bookings.map((b: any) => b.bookings));
              const percentage = (item.bookings / maxBookings) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-slate-600">
                    {new Date(item.date).toLocaleDateString('fr-TN', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1">
                    <div className="h-10 overflow-hidden rounded-lg bg-slate-100">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-semibold">{item.bookings}</span>
                </div>
              );
            }) : <p className="py-8 text-center text-slate-500">No booking data</p>}
          </div>
        </div>
      </div>

      {/* Popular Services & Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-6 text-xl font-bold text-slate-900">Top Services</h3>
          <div className="space-y-4">
            {data.popularServices && data.popularServices.length > 0 ? data.popularServices.slice(0, 5).map((service: any, idx: number) => (
              <div key={service.id} className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{service.name}</p>
                    <p className="text-xs text-slate-600">{service.center}</p>
                  </div>
                </div>
                <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700">
                  {service.bookings}
                </span>
              </div>
            )) : <p className="py-8 text-center text-slate-500">No service data</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white shadow-2xl">
          <h3 className="mb-6 text-xl font-bold">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Booking Value</span>
                <span className="text-xl font-bold">{formatCurrency(data.month.revenue / data.month.bookings || 0)}</span>
              </div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm">Customer Satisfaction</span>
                <span className="text-xl font-bold">4.8/5.0</span>
              </div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm">Staff Efficiency</span>
                <span className="text-xl font-bold">92%</span>
              </div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm">Repeat Customer Rate</span>
                <span className="text-xl font-bold">67%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-xl font-bold text-slate-900">Monthly Summary</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
            <Calendar className="h-8 w-8 text-blue-600 mb-3" />
            <p className="text-sm text-slate-600">Total Bookings</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{data.month.bookings}</p>
            <p className="mt-1 text-xs text-slate-500">Completed: {data.today.completed}</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <DollarSign className="h-8 w-8 text-green-600 mb-3" />
            <p className="text-sm text-slate-600">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(data.month.revenue)}</p>
            <p className="mt-1 text-xs text-slate-500">Today: {formatCurrency(data.today.revenue)}</p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <Users className="h-8 w-8 text-purple-600 mb-3" />
            <p className="text-sm text-slate-600">Active Customers</p>
            <p className="mt-2 text-3xl font-bold text-purple-600">{data.totals.customers}</p>
            <p className="mt-1 text-xs text-slate-500">Growing steadily</p>
          </div>
        </div>
      </div>
    </div>
  );
}
