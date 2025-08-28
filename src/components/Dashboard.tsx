import React, { useState } from 'react';
import CustomerRentalsTable from './CustomerRentalTable';
import MachineDetailsModal from './MachinesDetailModel';
import AvailableMachines from './AvailableMachine';
import { Customer, Machine, AvailableMachine } from '../types';

interface DashboardProps {
  customers: Customer[];
  machines: Machine[];
  availableMachines: AvailableMachine[];
}

const Dashboard: React.FC<DashboardProps> = ({ customers, machines, availableMachines }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <div className="space-y-6">
      <CustomerRentalsTable 
        customers={customers} 
        onViewDetails={handleViewDetails} 
      />
      
      <AvailableMachines machines={availableMachines} />

      {selectedCustomer && (
        <MachineDetailsModal
          customer={selectedCustomer}
          machines={machines}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;