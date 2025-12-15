'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Camera } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import map component to avoid SSR issues
const MapPicker = dynamic(
  () => import('./MapPicker'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl" /> }
);

interface CenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  center?: any;
  loading?: boolean;
  errorMessage?: string;
}

export default function CenterFormModal({ isOpen, onClose, onSubmit, center, loading = false, errorMessage = '' }: CenterFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    // ... (lines 24-118 skipped for brevity in thought, but must match file)
    // I will use replace_file_content carefully. 
    // I'll target the interface and function signature first.
    // Then insert the error message display in the JSX.
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    openTime: '08:00',
    closeTime: '20:00',
    capacity: 5,
    timeSlotInterval: 30,
    latitude: 35.8256,
    longitude: 10.6411,
    amenities: [] as string[],
    images: [] as string[],
    isActive: true,
    // Owner fields
    createOwner: false,
    ownerEmail: '',
    ownerFirstName: '',
    ownerLastName: '',
    ownerUsername: '',
  });

  const [position, setPosition] = useState<[number, number]>([35.8256, 10.6411]);
  const [newAmenity, setNewAmenity] = useState('');
  const [newImage, setNewImage] = useState('');

  // Auto-generate username from email
  useEffect(() => {
    if (formData.createOwner && formData.ownerEmail) {
      const username = formData.ownerEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({ ...prev, ownerUsername: username }));
    }
  }, [formData.createOwner, formData.ownerEmail]);

  useEffect(() => {
    if (center) {
      setFormData(center);
      if (center.latitude && center.longitude) {
        setPosition([center.latitude, center.longitude]);
      }
    }
  }, [center]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      latitude: position[0],
      longitude: position[1],
    }));
  }, [position]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove internal fields that shouldn't be sent to the API
    const { id, centerId, ownerId, createdAt, updatedAt, services, staff, owner, ...cleanData } = formData as any;
    onSubmit(cleanData);
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImage.trim()],
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {center ? 'Edit Center' : 'Add New Center'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Map Picker */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin className="h-4 w-4 text-purple-600" />
              Click on the map to set location
            </label>
            <div className="h-[300px] overflow-hidden rounded-xl border-2 border-purple-200">
              <MapPicker position={position} setPosition={setPosition} />
            </div>
            <p className="text-sm text-slate-600">
              Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Center Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Address */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Operating Hours & Capacity */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Open Time *
              </label>
              <input
                type="time"
                required
                value={formData.openTime}
                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Close Time *
              </label>
              <input
                type="time"
                required
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Time Slot (min) *
              </label>
              <select
                value={formData.timeSlotInterval}
                onChange={(e) => setFormData({ ...formData, timeSlotInterval: parseInt(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Amenities
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                placeholder="Add amenity (WiFi, Coffee, etc.)"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="text-purple-900 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Center Photos (URLs)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addImage}
                className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700 transition"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.images?.map((image, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 border border-slate-200">
                  <div className="h-10 w-10 overflow-hidden rounded">
                    <img
                      src={image}
                      alt={`Center ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                      }}
                    />
                  </div>
                  <span className="flex-1 truncate text-sm text-slate-600">{image}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
              Center is Active
            </label>
          </div>

          {/* Owner Account Creation */}
          {!center && (
            <div className="border-t-2 border-slate-200 pt-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="createOwner"
                  checked={formData.createOwner}
                  onChange={(e) => setFormData({ ...formData, createOwner: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="createOwner" className="text-sm font-semibold text-slate-700">
                  Create owner/admin account for this center
                </label>
              </div>

              {formData.createOwner && (
                <div className="space-y-4 pl-8 border-l-4 border-purple-200">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Owner Email *
                      </label>
                      <input
                        type="email"
                        required={formData.createOwner}
                        value={formData.ownerEmail}
                        onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                        placeholder="owner@example.com"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Username (auto-generated)
                      </label>
                      <input
                        type="text"
                        value={formData.ownerUsername}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.ownerFirstName}
                        onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                        placeholder="John"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.ownerLastName}
                        onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> A secure password will be automatically generated and displayed after creation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-lg bg-red-100 p-4 text-sm text-red-700 border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </div>
              ) : (
                center ? 'Update Center' : 'Create Center'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
