  import React from 'react';
  import { Bell, Sun, Moon } from 'lucide-react';
  import { useTheme } from '../contexts/ThemeContext';
  
  interface TopNavigationProps {
    dealerName: string;
    notificationCount: number;
  }
  
  const TopNavigation: React.FC<TopNavigationProps> = ({ dealerName, notificationCount }) => {
    const { isDark, toggleTheme } = useTheme();
  
    return (
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-accent dark:text-white">Dashboard</h2>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {dealerName}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default TopNavigation;