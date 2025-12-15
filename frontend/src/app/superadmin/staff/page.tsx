'use client';

import { useEffect, useState } from 'react';
import { UserCog, Award, TrendingUp, CheckCircle, Building2, Search } from 'lucide-react';
import axios from 'axios';
import Pagination from '@/components/Pagination';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function AllStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerFilter, setCenterFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [staffRes, centersRes] = await Promise.all([
        axios.get(`${API_URL}/staff`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/centers`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStaff(staffRes.data.data || staffRes.data);
      setCenters(centersRes.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = centerFilter === 'ALL' ? staff : staff.filter(s => s.centerId === centerFilter);

  // Sort by latest first
  const sortedStaff = [...filteredStaff].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA; // Descending order (latest first)
  });

  // Pagination
  const totalPages = Math.ceil(sortedStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = sortedStaff.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [centerFilter]);

  const activeStaff = sortedStaff.filter(s => s.isActive);
  const totalCompleted = sortedStaff.reduce((sum, s) => sum + (s.completedJobs || 0), 0);

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={centerFilter}
          onChange={(e) => setCenterFilter(e.target.value)}
          className="rounded-lg border border-purple-300 bg-white px-4 py-2 font-medium focus:border-purple-500 focus:outline-none"
        >
          <option value="ALL">All Centers</option>
          {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="ml-auto rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-2">
          <p className="text-sm font-medium text-purple-900">{sortedStaff.length} staff members</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 text-white">
          <UserCog className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Total Staff</p>
          <p className="mt-2 text-3xl font-bold">{sortedStaff.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white">
          <CheckCircle className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Active Staff</p>
          <p className="mt-2 text-3xl font-bold">{activeStaff.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
          <Award className="h-8 w-8 mb-2 opacity-90" />
          <p className="text-sm opacity-90">Total Jobs Done</p>
          <p className="mt-2 text-3xl font-bold">{totalCompleted}</p>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {paginatedStaff.map((member) => (
          <div key={member.id} className="rounded-2xl bg-white p-6 shadow-xl hover:shadow-2xl transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                  {member.firstName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{member.firstName} {member.lastName}</h3>
                  <p className="text-sm text-slate-600">{member.email}</p>
                  <div className="mt-1 flex gap-2">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      {member.role}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {member.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
              <Building2 className="h-4 w-4" />
              <span>{centers.find(c => c.id === member.centerId)?.name || 'Unknown Center'}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600">Jobs Done</p>
                <p className="text-xl font-bold text-green-600">{member.completedJobs || 0}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600">Rating</p>
                <p className="text-xl font-bold text-blue-600">{member.rating?.toFixed(1) || '5.0'}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 text-center">
                <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600">Badges</p>
                <p className="text-xl font-bold text-purple-600">{member.badges?.length || 0}</p>
              </div>
            </div>

            {member.badges && member.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {member.badges.map((badge: any) => (
                  <span key={badge.id} className="rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
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
        totalItems={sortedStaff.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        colorScheme="purple"
      />
    </div>
  );
}
