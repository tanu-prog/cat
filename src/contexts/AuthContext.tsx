import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

interface Dealer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  role: string;
  preferences: {
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  dealer: Dealer | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedDealer = localStorage.getItem('dealer');
    
    if (token && storedDealer) {
      try {
        setDealer(JSON.parse(storedDealer));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored dealer:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('dealer');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        setDealer(response.data.dealer);
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setDealer(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      dealer,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};