import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/api';

interface DashboardData {
  summary: {
    customers: {
      total: number;
      active: number;
      overdue: number;
    };
    vehicles: {
      total: number;
      available: number;
      rented: number;
      maintenance: number;
    };
    rentals: {
      active: number;
      overdue: number;
    };
    alerts: {
      total: number;
      unread: number;
    };
    payments: {
      overdue: number;
    };
  };
  recentRentals: any[];
  vehiclesByType: any[];
  rentalStatusDistribution: any[];
  monthlyTrends: any[];
  topCustomers: any[];
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-caterpillar-yellow"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Customers',
      value: dashboardData.summary.customers.active,
      icon: Users,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Equipment',
      value: dashboardData.summary.vehicles.total,
      icon: Package,
      color: 'from-caterpillar-yellow to-caterpillar-yellow-light',
      bgColor: 'bg-caterpillar-yellow/10',
      textColor: 'text-caterpillar-yellow',
    },
    {
      title: 'Available Units',
      value: dashboardData.summary.vehicles.available,
      icon: TrendingUp,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600',
    },
    {
      title: 'Overdue Rentals',
      value: dashboardData.summary.rentals.overdue,
      icon: AlertTriangle,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-caterpillar-black rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700 hover:shadow-brand-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-caterpillar-black dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className={`h-2 bg-gradient-to-r ${stat.color} rounded-full opacity-20`}></div>
                <div 
                  className={`h-2 bg-gradient-to-r ${stat.color} rounded-full -mt-2 animate-pulse`}
                  style={{ width: `${Math.min((stat.value / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Rentals */}
      <div className="bg-white dark:bg-caterpillar-black rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-caterpillar-yellow/5 to-caterpillar-yellow/10">
          <h3 className="text-2xl font-bold text-caterpillar-black dark:text-white">Recent Rentals</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Latest rental activities and status updates</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-caterpillar-gray">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rental ID
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-caterpillar-black divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData.recentRentals.slice(0, 5).map((rental, index) => (
                <tr 
                  key={rental._id} 
                  className="hover:bg-caterpillar-yellow/5 dark:hover:bg-gray-700 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-caterpillar-black dark:text-white">
                      {rental.rentalId}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-caterpillar-black dark:text-white">
                      {rental.customerId?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {rental.customerId?.businessType || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-caterpillar-black dark:text-white">
                      {rental.vehicleId?.vehicleId || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {rental.vehicleId?.type} - {rental.vehicleId?.model}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      rental.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : rental.status === 'Overdue'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {rental.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-caterpillar-black dark:text-white">
                      ₹{rental.pricing?.finalAmount?.toLocaleString() || '0'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-caterpillar-black rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-caterpillar-black dark:text-white mb-4">Vehicle Types</h4>
          <div className="space-y-3">
            {dashboardData.vehiclesByType.slice(0, 5).map((type, index) => (
              <div key={type._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{type._id}</span>
                <span className="text-sm font-bold text-caterpillar-black dark:text-white">{type.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-caterpillar-black rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-caterpillar-black dark:text-white mb-4">Rental Status</h4>
          <div className="space-y-3">
            {dashboardData.rentalStatusDistribution.map((status, index) => (
              <div key={status._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{status._id}</span>
                <span className="text-sm font-bold text-caterpillar-black dark:text-white">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-caterpillar-black rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-caterpillar-black dark:text-white mb-4">Top Customers</h4>
          <div className="space-y-3">
            {dashboardData.topCustomers.slice(0, 5).map((customer, index) => (
              <div key={customer._id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-caterpillar-black dark:text-white">{customer.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{customer.businessType}</div>
                </div>
                <span className="text-sm font-bold text-caterpillar-yellow">{customer.rentalCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;