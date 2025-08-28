import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Wrench, MapPin, Calendar, Truck, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface Vehicle {
  _id: string;
  vehicleId: string;
  type: string;
  model: string;
  brand: string;
  year: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Maintenance' | 'Under Repair' | 'Damaged';
  status: 'Available' | 'Rented' | 'Reserved' | 'Under Maintenance' | 'Out of Service';
  location: {
    depot: string;
    address: string;
  };
  rentalRate: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  currentRental?: {
    rentalId: string;
    customerId: string;
    endDate: string;
  };
  operatingHours: {
    total: number;
    sinceLastMaintenance: number;
  };
  maintenanceSchedule: {
    nextMaintenance: string;
    maintenanceType: string;
  };
  createdAt: string;
}

interface RentalInventoryProps {
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

const RentalInventory: React.FC<RentalInventoryProps> = ({ onVehicleSelect }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter, typeFilter, conditionFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (conditionFilter !== 'all') params.condition = conditionFilter;
      
      const response = await apiService.getVehicles(params);
      if (response.success) {
        setVehicles(response.data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Vehicle['status']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (status) {
      case 'Available':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Rented':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'Reserved':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'Under Maintenance':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'Out of Service':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return baseClasses;
    }
  };

  const getConditionBadge = (condition: Vehicle['condition']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide";
    switch (condition) {
      case 'Excellent':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Good':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
      case 'Fair':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'Needs Maintenance':
        return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`;
      case 'Under Repair':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case 'Damaged':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse`;
      default:
        return baseClasses;
    }
  };

  const getStatusIcon = (status: Vehicle['status']) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rented':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'Under Maintenance':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'Out of Service':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCreateVehicle = () => {
    setShowCreateModal(true);
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    onVehicleSelect?.(vehicle);
  };

  const vehicleTypes = ['Excavator', 'Bulldozer', 'Crane', 'Loader', 'Grader', 'Dump Truck', 'Compactor', 'Other'];
  const conditions = ['Excellent', 'Good', 'Fair', 'Needs Maintenance', 'Under Repair', 'Damaged'];
  const statuses = ['Available', 'Rented', 'Reserved', 'Under Maintenance', 'Out of Service'];

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
          <h2 className="text-3xl font-bold text-brand-accent dark:text-white">Rental Inventory</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your equipment fleet and rental inventory
          </p>
        </div>
        <button 
          onClick={handleCreateVehicle}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-accent font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-brand hover:shadow-brand-lg">
          <Plus className="h-5 w-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fleet</p>
              <p className="text-2xl font-bold text-brand-accent dark:text-white">{vehicles.length}</p>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-xl">
              <Package className="h-6 w-6 text-brand-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'Available').length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rented</p>
              <p className="text-2xl font-bold text-blue-600">{vehicles.filter(v => v.status === 'Rented').length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{vehicles.filter(v => v.status === 'Under Maintenance').length}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-brand-accent rounded-2xl p-6 shadow-brand border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of Service</p>
              <p className="text-2xl font-bold text-red-600">{vehicles.filter(v => v.status === 'Out of Service').length}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
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
              placeholder="Search vehicles by ID, type, model, or brand..."
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
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Types</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Conditions</option>
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle, index) => (
          <div
            key={vehicle._id}
            className="bg-white dark:bg-brand-accent rounded-2xl shadow-brand border border-gray-200 dark:border-gray-700 hover:shadow-brand-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-6">
              {/* Vehicle Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-xl flex items-center justify-center text-brand-accent font-bold text-lg shadow-brand">
                    {vehicle.type.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-accent dark:text-white">
                      {vehicle.vehicleId}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(vehicle.status)}
                </div>
              </div>

              {/* Status and Condition */}
              <div className="flex items-center space-x-2 mb-4">
                <span className={getStatusBadge(vehicle.status)}>
                  {vehicle.status}
                </span>
                <span className={getConditionBadge(vehicle.condition)}>
                  {vehicle.condition}
                </span>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <Package className="h-4 w-4 text-brand-primary" />
                  <span className="text-gray-600 dark:text-gray-300">{vehicle.type}</span>
                </div>
                
                {vehicle.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600 dark:text-gray-300">{vehicle.location.depot}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {vehicle.operatingHours.total}h total runtime
                  </span>
                </div>
              </div>

              {/* Rental Rates */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rental Rates</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Daily</p>
                    <p className="font-bold text-brand-accent dark:text-white">₹{vehicle.rentalRate?.daily || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Weekly</p>
                    <p className="font-bold text-brand-accent dark:text-white">₹{vehicle.rentalRate?.weekly || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">Monthly</p>
                    <p className="font-bold text-brand-accent dark:text-white">₹{vehicle.rentalRate?.monthly || 0}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewVehicle(vehicle)}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-light text-brand-accent text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-105">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                
                <button className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200">
                  <Edit className="h-4 w-4" />
                </button>
                
                <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-200">
                  <Wrench className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No vehicles found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first vehicle'}
          </p>
          <button 
            onClick={handleCreateVehicle}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-accent font-bold rounded-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RentalInventory;