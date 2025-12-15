'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { LayoutDashboard, Users, UserCog, Building2, Settings, TrendingUp, BarChart3, Shield, Bell, LogOut, ChevronLeft, Activity, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/superadmin' },
    { name: 'Analytics', icon: BarChart3, path: '/superadmin/analytics' },
    { name: 'Centers', icon: Building2, path: '/superadmin/centers' },
    { name: 'All Bookings', icon: Activity, path: '/superadmin/bookings' },
    { name: 'All Customers', icon: Users, path: '/superadmin/customers' },
    { name: 'All Staff', icon: UserCog, path: '/superadmin/staff' },
    { name: 'Notifications', icon: Bell, path: '/superadmin/notifications' },
    { name: 'Revenue', icon: DollarSign, path: '/superadmin/revenue' },
    { name: 'System', icon: Settings, path: '/superadmin/system' },
  ];

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-gradient-to-b from-purple-900 via-purple-800 to-pink-900 text-white shadow-2xl flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {!collapsed && <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">SuperAdmin</h1>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-white/10 rounded-lg transition">
            <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${isActive ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'}`}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{item.name}</span>}
                  {isActive && !collapsed && <div className="ml-auto h-2 w-2 rounded-full bg-pink-300 animate-pulse" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 font-bold flex-shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.username}</p>
                <p className="text-xs text-purple-200">Super Admin</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition">
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="bg-white/60 backdrop-blur-sm border-b border-purple-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {navItems.find(item => item.path === pathname)?.name || 'SuperAdmin'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-purple-100 rounded-lg transition">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-pink-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
