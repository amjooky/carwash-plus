'use client';

import { useEffect, useState } from 'react';
import { Users, Star, Award, DollarSign, TrendingUp, Search } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '@/utils/currency';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AllCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data.data || response.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by latest first
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (latest first)
  });

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      {/* Search & Stats */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-purple-300 bg-white pl-10 pr-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-2">
          <p className="text-sm font-medium text-purple-900">{sortedCustomers.length} customers</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <Users className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Total Customers</p>
          <p className="mt-2 text-3xl font-bold">{customers.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
          <DollarSign className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Total Spent</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 p-6 text-white">
          <Star className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Loyalty Points</p>
          <p className="mt-2 text-3xl font-bold">{totalLoyaltyPoints.toLocaleString()}</p>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid gap-6">
        {paginatedCustomers.map((customer) => (
          <div key={customer.id} className="rounded-2xl bg-white p-6 shadow-xl hover:shadow-2xl transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white flex-shrink-0">
                  {customer.firstName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{customer.firstName} {customer.lastName}</h3>
                  <p className="text-sm text-slate-600">{customer.email}</p>
                  <p className="text-sm text-slate-600">{customer.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 ml-4">
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <Star className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Points</p>
                  <p className="text-lg font-bold text-purple-600">{customer.loyaltyPoints || 0}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Spent</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-slate-600">Bookings</p>
                  <p className="text-lg font-bold text-blue-600">{customer.totalBookings || 0}</p>
                </div>
              </div>
            </div>

            {customer.badges && customer.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {customer.badges.map((badge: any) => (
                  <span key={badge.id} className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    {badge.badge?.icon} {badge.badge?.name || 'Badge'}
                  </span>
                ))}
              </div>
            )}
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
        colorScheme="purple"
      />
    </div>
  );
}
