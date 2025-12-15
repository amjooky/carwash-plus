'use client';

import { useEffect, useState } from 'react';
import { Building2, MapPin, Clock, Users, CheckCircle, XCircle, Plus } from 'lucide-react';
import axios from 'axios';
import CenterFormModal from '@/components/CenterFormModal';
import CredentialsModal from '@/components/CredentialsModal';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [createdCenterName, setCreatedCenterName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCenters(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      const token = localStorage.getItem('accessToken');
      if (selectedCenter) {
        // Update existing center
        await axios.put(`${API_URL}/centers/${selectedCenter.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsModalOpen(false);
        setSelectedCenter(null);
        fetchCenters(); // Refresh list
      } else {
        // Create new center
        const response = await axios.post(`${API_URL}/centers`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setIsModalOpen(false);
        setSelectedCenter(null);

        // Check if owner credentials were returned
        if (response.data.ownerCredentials) {
          setCredentials(response.data.ownerCredentials);
          setCreatedCenterName(response.data.center.name);
          setShowCredentials(true);
        }

        fetchCenters(); // Refresh list
      }
    } catch (error: any) {
      console.error('Failed to save center:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save center. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (center: any) => {
    setSelectedCenter(center);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCenter(null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;

  // Sort centers by latest first
  const sortedCenters = [...centers].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (latest first)
  });

  // Pagination
  const totalPages = Math.ceil(sortedCenters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCenters = sortedCenters.slice(startIndex, endIndex);

  const activeCount = sortedCenters.filter(c => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Car Wash Centers</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Add New Center
        </button>
      </div>

      {/* Header Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <Building2 className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Total Centers</p>
          <p className="mt-2 text-3xl font-bold">{sortedCenters.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
          <CheckCircle className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Active</p>
          <p className="mt-2 text-3xl font-bold">{activeCount}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-red-500 to-orange-500 p-6 text-white">
          <XCircle className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Inactive</p>
          <p className="mt-2 text-3xl font-bold">{sortedCenters.length - activeCount}</p>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {paginatedCenters.map((center) => (
          <div key={center.id} className="rounded-2xl bg-white p-6 shadow-xl hover:shadow-2xl transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{center.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{center.city}, {center.state}</span>
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${center.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {center.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">Address</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{center.address}</p>
                <p className="text-sm text-slate-600">{center.zipCode}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Capacity</p>
                  <p className="text-lg font-bold text-purple-600">{center.capacity}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Opens</p>
                  <p className="text-sm font-bold text-blue-600">{center.openTime}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <Clock className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Closes</p>
                  <p className="text-sm font-bold text-green-600">{center.closeTime}</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600 mb-2">Contact</p>
                <p className="text-sm font-medium text-slate-900">{center.phone}</p>
                <p className="text-sm text-slate-600">{center.email}</p>
              </div>

              {center.amenities && center.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {center.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {center.latitude && center.longitude && (
              <div className="mt-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-3 text-center">
                <p className="text-xs font-medium text-purple-900">
                  📍 {center.latitude.toFixed(4)}, {center.longitude.toFixed(4)}
                </p>
              </div>
            )}

            <button
              onClick={() => handleEdit(center)}
              className="mt-4 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Edit Center
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedCenters.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        colorScheme="purple"
      />

      {/* Center Form Modal */}
      <CenterFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCenter(null);
          setErrorMessage('');
        }}
        onSubmit={handleSubmit}
        center={selectedCenter}
        loading={isSaving}
        errorMessage={errorMessage}
      />

      {/* Credentials Modal */}
      {credentials && (
        <CredentialsModal
          isOpen={showCredentials}
          onClose={() => {
            setShowCredentials(false);
            setCredentials(null);
            setCreatedCenterName('');
          }}
          credentials={credentials}
          centerName={createdCenterName}
        />
      )}
    </div>
  );
}
