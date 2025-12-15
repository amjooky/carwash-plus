'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
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
  if (!data) return <div className="text-center">Failed to load</div>;

  const stats = [
    { name: "Today's Bookings", value: data.today.bookings, change: `${data.today.completed} done`, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { name: "Today's Revenue", value: `${data.today.revenue.toFixed(2)} TND`, change: `${data.month.revenue.toFixed(2)} TND month`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { name: 'Customers', value: data.totals.customers, change: 'Total', icon: Users, color: 'from-purple-500 to-pink-500' },
    { name: 'Pending', value: data.totals.pendingBookings, change: `${data.totals.activeStaff} staff`, icon: CheckCircle, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200/50 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.change}</p>
              </div>
              <div className={`rounded-2xl bg-gradient-to-br ${stat.color} p-4 shadow-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold">Revenue (7 Days)</h3>
          <div className="space-y-3">
            {data.trends?.revenue && data.trends.revenue.length > 0 ? data.trends.revenue.slice(-7).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-20 text-sm text-slate-600">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <div className="flex-1"><div className="h-8 rounded-lg bg-slate-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${(item.revenue / Math.max(...data.trends.revenue.map((r: any) => r.revenue))) * 100}%` }}></div></div></div>
                <span className="w-16 text-right text-sm font-semibold">{item.revenue.toFixed(0)} TND</span>
              </div>
            )) : <p className="py-8 text-center text-slate-500">No revenue data available</p>}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold">Popular Services</h3>
          <div className="space-y-3">
            {data.popularServices && data.popularServices.length > 0 ? data.popularServices.slice(0, 5).map((service: any, idx: number) => (
              <div key={service.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">#{idx + 1}</span>
                  <div><p className="font-medium">{service.name}</p><p className="text-xs text-slate-500">{service.center}</p></div>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">{service.bookings}</span>
              </div>
            )) : <p className="py-8 text-center text-slate-500">No service data available</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-8 text-white shadow-2xl">
        <h3 className="mb-6 text-2xl font-bold">This Month</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8" /><div><p className="text-sm opacity-90">Bookings</p><p className="text-3xl font-bold">{data.month.bookings}</p></div></div></div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"><div className="flex items-center gap-3"><DollarSign className="h-8 w-8" /><div><p className="text-sm opacity-90">Revenue</p><p className="text-3xl font-bold">{data.month.revenue.toFixed(0)} TND</p></div></div></div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"><div className="flex items-center gap-3"><Users className="h-8 w-8" /><div><p className="text-sm opacity-90">Staff</p><p className="text-3xl font-bold">{data.totals.activeStaff}</p></div></div></div>
        </div>
      </div>
    </div>
  );
}
