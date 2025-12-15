'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Calendar, Building2 } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AllBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerFilter, setCenterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [bookingsRes, centersRes] = await Promise.all([
        axios.get(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/centers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBookings(bookingsRes.data.data || bookingsRes.data);
      setCenters(centersRes.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (centerFilter !== 'ALL' && b.centerId !== centerFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  // Sort by latest first
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.scheduledDate).getTime();
    const dateB = new Date(b.createdAt || b.scheduledDate).getTime();
    return dateB - dateA; // Descending order (latest first)
  });

  // Pagination
  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = sortedBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [centerFilter, statusFilter]);

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={centerFilter}
          onChange={(e) => setCenterFilter(e.target.value)}
          className="rounded-lg border border-purple-300 bg-white px-4 py-2 font-medium focus:border-purple-500 focus:outline-none"
        >
          <option value="ALL">All Centers</option>
          {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-purple-300 bg-white px-4 py-2 font-medium focus:border-purple-500 focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div className="ml-auto rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-2">
          <p className="text-sm font-medium text-purple-900">Total: {filteredBookings.length} bookings</p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Booking #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Center</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-purple-50/30 transition">
                  <td className="px-6 py-4 text-sm font-medium text-purple-600">{booking.bookingNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      {booking.center?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{booking.customer?.firstName} {booking.customer?.lastName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.services?.[0]?.service?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(booking.scheduledDate).toLocaleDateString('fr-TN')}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(booking.finalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedBookings.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          colorScheme="purple"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 text-white">
          <p className="text-sm opacity-90">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold">{filteredBookings.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-4 text-white">
          <p className="text-sm opacity-90">Completed</p>
          <p className="mt-2 text-3xl font-bold">{filteredBookings.filter(b => b.status === 'COMPLETED').length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 p-4 text-white">
          <p className="text-sm opacity-90">Pending</p>
          <p className="mt-2 text-3xl font-bold">{filteredBookings.filter(b => b.status === 'PENDING').length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 text-white">
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(filteredBookings.reduce((sum, b) => sum + b.finalAmount, 0))}</p>
        </div>
      </div>
    </div>
  );
}
