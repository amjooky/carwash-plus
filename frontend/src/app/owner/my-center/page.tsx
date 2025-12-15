'use client';

import { useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import axios from 'axios';
import CenterFormModal from '@/components/CenterFormModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function MyCenterPage() {
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleSubmit = async (data: any) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/centers/my`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Center updated successfully!');
      setIsModalOpen(false);
      fetchCenter();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update center');
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Center</h1>
          <p className="text-slate-600 mt-1">Manage your car wash center details</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Save className="h-5 w-5" />
          Edit Center
        </button>
      </div>

      {message && (
        <div className={`rounded-lg p-4 ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Center Details Card */}
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{center.name}</h2>
            <p className="text-slate-600 mt-1">{center.description || 'No description'}</p>
            <div className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${center.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {center.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-600">Phone</p>
                <p className="font-medium text-slate-900">{center.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Email</p>
                <p className="font-medium text-slate-900">{center.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Address</h3>
            <div className="space-y-2">
              <p className="font-medium text-slate-900">{center.address}</p>
              <p className="text-slate-600">{center.city}, {center.state} {center.zipCode}</p>
              {center.latitude && center.longitude && (
                <p className="text-xs text-purple-600">
                  📍 {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Operating Hours</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-600">Opens</p>
                <p className="font-medium text-slate-900">{center.openTime}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">Closes</p>
                <p className="font-medium text-slate-900">{center.closeTime}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Capacity</h3>
            <p className="text-3xl font-bold text-purple-600">{center.capacity}</p>
            <p className="text-sm text-slate-600">Concurrent vehicles</p>
          </div>
        </div>

        {center.amenities && center.amenities.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {center.amenities.map((amenity: string, idx: number) => (
                <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {center.services && center.services.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-slate-900 mb-3">Services</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {center.services.map((service: any) => (
                <div key={service.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{service.name}</p>
                  <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                  <p className="text-xs text-purple-600 mt-1">{service.baseDuration} minutes</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <CenterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        center={center}
      />
    </div>
  );
}
