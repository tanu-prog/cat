import React from 'react';
import { LayoutDashboard, Users, Package, AlertTriangle, Settings, Truck } from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNavChange }) => {
  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers' as NavItem, label: 'Customers', icon: Users },
    { id: 'inventory' as NavItem, label: 'Rental Inventory', icon: Package },
    { id: 'alerts' as NavItem, label: 'Alerts', icon: AlertTriangle },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-primary p-2 rounded-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-accent dark:text-white">EcoTrackAI</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dealer Portal</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    activeNav === item.id
                      ? 'bg-brand-primary text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;