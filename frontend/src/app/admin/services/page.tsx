'use client';

import { useEffect, useState } from 'react';
import { Droplets, Clock, DollarSign, Plus, Edit, Trash, X } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const VEHICLE_TYPES = ['SEDAN', 'SUV', 'TRUCK', 'VAN'];

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<any>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    centerId: '',
    name: '',
    description: '',
    baseDuration: 30,
    isActive: true,
    pricing: VEHICLE_TYPES.map(type => ({ vehicleType: type, basePrice: 0 }))
  });

  useEffect(() => {
    fetchServices();
    fetchCenters();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCenters(response.data);
    } catch (error) {
      console.error('Failed to fetch centers:', error);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setCurrentService(null);
    setFormData({
      centerId: centers.length > 0 ? centers[0].id : '',
      name: '',
      description: '',
      baseDuration: 30,
      isActive: true,
      pricing: VEHICLE_TYPES.map(type => ({ vehicleType: type, basePrice: 0 }))
    });
    setShowModal(true);
  };

  const handleEdit = (service: any) => {
    setEditMode(true);
    setCurrentService(service);
    setFormData({
      centerId: service.centerId,
      name: service.name,
      description: service.description,
      baseDuration: service.baseDuration,
      isActive: service.isActive,
      pricing: service.pricing && service.pricing.length > 0
        ? service.pricing.map((p: any) => ({ vehicleType: p.vehicleType, basePrice: p.basePrice }))
        : VEHICLE_TYPES.map(type => ({ vehicleType: type, basePrice: 0 }))
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    const filteredPricing = formData.pricing.filter(p => p.basePrice > 0);
    
    if (filteredPricing.length === 0) {
      alert('Please set at least one vehicle type price greater than 0');
      return;
    }

    const payload = {
      ...formData,
      pricing: filteredPricing
    };

    console.log('Sending payload:', payload);

    try {
      if (editMode && currentService) {
        await axios.patch(`${API_URL}/services/${currentService.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/services`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchServices();
    } catch (error: any) {
      console.error('Failed:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to save service. Please try again.';
      alert(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service? This action cannot be undone.')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_URL}/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (error) {
      console.error('Failed:', error);
      alert('Failed to delete service.');
    }
  };

  const toggleActive = async (service: any) => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.patch(`${API_URL}/services/${service.id}`, 
        { isActive: !service.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServices();
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const updatePricing = (index: number, price: number) => {
    const newPricing = [...formData.pricing];
    newPricing[index].basePrice = price;
    setFormData({ ...formData, pricing: newPricing });
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Services</h1>
          <p className="mt-2 text-slate-600">Manage services with dynamic pricing by vehicle type</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> New Service
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Droplets className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{service.center?.name}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1 text-blue-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold">{service.baseDuration} min</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(service)} className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 transition">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition">
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-slate-700">Pricing by Vehicle Type</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {service.pricing && service.pricing.map((price: any) => (
                  <div key={price.id} className="rounded-lg bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{price.vehicleType}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(price.basePrice)}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => toggleActive(service)} className={`mt-4 w-full rounded-lg px-4 py-2 text-center text-sm font-semibold transition ${
              service.isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}>
              {service.isActive ? 'Active - Click to Deactivate' : 'Inactive - Click to Activate'}
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-8 text-white shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold">Service Features</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="font-bold">Dynamic Pricing</h3>
            <p className="mt-2 text-sm opacity-90">Different rates for Sedan, SUV, Truck, and Van</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="font-bold">Flexible Duration</h3>
            <p className="mt-2 text-sm opacity-90">Service time varies from 30 to 120 minutes</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <h3 className="font-bold">Multi-Center</h3>
            <p className="mt-2 text-sm opacity-90">Services available across all locations</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editMode ? 'Edit' : 'New'} Service</h2>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Center</label>
                <select
                  required
                  value={formData.centerId}
                  onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select a center</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Service Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Wash"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what's included in this service"
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
                <input
                  required
                  type="number"
                  min="15"
                  step="5"
                  value={formData.baseDuration}
                  onChange={(e) => setFormData({ ...formData, baseDuration: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700">Pricing by Vehicle Type (TND)</label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {formData.pricing.map((pricing, index) => (
                    <div key={pricing.vehicleType} className="rounded-lg border border-slate-200 p-4">
                      <label className="mb-2 block text-sm font-semibold text-slate-600">{pricing.vehicleType}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={pricing.basePrice}
                          onChange={(e) => updatePricing(index, parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <span className="text-sm font-medium text-slate-600">TND</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">Leave a price at 0 to exclude that vehicle type</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-200"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Service is active and available for booking
                </label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl">
                  {editMode ? 'Update Service' : 'Create Service'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-lg bg-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-300">
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
