'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCheck, 
  Droplets, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Bell
} from 'lucide-react';
import { useAuth } from '@/store/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [user, router]);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Staff', href: '/admin/staff', icon: UserCheck },
    { name: 'Services', href: '/admin/services', icon: Droplets },
    { name: 'Leaderboards', href: '/admin/leaderboards', icon: Trophy },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 shadow-2xl`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-4 border-b border-blue-500/30">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 shadow-lg">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CarWash+</h1>
                  <p className="text-xs text-blue-200">Admin Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="rounded-lg p-2 text-blue-200 hover:bg-blue-600/50 hover:text-white transition-colors"
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          {/* User Info */}
          <div className="border-b border-blue-500/30 p-4">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 text-white font-semibold shadow-lg ring-2 ring-blue-300">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              {!collapsed && (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-blue-200">{user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg scale-105'
                      : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
                  } ${collapsed ? 'justify-center' : 'space-x-3'}`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'animate-pulse' : ''}`} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-blue-500/30 p-3">
            <button
              onClick={handleLogout}
              className={`flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-blue-100 transition-colors hover:bg-red-500/50 hover:text-white ${
                collapsed ? 'justify-center' : 'space-x-3'
              }`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h2>
            <p className="text-sm text-slate-500">Welcome back, {user.firstName}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
