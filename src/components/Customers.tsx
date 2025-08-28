import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin, Building, User } from 'lucide-react';
import { apiService } from '../services/api';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessType: string;
  workCategory: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Overdue';
  outstandingDues: number;
  address: {
    city: string;
    state: string;
  };
  createdAt: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter, businessTypeFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (businessTypeFilter !== 'all') params.businessType = businessTypeFilter;
      
      const response = await apiService.getCustomers(params);
      if (response.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: Customer['status']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Overdue':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse`;
      case 'Suspended':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'Inactive':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return baseClasses;
    }
  };

  const businessTypes = ['Construction', 'Mining', 'Agriculture', 'Infrastructure', 'Manufacturing', 'Other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-brand-accent dark:text-white">Customer Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your customer relationships and rental history
          </p>
        </div>
        <button className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-accent font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg">
          <Plus className="h-5 w-5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-brand-accent rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Overdue">Overdue</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Business Types</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer._id}
            className="bg-white dark:bg-brand-accent rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 hover:shadow-brand-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-6">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-xl flex items-center justify-center text-brand-accent font-bold text-lg shadow-brand">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-accent dark:text-white">
                      {customer.name}
                    </h3>
                    <span className={getStatusBadge(customer.status)}>
                      {customer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-brand-primary" />
                  <span className="text-gray-600 dark:text-gray-300">{customer.businessType}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{customer.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-300">{customer.phone}</span>
                </div>
                
                {customer.address && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {customer.address.city}, {customer.address.state}
                    </span>
                  </div>
                )}
              </div>

              {/* Outstanding Dues */}
              {customer.outstandingDues > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Outstanding Dues</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">
                      ₹{customer.outstandingDues.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-light text-brand-accent text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-105">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                
                <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200">
                  <Edit className="h-4 w-4" />
                </button>
                
                <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
          </p>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-accent font-bold rounded-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Customers;