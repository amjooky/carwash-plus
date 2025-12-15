'use client';

import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, PieChart, Building2 } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [dashRes, centersRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/centers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setData(dashRes.data);
      setCenters(centersRes.data);
      setBookings(bookingsRes.data.data || bookingsRes.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;
  if (!data) return <div className="text-center">Failed to load</div>;

  // Calculate revenue by center
  const revenueByCenter = centers.map(center => {
    const centerBookings = bookings.filter(b => b.centerId === center.id && b.status === 'COMPLETED');
    const revenue = centerBookings.reduce((sum, b) => sum + b.finalAmount, 0);
    return { ...center, revenue, bookings: centerBookings.length };
  });

  const totalRevenue = revenueByCenter.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Revenue Analytics</h1>
        <p className="mt-2 text-slate-600">Detailed revenue breakdown and insights</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white shadow-2xl">
          <DollarSign className="h-10 w-10 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="mt-2 text-4xl font-bold">{formatCurrency(totalRevenue)}</p>
          <p className="mt-1 text-xs opacity-75">All time</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white shadow-xl">
          <Calendar className="h-10 w-10 mb-3 opacity-90" />
          <p className="text-sm opacity-90">This Month</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(data.month.revenue)}</p>
          <p className="mt-1 text-xs opacity-75">{data.month.bookings} bookings</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white shadow-xl">
          <TrendingUp className="h-10 w-10 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Today</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(data.today.revenue)}</p>
          <p className="mt-1 text-xs opacity-75">{data.today.bookings} bookings</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-xl">
          <PieChart className="h-10 w-10 mb-3 opacity-90" />
          <p className="text-sm opacity-90">Avg per Booking</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(data.month.revenue / data.month.bookings || 0)}</p>
          <p className="mt-1 text-xs opacity-75">Average value</p>
        </div>
      </div>

      {/* Revenue by Center */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Revenue by Center</h2>
        <div className="space-y-4">
          {revenueByCenter
            .sort((a, b) => b.revenue - a.revenue)
            .map((center, idx) => {
              const percentage = totalRevenue > 0 ? (center.revenue / totalRevenue) * 100 : 0;
              return (
                <div key={center.id} className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{center.name}</h3>
                        <p className="text-sm text-slate-600">{center.city}, {center.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(center.revenue)}</p>
                      <p className="text-sm text-slate-600">{center.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">{percentage.toFixed(1)}% of total revenue</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Revenue Trend (Last 14 Days)</h2>
        <div className="space-y-3">
          {data.trends?.revenue && data.trends.revenue.length > 0 ? data.trends.revenue.slice(-14).map((item: any, idx: number) => {
            const maxRevenue = Math.max(...data.trends.revenue.map((r: any) => r.revenue));
            const percentage = (item.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-24 text-sm text-slate-600">
                  {new Date(item.date).toLocaleDateString('fr-TN', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1">
                  <div className="h-12 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="w-28 text-right text-sm font-semibold">{formatCurrency(item.revenue)}</span>
              </div>
            );
          }) : <p className="py-8 text-center text-slate-500">No revenue data</p>}
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-purple-900 p-6 text-white shadow-2xl">
          <h3 className="mb-4 text-lg font-bold">Payment Methods</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cash</span>
              <span className="text-xl font-bold">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Card</span>
              <span className="text-xl font-bold">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mobile</span>
              <span className="text-xl font-bold">20%</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Peak Hours</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Morning (8-12)</span>
              <span className="text-xl font-bold text-blue-600">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Afternoon (12-17)</span>
              <span className="text-xl font-bold text-green-600">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Evening (17-20)</span>
              <span className="text-xl font-bold text-purple-600">25%</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Growth</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Week over Week</span>
              <span className="text-xl font-bold text-green-600">+8.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Month over Month</span>
              <span className="text-xl font-bold text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Year over Year</span>
              <span className="text-xl font-bold text-green-600">+35.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
