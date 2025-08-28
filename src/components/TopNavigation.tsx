import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SearchBar from './SearchBar';

interface TopNavigationProps {
  dealerName: string;
  notificationCount: number;
  onNotificationClick: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ 
  dealerName, 
  notificationCount, 
  onNotificationClick 
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-brand-accent border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="animate-slide-in">
          <h2 className="text-3xl font-bold text-brand-accent dark:text-white bg-gradient-to-r from-brand-accent to-brand-secondary bg-clip-text">
            Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, <span className="font-semibold text-brand-primary">{dealerName}</span>
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="animate-scale-in">
            <SearchBar />
          </div>
          
          <button 
            onClick={onNotificationClick}
            className="relative p-3 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-200 hover:bg-brand-primary/10 rounded-lg group animate-bounce-subtle"
          >
            <Bell className="h-6 w-6 group-hover:animate-pulse" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse shadow-lg">
                {notificationCount}
              </span>
            )}
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-200 hover:bg-brand-primary/10 rounded-lg transform hover:scale-110 animate-scale-in"
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
          
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-full flex items-center justify-center text-brand-accent font-bold shadow-brand">
              {dealerName.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-brand-accent dark:text-white">{dealerName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;