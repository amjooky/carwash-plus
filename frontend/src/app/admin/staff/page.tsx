'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, Award, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    centerId: '',
    role: 'WASHER',
    hourlyRate: ''
  });

  useEffect(() => {
    fetchStaff();
    fetchCenters();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle paginated response
      setStaff(response.data.data || response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_URL}/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCenters(response.data);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setCurrentStaff(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', centerId: '', role: 'WASHER', hourlyRate: '' });
    setShowModal(true);
  };

  const handleEdit = (staff: any) => {
    setEditMode(true);
    setCurrentStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      centerId: staff.centerId,
      role: staff.role,
      hourlyRate: staff.hourlyRate.toString()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const payload = { ...formData, hourlyRate: parseFloat(formData.hourlyRate) };
    try {
      if (editMode && currentStaff) {
        await axios.patch(`${API_URL}/staff/${currentStaff.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/staff`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchStaff();
    } catch (error: any) {
      console.error('Failed:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save staff');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_URL}/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const updateStatus = async (id: string, isActive: boolean) => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.patch(`${API_URL}/staff/${id}`, { isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStaff();
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  // Sort staff by latest first
  const sortedStaff = [...staff].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (latest first)
  });

  // Pagination
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = sortedStaff.slice(startIndex, endIndex);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Staff</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> New Staff
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {paginatedStaff.map((member) => (
          <div key={member.id} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white">
                  {member.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{member.firstName} {member.lastName}</h3>
                  <p className="text-sm text-slate-600">{member.email}</p>
                  <p className="text-sm text-slate-600">{member.phone}</p>
                  <div className="mt-1 flex gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{member.role}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(member)} className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(member.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Jobs Done</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{member.completedJobs || 0}</p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Rating</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{member.rating?.toFixed(1) || '5.0'}</p>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm font-medium">Badges</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{member.badges?.length || 0}</p>
              </div>
            </div>

            {member.badges && member.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {member.badges.map((badge: any) => (
                  <div key={badge.id} className="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-sm font-semibold text-white shadow">
                    {badge.badge?.icon} {badge.badge?.name || badge.name || 'Badge'}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => updateStatus(member.id, !member.isActive)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold ${member.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {member.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedStaff.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        colorScheme="blue"
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">{editMode ? 'Edit' : 'New'} Staff</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">First Name</label>
                <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Last Name</label>
                <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <input required type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Center</label>
                <select required value={formData.centerId} onChange={(e) => setFormData({ ...formData, centerId: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                  <option value="">Select Center</option>
                  {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                  <option value="WASHER">Washer</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Hourly Rate ($)</label>
                <input required type="number" step="0.01" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
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
