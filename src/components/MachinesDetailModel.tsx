import React from 'react';
import { X, Clock, Fuel, Leaf, Wrench } from 'lucide-react';
import { Customer, Machine } from '../types';

interface MachineDetailsModalProps {
  customer: Customer;
  machines: Machine[];
  isOpen: boolean;
  onClose: () => void;
}

const MachineDetailsModal: React.FC<MachineDetailsModalProps> = ({ 
  customer, 
  machines, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const customerMachines = machines.filter(m => m.customerId === customer.id);

  const getConditionBadge = (condition: Machine['condition']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (condition) {
      case 'Good':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Needs Maintenance':
        return `${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200`;
      case 'Critical':
        return `${baseClasses} bg-brand-red/10 text-brand-red dark:bg-brand-red/20 dark:text-red-300`;
      default:
        return baseClasses;
    }
  };

  const getConditionIcon = (condition: Machine['condition']) => {
    switch (condition) {
      case 'Good':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'Needs Maintenance':
        return <div className="w-3 h-3 bg-amber-500 rounded-full"></div>;
      case 'Critical':
        return <div className="w-3 h-3 bg-brand-red rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-brand-accent dark:text-white">{customer.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">Site: {customer.siteId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerMachines.map((machine) => (
              <div key={machine.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-brand-accent dark:text-white">{machine.id}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{machine.type}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConditionIcon(machine.condition)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Site:</span>
                    <span className="text-sm font-medium text-brand-accent dark:text-white">{machine.site}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Check-In:</span>
                    <span className="text-sm text-brand-accent dark:text-white">{machine.checkIn}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Return Due:</span>
                    <span className="text-sm text-brand-accent dark:text-white">{machine.returnDue}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Condition:</span>
                    <span className={getConditionBadge(machine.condition)}>{machine.condition}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Runtime</p>
                        <p className="text-sm font-medium text-brand-accent dark:text-white">{machine.runtime}h</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Idle Time</p>
                        <p className="text-sm font-medium text-brand-accent dark:text-white">{machine.idleTime}h</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Fuel className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fuel Used</p>
                        <p className="text-sm font-medium text-brand-accent dark:text-white">{machine.fuelUsed}L</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">CO₂ Emitted</p>
                        <p className="text-sm font-medium text-brand-accent dark:text-white">{machine.co2Emitted}kg</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineDetailsModal;