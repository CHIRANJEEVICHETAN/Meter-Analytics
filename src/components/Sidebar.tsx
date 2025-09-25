'use client';

import { Home, BarChart3, Activity, Thermometer, Zap, Gauge, Settings, Users } from 'lucide-react';

export default function Sidebar() {
  const navigationItems = [
    { name: 'Dashboard', icon: Home, active: true },
    { name: 'Analytics', icon: BarChart3, active: false },
    { name: 'Devices', icon: Activity, active: false },
    { name: 'Temperature', icon: Thermometer, active: false },
    { name: 'Energy', icon: Zap, active: false },
    { name: 'Vibration', icon: Gauge, active: false },
    { name: 'Team', icon: Users, active: false },
    { name: 'Settings', icon: Settings, active: false },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">IoT Analytics</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">User</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
