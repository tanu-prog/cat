import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Save, Key, Bell, Palette, Globe, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface ThemePreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

const Settings: React.FC = () => {
  const { dealer, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true
  });

  // Theme preferences
  const [themePrefs, setThemePrefs] = useState<ThemePreferences>({
    theme: 'light',
    language: 'en'
  });

  useEffect(() => {
    if (dealer) {
      setProfileData({
        name: dealer.name || '',
        email: dealer.email || '',
        phone: dealer.phone || '',
        businessName: dealer.businessName || '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India'
        }
      });
      
      if (dealer.preferences) {
        setNotifications(dealer.preferences.notifications);
        setThemePrefs({
          theme: dealer.preferences.theme as 'light' | 'dark' | 'auto',
          language: dealer.preferences.language
        });
      }
    }
  }, [dealer]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        setMessage('Profile updated successfully!');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await apiService.updateNotificationPreferences(notifications);
      if (response.success) {
        setMessage('Notification preferences updated!');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-caterpillar-black dark:text-white">Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={logout}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg"
        >
          Sign Out
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'} animate-fade-in`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-caterpillar-black rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-caterpillar-yellow text-caterpillar-black shadow-brand'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-caterpillar-yellow/10 hover:text-caterpillar-black'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-caterpillar-black rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 p-8">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-2xl font-bold text-caterpillar-black dark:text-white mb-6">Profile Information</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                        <User className="h-4 w-4 inline mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                        <Building className="h-4 w-4 inline mr-2" />
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={profileData.businessName}
                        onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-caterpillar-yellow hover:bg-yellow-400 text-caterpillar-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 className="text-2xl font-bold text-caterpillar-black dark:text-white mb-6">Security Settings</h3>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-caterpillar-yellow hover:bg-yellow-400 text-caterpillar-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg disabled:opacity-50"
                  >
                    <Key className="h-5 w-5" />
                    <span>{loading ? 'Updating...' : 'Change Password'}</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-2xl font-bold text-caterpillar-black dark:text-white mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <h4 className="font-bold text-caterpillar-black dark:text-white">Email Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts and updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-caterpillar-yellow/25 dark:peer-focus:ring-caterpillar-yellow/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-caterpillar-yellow"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <h4 className="font-bold text-caterpillar-black dark:text-white">SMS Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive critical alerts via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.sms}
                        onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-caterpillar-yellow/25 dark:peer-focus:ring-caterpillar-yellow/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-caterpillar-yellow"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <h4 className="font-bold text-caterpillar-black dark:text-white">Push Notifications</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive browser notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-caterpillar-yellow/25 dark:peer-focus:ring-caterpillar-yellow/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-caterpillar-yellow"></div>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleNotificationUpdate}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-caterpillar-yellow hover:bg-yellow-400 text-caterpillar-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h3 className="text-2xl font-bold text-caterpillar-black dark:text-white mb-6">App Preferences</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                      <Palette className="h-4 w-4 inline mr-2" />
                      Theme
                    </label>
                    <select
                      value={themePrefs.theme}
                      onChange={(e) => setThemePrefs({...themePrefs, theme: e.target.value as 'light' | 'dark' | 'auto'})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-caterpillar-black dark:text-white mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={themePrefs.language}
                      onChange={(e) => setThemePrefs({...themePrefs, language: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-caterpillar-black dark:text-white focus:ring-2 focus:ring-caterpillar-yellow focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;