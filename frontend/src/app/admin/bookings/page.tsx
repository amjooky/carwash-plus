'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash, Calendar, Clock, DollarSign, User, Car, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    centerId: '',
    serviceId: '',
    customerId: '',
    vehicleId: '',
    staffId: '',
    scheduledAt: '',
    notes: ''
  });

  const [serviceIds, setServiceIds] = useState<string[]>([]);

  useEffect(() => {
    fetchBookings();
    fetchDependencies();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle paginated response
      setBookings(response.data.data || response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const [centersRes, servicesRes, customersRes, staffRes] = await Promise.all([
        axios.get(`${API_URL}/centers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/services`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/customers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/staff`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCenters(centersRes.data);
      setServices(servicesRes.data);
      setCustomers(customersRes.data.data || customersRes.data);
      setStaff(staffRes.data.data || staffRes.data);
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    }
  };

  const fetchVehicles = async (customerId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_URL}/customers/${customerId}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setCurrentBooking(null);
    setFormData({ centerId: '', serviceId: '', customerId: '', vehicleId: '', staffId: '', scheduledAt: '', notes: '' });
    setServiceIds([]);
    setShowModal(true);
  };

  const handleEdit = (booking: any) => {
    setEditMode(true);
    setCurrentBooking(booking);
    // Combine scheduledDate and scheduledTime for datetime-local input
    const dateStr = booking.scheduledDate.split('T')[0];
    const scheduledAt = `${dateStr}T${booking.scheduledTime}`;
    setFormData({
      centerId: booking.centerId,
      serviceId: booking.services?.[0]?.serviceId || '',
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      staffId: booking.assignments?.[0]?.staffId || '',
      scheduledAt: scheduledAt,
      notes: booking.notes || ''
    });
    setServiceIds(booking.services?.map((s: any) => s.serviceId) || []);
    fetchVehicles(booking.customerId);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    // Validate scheduledAt is not empty
    if (!formData.scheduledAt) {
      alert('Please select a date and time for the booking');
      return;
    }

    console.log('scheduledAt value:', formData.scheduledAt);

    // datetime-local format is YYYY-MM-DDTHH:mm, extract date and time directly
    const [datePart, timePart] = formData.scheduledAt.split('T');

    if (!datePart || !timePart) {
      alert('Invalid date and time format');
      return;
    }

    const scheduledDate = datePart; // Already in YYYY-MM-DD format
    const scheduledTime = timePart; // Already in HH:mm format

    const payload = {
      centerId: formData.centerId,
      customerId: formData.customerId,
      vehicleId: formData.vehicleId,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      serviceIds: serviceIds.length > 0 ? serviceIds : [formData.serviceId],
      notes: formData.notes,
      staffId: formData.staffId || undefined
    };

    try {
      if (editMode && currentBooking) {
        await axios.patch(`${API_URL}/bookings/${currentBooking.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/bookings`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchBookings();
    } catch (error: any) {
      console.error('Failed:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (error) {
      console.error('Failed:', error);
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
      console.error('Failed:', error);
    }
  };

  // Filter and sort bookings
  const filteredBookings = statusFilter === 'ALL' ? bookings : bookings.filter(b => b.status === statusFilter);

  // Sort by latest first (using createdAt or scheduledDate)
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const statusColors: any = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> New Booking
        </button>
      </div>

      <div className="flex gap-4">
        {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
          <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Booking #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Vehicle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Scheduled</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{booking.bookingNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.customer?.firstName} {booking.customer?.lastName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.services?.[0]?.service?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{booking.vehicle?.make} {booking.vehicle?.model}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(booking.scheduledDate).toLocaleDateString()} {booking.scheduledTime}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{booking.finalAmount.toFixed(2)} TND</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(booking)} className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      {booking.status === 'PENDING' && (
                        <button onClick={() => updateStatus(booking.id, 'CONFIRMED')} className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200" title="Confirm Booking">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button onClick={() => updateStatus(booking.id, 'IN_PROGRESS')} className="rounded-lg bg-purple-100 p-2 text-purple-600 hover:bg-purple-200" title="Start Washing">
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      {booking.status === 'IN_PROGRESS' && (
                        <button onClick={() => updateStatus(booking.id, 'COMPLETED')} className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200" title="Mark as Completed">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(booking.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200" title="Cancel">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
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
          colorScheme="blue"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">{editMode ? 'Edit' : 'New'} Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Center</label>
                  <select required value={formData.centerId} onChange={(e) => setFormData({ ...formData, centerId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="">Select Center</option>
                    {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Service</label>
                  <select required value={formData.serviceId} onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="">Select Service</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Customer</label>
                  <select required value={formData.customerId} onChange={(e) => { setFormData({ ...formData, customerId: e.target.value, vehicleId: '' }); fetchVehicles(e.target.value); }} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="">Select Customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Vehicle</label>
                  <select required value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" disabled={!formData.customerId}>
                    <option value="">Select Vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} - {v.licensePlate}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Staff (Optional)</label>
                  <select value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="">Auto-assign</option>
                    {staff.filter(s => s.isActive).map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Scheduled Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => {
                      console.log('Date input changed:', e.target.value);
                      setFormData({ ...formData, scheduledAt: e.target.value });
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" rows={3}></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-semibold text-white">
                  {editMode ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg bg-slate-200 py-3 font-semibold text-slate-700">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
