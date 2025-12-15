'use client';

import { useEffect, useState } from 'react';
import { Trophy, Star, Award, TrendingUp, Users, Crown } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function LeaderboardsPage() {
  const [customerLeaderboard, setCustomerLeaderboard] = useState<any[]>([]);
  const [staffLeaderboard, setStaffLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [customersRes, staffRes] = await Promise.all([
        axios.get(`${API_URL}/customers/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/staff/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setCustomerLeaderboard(customersRes.data);
      setStaffLeaderboard(staffRes.data);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-500 to-cyan-500';
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) return <Crown className="h-6 w-6 text-white" />;
    return <Trophy className="h-6 w-6 text-white" />;
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Leaderboards</h1>
        <p className="mt-2 text-slate-600">Top performers in loyalty points and job completion</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Customer Leaderboard */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top Customers</h2>
              <p className="text-sm text-slate-600">By loyalty points</p>
            </div>
          </div>

          <div className="space-y-3">
            {customerLeaderboard.map((customer, idx) => (
              <div
                key={customer.id}
                className={`flex items-center gap-4 rounded-xl p-4 transition ${idx < 3 ? 'bg-gradient-to-r from-slate-50 to-blue-50 ring-2 ring-blue-200' : 'bg-slate-50'
                  }`}
              >
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getMedalColor(idx + 1)} shadow-lg`}>
                  {idx < 3 ? getMedalIcon(idx + 1) : <span className="text-2xl font-bold text-white">#{idx + 1}</span>}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{customer.firstName} {customer.lastName}</h3>
                    {customer.badges && customer.badges.length > 0 && (
                      <div className="flex gap-1">
                        {customer.badges.slice(0, 2).map((badge: any) => (
                          <span key={badge.id} className="text-lg" title={badge.badge?.name || badge.name}>
                            {badge.badge?.icon || badge.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {customer.loyaltyPoints} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      {customer.totalSpent?.toFixed(0) || 0} TND
                    </span>
                    <span>{customer.totalBookings || 0} bookings</span>
                  </div>
                </div>

                {idx === 0 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <Crown className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            {customerLeaderboard.length === 0 && (
              <p className="py-8 text-center text-slate-500">No customers yet</p>
            )}
          </div>
        </div>

        {/* Staff Leaderboard */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Top Staff</h2>
              <p className="text-sm text-slate-600">By completed jobs</p>
            </div>
          </div>

          <div className="space-y-3">
            {staffLeaderboard.map((staff, idx) => (
              <div
                key={staff.id}
                className={`flex items-center gap-4 rounded-xl p-4 transition ${idx < 3 ? 'bg-gradient-to-r from-slate-50 to-cyan-50 ring-2 ring-cyan-200' : 'bg-slate-50'
                  }`}
              >
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getMedalColor(idx + 1)} shadow-lg`}>
                  {idx < 3 ? getMedalIcon(idx + 1) : <span className="text-2xl font-bold text-white">#{idx + 1}</span>}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{staff.firstName} {staff.lastName}</h3>
                    {staff.badges && staff.badges.length > 0 && (
                      <div className="flex gap-1">
                        {staff.badges.slice(0, 2).map((badge: any) => (
                          <span key={badge.id} className="text-lg" title={badge.badge?.name || badge.name}>
                            {badge.badge?.icon || badge.icon}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-blue-500" />
                      {staff.completedJobs || 0} jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {staff.rating?.toFixed(1) || '5.0'}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {staff.role}
                    </span>
                  </div>
                </div>

                {idx === 0 && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Crown className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}

            {staffLeaderboard.length === 0 && (
              <p className="py-8 text-center text-slate-500">No staff yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badges Overview */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <h2 className="mb-6 text-2xl font-bold">Achievement System</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 text-3xl">🥉</div>
            <h3 className="font-bold">Bronze</h3>
            <p className="mt-1 text-sm opacity-90">Starting level</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 text-3xl">🥈</div>
            <h3 className="font-bold">Silver</h3>
            <p className="mt-1 text-sm opacity-90">10+ bookings</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="mb-2 text-3xl">🥇</div>
            <h3 className="font-bold">Gold</h3>
            <p className="mt-1 text-sm opacity-90">50+ bookings</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
          <h3 className="mb-2 font-bold">Loyalty Rewards</h3>
          <p className="text-sm opacity-90">
            Customers earn 10% of booking amount as loyalty points. Staff earn badges based on completed jobs and performance ratings.
          </p>
        </div>
      </div>
    </div>
  );
}
