import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import TopNavigation from './components/TopNavigation';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import RentalInventory from './components/RentalInventory';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';
import { NavItem } from './types';

function AppContent() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const { isAuthenticated, dealer } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers />;
      case 'inventory':
        return <RentalInventory />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigation 
            dealerName={dealer?.name || 'Dealer'} 
            notificationCount={3}
            onNotificationClick={() => setActiveNav('alerts')}
          />
          
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;