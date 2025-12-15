'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Building2, Users, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [centerName, setCenterName] = useState('My Center');

  useEffect(() => {
    const fetchCenter = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/centers/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data) {
          setCenterName(response.data.name);
        }
      } catch (error) {
        console.error('Failed to fetch center:', error);
      }
    };
    fetchCenter();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const menuItems = [
    { href: '/owner', icon: Home, label: 'Dashboard' },
    { href: '/owner/my-center', icon: Building2, label: 'My Center' },
    { href: '/owner/services', icon: Users, label: 'Services' },
    { href: '/owner/bookings', icon: Calendar, label: 'Bookings' },
    { href: '/owner/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-900 to-purple-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-purple-600">
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">CarWash+</h1>
              <p className="text-xs text-purple-200">Owner Panel</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-purple-600 transition"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {isSidebarOpen && (
            <div className="px-4 mb-4">
              <div className="bg-purple-800/50 rounded-lg p-3">
                <p className="text-xs text-purple-200">Your Center</p>
                <p className="font-semibold text-sm mt-1">{centerName}</p>
              </div>
            </div>
          )}
          
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-100 hover:bg-purple-600/50'
                  }`}
                  title={!isSidebarOpen ? item.label : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-purple-600 p-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-purple-100 hover:bg-purple-600/50 rounded-lg transition"
            title={!isSidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
