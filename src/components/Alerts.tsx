import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, X, Eye, Filter, Search } from 'lucide-react';
import { apiService } from '../services/api';

interface Alert {
  _id: string;
  type: 'OVERDUE_RENTAL' | 'OVERDUE_PAYMENT' | 'DAMAGED_RETURN' | 'MAINTENANCE_DUE' | 'REPAIR_REQUIRED' | 'INSURANCE_EXPIRY' | 'CONTRACT_EXPIRY' | 'LOW_FUEL' | 'SYSTEM_ALERT';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  message: string;
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  isRead: boolean;
  createdAt: string;
  dueDate?: string;
  relatedEntity?: {
    entityType: string;
    entityId: string;
    entityName: string;
  };
  metadata?: {
    overdueAmount?: number;
    overdueDays?: number;
    vehicleId?: string;
    customerId?: string;
    rentalId?: string;
  };
}

interface AlertsProps {
  onAlertUpdate?: () => void;
}

const Alerts: React.FC<AlertsProps> = ({ onAlertUpdate }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, priorityFilter, typeFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await apiService.getAlerts(params);
      if (response.success) {
        setAlerts(response.data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await apiService.markAlertAsRead(alertId);
      setAlerts(alerts.map(alert => 
        alert._id === alertId ? { ...alert, isRead: true } : alert
      ));
      onAlertUpdate?.();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleResolveAlert = async (alertId: string, actionDescription: string) => {
    try {
      await apiService.resolveAlert(alertId, actionDescription);
      setAlerts(alerts.map(alert => 
        alert._id === alertId ? { ...alert, status: 'Resolved' } : alert
      ));
      onAlertUpdate?.();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.relatedEntity?.entityName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: Alert['priority']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (priority) {
      case 'Critical':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse`;
      case 'High':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'Medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'Low':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      default:
        return baseClasses;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (status) {
      case 'Active':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'Acknowledged':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'Resolved':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Dismissed':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return baseClasses;
    }
  };

  const getAlertIcon = (type: Alert['type'], priority: Alert['priority']) => {
    const iconClass = priority === 'Critical' ? 'animate-pulse' : '';
    
    switch (type) {
      case 'OVERDUE_RENTAL':
      case 'OVERDUE_PAYMENT':
        return <Clock className={`h-5 w-5 text-red-500 ${iconClass}`} />;
      case 'DAMAGED_RETURN':
      case 'REPAIR_REQUIRED':
        return <AlertTriangle className={`h-5 w-5 text-orange-500 ${iconClass}`} />;
      case 'MAINTENANCE_DUE':
        return <AlertTriangle className={`h-5 w-5 text-yellow-500 ${iconClass}`} />;
      default:
        return <Bell className={`h-5 w-5 text-blue-500 ${iconClass}`} />;
    }
  };

  const getTypeLabel = (type: Alert['type']) => {
    const labels = {
      'OVERDUE_RENTAL': 'Overdue Rental',
      'OVERDUE_PAYMENT': 'Overdue Payment',
      'DAMAGED_RETURN': 'Damaged Return',
      'MAINTENANCE_DUE': 'Maintenance Due',
      'REPAIR_REQUIRED': 'Repair Required',
      'INSURANCE_EXPIRY': 'Insurance Expiry',
      'CONTRACT_EXPIRY': 'Contract Expiry',
      'LOW_FUEL': 'Low Fuel',
      'SYSTEM_ALERT': 'System Alert'
    };
    return labels[type] || type;
  };

  const alertTypes = Object.keys({
    'OVERDUE_RENTAL': 'Overdue Rental',
    'OVERDUE_PAYMENT': 'Overdue Payment',
    'DAMAGED_RETURN': 'Damaged Return',
    'MAINTENANCE_DUE': 'Maintenance Due',
    'REPAIR_REQUIRED': 'Repair Required',
    'INSURANCE_EXPIRY': 'Insurance Expiry',
    'CONTRACT_EXPIRY': 'Contract Expiry',
    'LOW_FUEL': 'Low Fuel',
    'SYSTEM_ALERT': 'System Alert'
  });

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
          <h2 className="text-3xl font-bold text-brand-accent dark:text-white">Alerts & Notifications</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage system alerts and notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-red-600">
            {alerts.filter(a => a.status === 'Active').length} Active Alerts
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-brand-accent dark:text-white">{alerts.length}</p>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-xl">
              <Bell className="h-6 w-6 text-brand-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-red-600">{alerts.filter(a => a.priority === 'Critical').length}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
              <p className="text-2xl font-bold text-orange-600">{alerts.filter(a => !a.isRead).length}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'Resolved').length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-brand-accent rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts by title, message, or entity..."
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
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Types</option>
              {alertTypes.map(type => (
                <option key={type} value={type}>{getTypeLabel(type as Alert['type'])}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => (
          <div
            key={alert._id}
            className={`bg-white dark:bg-brand-accent rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 hover:shadow-brand-lg transition-all duration-300 animate-fade-in ${
              !alert.isRead ? 'ring-2 ring-brand-primary/20' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type, alert.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className={`text-lg font-bold ${!alert.isRead ? 'text-brand-primary' : 'text-brand-accent dark:text-white'}`}>
                        {alert.title}
                      </h3>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={getPriorityBadge(alert.priority)}>
                        {alert.priority}
                      </span>
                      <span className={getStatusBadge(alert.status)}>
                        {alert.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTypeLabel(alert.type)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {alert.message}
                    </p>
                    
                    {alert.relatedEntity && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Related {alert.relatedEntity.entityType}: 
                          <span className="font-medium text-brand-accent dark:text-white ml-1">
                            {alert.relatedEntity.entityName}
                          </span>
                        </p>
                      </div>
                    )}
                    
                    {alert.metadata && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {alert.metadata.overdueDays && (
                          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Overdue Days</p>
                            <p className="text-lg font-bold text-red-600">{alert.metadata.overdueDays}</p>
                          </div>
                        )}
                        {alert.metadata.overdueAmount && (
                          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                            <p className="text-lg font-bold text-orange-600">₹{alert.metadata.overdueAmount.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(alert.createdAt).toLocaleDateString()}</span>
                      {alert.dueDate && (
                        <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert._id)}
                      className="p-2 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all duration-200"
                      title="Mark as read"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  
                  {alert.status === 'Active' && (
                    <button
                      onClick={() => handleResolveAlert(alert._id, 'Resolved via dashboard')}
                      className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all duration-200"
                      title="Mark as resolved"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alerts found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search criteria' : 'All clear! No active alerts at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Alerts;