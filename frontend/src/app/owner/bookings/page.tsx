'use client';

import { useEffect, useState } from 'react';
import { Search, Clock, CheckCircle, XCircle, Calendar, DollarSign, User, Car, Filter } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.patch(`${API_URL}/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleConfirm = (id: string) => {
    if (confirm('Confirm this booking?')) {
      updateStatus(id, 'CONFIRMED');
    }
  };

  const handleStart = (id: string) => {
    if (confirm('Start washing this car?')) {
      updateStatus(id, 'IN_PROGRESS');
    }
  };

  const handleComplete = (id: string) => {
    if (confirm('Mark this booking as completed?')) {
      updateStatus(id, 'COMPLETED');
    }
  };

  const handleCancel = (id: string) => {
    const reason = prompt('Reason for cancellation (optional):');
    if (reason !== null) {
      updateStatus(id, 'CANCELLED');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${b.customer?.firstName} ${b.customer?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${b.vehicle?.make} ${b.vehicle?.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
    COMPLETED: 'bg-green-100 text-green-800 border-green-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    NO_SHOW: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'CONFIRMED': return '✓';
      case 'IN_PROGRESS': return '🚿';
      case 'COMPLETED': return '✅';
      case 'CANCELLED': return '❌';
      case 'NO_SHOW': return '👻';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manage Bookings</h1>
        <p className="text-slate-600 mt-1">View and update booking statuses for your center</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by booking number, customer, or vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${statusFilter === status
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            {status.replace('_', ' ')}
            <span className="ml-2 text-xs opacity-75">
              ({status === 'ALL' ? bookings.length : bookings.filter(b => b.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h3>
          <p className="text-slate-600">
            {searchTerm ? 'Try adjusting your search' : 'No bookings match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-slate-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{booking.bookingNumber}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {new Date(booking.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm font-semibold text-purple-600">{booking.scheduledTime}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border-2 ${statusColors[booking.status]}`}>
                  {getStatusIcon(booking.status)} {booking.status.replace('_', ' ')}
                </span>
              </div>

              {/* Customer & Vehicle Info */}
              <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Car className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">
                    {booking.vehicle?.make} {booking.vehicle?.model}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="font-semibold text-slate-900">{booking.finalAmount.toFixed(2)} TND</span>
                </div>
              </div>

              {/* Service Info */}
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-1">Service</p>
                <p className="text-sm font-medium text-slate-900">
                  {booking.services?.[0]?.service?.name || 'N/A'}
                </p>
                {booking.services?.length > 1 && (
                  <p className="text-xs text-slate-500 mt-1">+{booking.services.length - 1} more</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {booking.status === 'PENDING' && (
                  <button
                    onClick={() => handleConfirm(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                    title="Confirm this booking"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm
                  </button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStart(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
                    title="Start washing"
                  >
                    <Clock className="h-4 w-4" />
                    Start
                  </button>
                )}

                {booking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleComplete(booking.id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
                    title="Mark as completed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </button>
                )}

                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition"
                    title="Cancel booking"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
