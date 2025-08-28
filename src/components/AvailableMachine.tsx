import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, MapPin } from 'lucide-react';
import { AvailableMachine } from '../types';

interface AvailableMachinesProps {
  machines: AvailableMachine[];
}

const AvailableMachines: React.FC<AvailableMachinesProps> = ({ machines }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStatusBadge = (status: AvailableMachine['status']) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Available':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'Maintenance':
        return `${baseClasses} bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200`;
      default:
        return baseClasses;
    }
  };

  const availableCount = machines.filter(m => m.status === 'Available').length;
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div 
        className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-accent dark:text-white">Available Equipment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {availableCount} available, {maintenanceCount} in maintenance
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map((machine) => (
              <div key={machine.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-brand-accent dark:text-white">{machine.id}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{machine.type}</p>
                  </div>
                  <span className={getStatusBadge(machine.status)}>
                    {machine.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{machine.location}</span>
                </div>

                <button 
                  className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    machine.status === 'Available'
                      ? 'bg-brand-primary hover:bg-brand-primary-light text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={machine.status !== 'Available'}
                >
                  {machine.status === 'Available' ? 'Assign to Customer' : 'Under Maintenance'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableMachines;