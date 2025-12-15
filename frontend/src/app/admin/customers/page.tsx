'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash, Car, Star, Award, DollarSign, TrendingUp, X, Eye, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Generate car image URL
const getCarImageUrl = (make?: string, model?: string, year?: number) => {
  if (make && model && year) {
    // Try to use CarQuery image if available
    const searchQuery = `${year} ${make} ${model}`;
    // Fallback to Unsplash for now - CarQuery images need model_id
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(searchQuery + ' car')}`;
  }
  const randomId = Math.floor(Math.random() * 1000) + 1;
  return `https://picsum.photos/seed/car${randomId}/400/300`;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [carYears, setCarYears] = useState<number[]>([]);
  const [carMakes, setCarMakes] = useState<any[]>([]);
  const [carModels, setCarModels] = useState<any[]>([]);
  const [carTrims, setCarTrims] = useState<any[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTrims, setLoadingTrims] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [vehicleFormData, setVehicleFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    color: '',
    licensePlate: '',
    type: 'SEDAN',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCustomers();
    initializeCarYears();
  }, []);

  const initializeCarYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // CarQuery may not have next year's data yet, so start from current year
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year);
    }
    setCarYears(years);
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle paginated response
      setCustomers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditMode(false);
    setCurrentCustomer(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleEdit = (customer: any) => {
    setEditMode(true);
    setCurrentCustomer(customer);
    setFormData({ firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      if (editMode && currentCustomer) {
        await axios.patch(`${API_URL}/customers/${currentCustomer.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/customers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_URL}/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (error) {
      console.error('Failed:', error);
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


  const fetchCarMakes = async (year: number) => {
    if (!year) return;
    setLoadingMakes(true);
    setCarMakes([]);
    setCarModels([]);
    setCarTrims([]);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching makes for year:', year);
      const response = await axios.get(`${API_URL}/carquery/makes`, {
        params: { year },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('CarQuery makes response:', response.data);
      if (response.data.Makes && response.data.Makes.length > 0) {
        setCarMakes(response.data.Makes);
      } else {
        console.warn('No makes found for year:', year);
      }
    } catch (error) {
      console.error('Failed to fetch car makes:', error);
    } finally {
      setLoadingMakes(false);
    }
  };

  const fetchCarModels = async (year: number, make: string) => {
    if (!year || !make) return;
    setLoadingModels(true);
    setCarModels([]);
    setCarTrims([]);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/carquery/models`, {
        params: { year, make },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.Models) {
        setCarModels(response.data.Models);
      }
    } catch (error) {
      console.error('Failed to fetch car models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchCarTrims = async (year: number, make: string, model: string) => {
    if (!year || !make || !model) return;
    setLoadingTrims(true);
    setCarTrims([]);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/carquery/trims`, {
        params: { year, make, model },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.Trims) {
        setCarTrims(response.data.Trims);
      }
    } catch (error) {
      console.error('Failed to fetch car trims:', error);
    } finally {
      setLoadingTrims(false);
    }
  };

  const handleYearChange = (year: number) => {
    setVehicleFormData({ ...vehicleFormData, year, make: '', model: '', trim: '', imageUrl: '' });
    if (year) {
      fetchCarMakes(year);
    }
  };

  const handleMakeChange = (make: string) => {
    setVehicleFormData({ ...vehicleFormData, make, model: '', trim: '', imageUrl: '' });
    if (make && vehicleFormData.year) {
      fetchCarModels(vehicleFormData.year, make);
    }
  };

  const handleModelChange = (model: string) => {
    setVehicleFormData({ ...vehicleFormData, model, trim: '' });
    if (model && vehicleFormData.year && vehicleFormData.make) {
      fetchCarTrims(vehicleFormData.year, vehicleFormData.make, model);
      // Generate image based on selection
      const imageUrl = getCarImageUrl(vehicleFormData.make, model, vehicleFormData.year);
      setVehicleFormData(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleAddVehicle = async (customerId: string) => {
    setCurrentCustomer(customers.find(c => c.id === customerId));
    const defaultYear = new Date().getFullYear();
    setVehicleFormData({ make: '', model: '', year: defaultYear, trim: '', color: '', licensePlate: '', type: 'SEDAN', imageUrl: '' });
    setCarMakes([]);
    setCarModels([]);
    setCarTrims([]);
    await fetchVehicles(customerId);
    fetchCarMakes(defaultYear);
    setShowVehicleModal(true);
  };

  const handleViewDetails = async (customer: any) => {
    setCurrentCustomer(customer);
    await fetchVehicles(customer.id);
    setShowDetailsModal(true);
  };

  const handleGenerateNewImage = () => {
    const imageUrl = getCarImageUrl(vehicleFormData.make, vehicleFormData.model, vehicleFormData.year);
    setVehicleFormData({ ...vehicleFormData, imageUrl });
  };

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      // Clean up payload - remove empty trim
      const payload = { ...vehicleFormData };
      if (!payload.trim) {
        delete payload.trim;
      }

      console.log('Submitting vehicle:', payload);
      await axios.post(`${API_URL}/customers/${currentCustomer.id}/vehicles`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchVehicles(currentCustomer.id);
      const defaultYear = new Date().getFullYear();
      setVehicleFormData({ make: '', model: '', year: defaultYear, trim: '', color: '', licensePlate: '', type: 'SEDAN', imageUrl: '' });
      setCarModels([]);
      setCarTrims([]);
      fetchCarMakes(defaultYear);
    } catch (error: any) {
      console.error('Failed:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to add vehicle';
      alert(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Delete this vehicle?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${API_URL}/customers/${currentCustomer.id}/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchVehicles(currentCustomer.id);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  // Sort customers by latest first
  const sortedCustomers = [...customers].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (latest first)
  });

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
        <button onClick={handleCreate} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5">
          <Plus className="h-5 w-5" /> New Customer
        </button>
      </div>

      <div className="grid gap-6">
        {paginatedCustomers.map((customer) => (
          <div key={customer.id} className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white">
                    {customer.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-sm text-slate-600">{customer.email}</p>
                    <p className="text-sm text-slate-600">{customer.phone}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 text-white">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      <span className="text-sm font-medium">Loyalty Points</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{customer.loyaltyPoints || 0}</p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-4 text-white">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-sm font-medium">Total Spent</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{formatCurrency(customer.totalSpent || 0)}</p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 text-white">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      <span className="text-sm font-medium">Bookings</span>
                    </div>
                    <p className="mt-2 text-3xl font-bold">{customer.totalBookings || 0}</p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      <span className="text-sm font-medium">Rank</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold">{customer.badges?.[0]?.badge?.name || 'Bronze'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleViewDetails(customer)} className="rounded-lg bg-green-100 p-3 text-green-600 hover:bg-green-200" title="View Details">
                  <Eye className="h-5 w-5" />
                </button>
                <button onClick={() => handleAddVehicle(customer.id)} className="rounded-lg bg-purple-100 p-3 text-purple-600 hover:bg-purple-200" title="Manage Vehicles">
                  <Car className="h-5 w-5" />
                </button>
                <button onClick={() => handleEdit(customer)} className="rounded-lg bg-blue-100 p-3 text-blue-600 hover:bg-blue-200" title="Edit Customer">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(customer.id)} className="rounded-lg bg-red-100 p-3 text-red-600 hover:bg-red-200" title="Delete Customer">
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedCustomers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        colorScheme="blue"
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">{editMode ? 'Edit' : 'New'} Customer</h2>
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

      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">Vehicles - {currentCustomer?.firstName} {currentCustomer?.lastName}</h2>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                  <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200">
                    {vehicle.imageUrl ? (
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Car className="h-16 w-16 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{vehicle.make} {vehicle.model}</h4>
                        <p className="text-sm text-slate-600 mt-1">Year: {vehicle.year}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{vehicle.type}</span>
                          <span className="text-xs text-slate-600">{vehicle.color}</span>
                        </div>
                        <p className="mt-2 text-sm font-mono font-semibold text-slate-700">{vehicle.licensePlate}</p>
                      </div>
                      <button onClick={() => handleDeleteVehicle(vehicle.id)} className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200">
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4 border-t pt-6">
              <h3 className="font-semibold">Add New Vehicle</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Year</label>
                  <select
                    required
                    value={vehicleFormData.year}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    {carYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Make</label>
                  <select
                    required
                    value={vehicleFormData.make}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    disabled={loadingMakes || carMakes.length === 0}
                  >
                    <option value="">Select Make</option>
                    {carMakes.map((make) => (
                      <option key={make.make_id} value={make.make_display}>
                        {make.make_display}
                      </option>
                    ))}
                  </select>
                  {loadingMakes && <p className="text-xs text-slate-500 mt-1">Loading makes...</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Model</label>
                  <select
                    required
                    value={vehicleFormData.model}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    disabled={!vehicleFormData.make || loadingModels || carModels.length === 0}
                  >
                    <option value="">Select Model</option>
                    {carModels.map((model) => (
                      <option key={model.model_name} value={model.model_name}>
                        {model.model_name}
                      </option>
                    ))}
                  </select>
                  {loadingModels && <p className="text-xs text-slate-500 mt-1">Loading models...</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Trim (Optional)</label>
                  <select
                    value={vehicleFormData.trim}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, trim: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2"
                    disabled={!vehicleFormData.model || loadingTrims || carTrims.length === 0}
                  >
                    <option value="">Select Trim</option>
                    {carTrims.map((trim) => (
                      <option key={trim.model_id} value={trim.model_trim}>
                        {trim.model_trim}
                      </option>
                    ))}
                  </select>
                  {loadingTrims && <p className="text-xs text-slate-500 mt-1">Loading trims...</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <input required type="text" value={vehicleFormData.color} onChange={(e) => setVehicleFormData({ ...vehicleFormData, color: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">License Plate</label>
                  <input required type="text" value={vehicleFormData.licensePlate} onChange={(e) => setVehicleFormData({ ...vehicleFormData, licensePlate: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Type</label>
                  <select value={vehicleFormData.type} onChange={(e) => setVehicleFormData({ ...vehicleFormData, type: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2">
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                  </select>
                </div>
              </div>

              {vehicleFormData.imageUrl && (
                <div className="rounded-lg border-2 border-slate-200 p-2">
                  <img
                    src={vehicleFormData.imageUrl}
                    alt="Car preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Vehicle image</p>
                    <button
                      type="button"
                      onClick={handleGenerateNewImage}
                      className="flex items-center gap-1 rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-200 transition"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Change Image
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-semibold text-white hover:shadow-lg transition">
                Add Vehicle
              </button>
            </form>

            <button onClick={() => setShowVehicleModal(false)} className="mt-4 w-full rounded-lg bg-slate-200 py-3 font-semibold text-slate-700">
              Close
            </button>
          </div>
        </div>
      )}

      {showDetailsModal && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customer Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-3xl font-bold text-white">
                  {currentCustomer.firstName.charAt(0)}{currentCustomer.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900">{currentCustomer.firstName} {currentCustomer.lastName}</h3>
                  <p className="text-slate-600 mt-1">{currentCustomer.email}</p>
                  <p className="text-slate-600">{currentCustomer.phone}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span className="text-sm font-medium">Loyalty Points</span>
                </div>
                <p className="mt-2 text-3xl font-bold">{currentCustomer.loyaltyPoints || 0}</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <p className="mt-2 text-3xl font-bold">{formatCurrency(currentCustomer.totalSpent || 0)}</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Bookings</span>
                </div>
                <p className="mt-2 text-3xl font-bold">{currentCustomer.totalBookings || 0}</p>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm font-medium">Rank</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{currentCustomer.badges?.[0]?.badge?.name || 'Bronze'}</p>
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Vehicles ({vehicles.length})</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleAddVehicle(currentCustomer.id);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Vehicle
                </button>
              </div>

              {vehicles.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
                        {vehicle.imageUrl ? (
                          <img
                            src={vehicle.imageUrl}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Car className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-slate-900">{vehicle.make} {vehicle.model}</h4>
                        <p className="text-xs text-slate-600 mt-1">Year: {vehicle.year}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">{vehicle.type}</span>
                          <span className="text-xs text-slate-600">{vehicle.color}</span>
                        </div>
                        <p className="mt-2 text-xs font-mono font-semibold text-slate-700">{vehicle.licensePlate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
                  <Car className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-slate-600">No vehicles registered</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
