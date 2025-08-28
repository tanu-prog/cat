const Alert = require('../models/Alert');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');

// Generate alerts automatically
const generateAlerts = async () => {
  try {
    console.log('🔔 Starting alert generation...');

    // Generate overdue rental alerts
    await generateOverdueRentalAlerts();
    
    // Generate overdue payment alerts
    await generateOverduePaymentAlerts();
    
    // Generate maintenance due alerts
    await generateMaintenanceDueAlerts();
    
    // Generate damaged return alerts
    await generateDamagedReturnAlerts();

    console.log('✅ Alert generation completed successfully');
  } catch (error) {
    console.error('❌ Error generating alerts:', error);
    throw error;
  }
};

// Generate overdue rental alerts
const generateOverdueRentalAlerts = async () => {
  try {
    const today = new Date();
    
    // Find overdue rentals
    const overdueRentals = await Rental.find({
      status: 'Active',
      endDate: { $lt: today }
    }).populate('customerId vehicleId');

    for (const rental of overdueRentals) {
      // Check if alert already exists
      const existingAlert = await Alert.findOne({
        dealerId: rental.dealerId,
        type: 'OVERDUE_RENTAL',
        'relatedEntity.entityId': rental._id,
        status: 'Active'
      });

      if (!existingAlert) {
        const overdueDays = Math.ceil((today - rental.endDate) / (1000 * 60 * 60 * 24));
        
        await Alert.create({
          dealerId: rental.dealerId,
          type: 'OVERDUE_RENTAL',
          priority: overdueDays > 7 ? 'Critical' : 'High',
          title: `Overdue Rental - ${rental.rentalId}`,
          message: `Rental ${rental.rentalId} is ${overdueDays} days overdue. Customer: ${rental.customerId.name}, Vehicle: ${rental.vehicleId.vehicleId}`,
          relatedEntity: {
            entityType: 'Rental',
            entityId: rental._id,
            entityName: rental.rentalId
          },
          actionRequired: true,
          metadata: {
            overdueDays,
            vehicleId: rental.vehicleId.vehicleId,
            customerId: rental.customerId.name,
            rentalId: rental.rentalId
          }
        });

        // Update rental status
        rental.status = 'Overdue';
        await rental.save();
      }
    }

    console.log(`Generated ${overdueRentals.length} overdue rental alerts`);
  } catch (error) {
    console.error('Error generating overdue rental alerts:', error);
  }
};

// Generate overdue payment alerts
const generateOverduePaymentAlerts = async () => {
  try {
    const today = new Date();
    
    // Find overdue payments
    const overduePayments = await Payment.find({
      paymentStatus: { $in: ['Pending', 'Partial'] },
      dueDate: { $lt: today }
    }).populate('customerId rentalId');

    for (const payment of overduePayments) {
      // Check if alert already exists
      const existingAlert = await Alert.findOne({
        dealerId: payment.dealerId,
        type: 'OVERDUE_PAYMENT',
        'relatedEntity.entityId': payment._id,
        status: 'Active'
      });

      if (!existingAlert) {
        const overdueDays = Math.ceil((today - payment.dueDate) / (1000 * 60 * 60 * 24));
        
        await Alert.create({
          dealerId: payment.dealerId,
          type: 'OVERDUE_PAYMENT',
          priority: overdueDays > 15 ? 'Critical' : 'High',
          title: `Overdue Payment - ${payment.invoiceNumber}`,
          message: `Payment ${payment.invoiceNumber} is ${overdueDays} days overdue. Amount: ₹${payment.balanceAmount}, Customer: ${payment.customerId.name}`,
          relatedEntity: {
            entityType: 'Payment',
            entityId: payment._id,
            entityName: payment.invoiceNumber
          },
          actionRequired: true,
          metadata: {
            overdueDays,
            overdueAmount: payment.balanceAmount,
            customerId: payment.customerId.name,
            rentalId: payment.rentalId?.rentalId
          }
        });

        // Update payment status
        payment.paymentStatus = 'Overdue';
        await payment.save();
      }
    }

    console.log(`Generated ${overduePayments.length} overdue payment alerts`);
  } catch (error) {
    console.error('Error generating overdue payment alerts:', error);
  }
};

// Generate maintenance due alerts
const generateMaintenanceDueAlerts = async () => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Find vehicles due for maintenance
    const vehiclesDue = await Vehicle.find({
      isActive: true,
      'maintenanceSchedule.nextMaintenance': { $lte: nextWeek }
    });

    for (const vehicle of vehiclesDue) {
      // Check if alert already exists
      const existingAlert = await Alert.findOne({
        dealerId: vehicle.dealerId,
        type: 'MAINTENANCE_DUE',
        'relatedEntity.entityId': vehicle._id,
        status: 'Active'
      });

      if (!existingAlert) {
        const daysUntilMaintenance = Math.ceil(
          (vehicle.maintenanceSchedule.nextMaintenance - today) / (1000 * 60 * 60 * 24)
        );
        
        await Alert.create({
          dealerId: vehicle.dealerId,
          type: 'MAINTENANCE_DUE',
          priority: daysUntilMaintenance <= 0 ? 'Critical' : 'Medium',
          title: `Maintenance Due - ${vehicle.vehicleId}`,
          message: `Vehicle ${vehicle.vehicleId} (${vehicle.type}) is due for maintenance ${daysUntilMaintenance <= 0 ? 'now' : `in ${daysUntilMaintenance} days`}`,
          relatedEntity: {
            entityType: 'Vehicle',
            entityId: vehicle._id,
            entityName: vehicle.vehicleId
          },
          actionRequired: true,
          dueDate: vehicle.maintenanceSchedule.nextMaintenance,
          metadata: {
            vehicleId: vehicle.vehicleId,
            maintenanceType: vehicle.maintenanceSchedule.maintenanceType || 'Regular'
          }
        });
      }
    }

    console.log(`Generated ${vehiclesDue.length} maintenance due alerts`);
  } catch (error) {
    console.error('Error generating maintenance due alerts:', error);
  }
};

// Generate damaged return alerts
const generateDamagedReturnAlerts = async () => {
  try {
    // Find recently returned rentals with damage
    const damagedReturns = await Rental.find({
      status: 'Completed',
      conditionOnReturn: { $in: ['Damaged', 'Broken'] },
      actualReturnDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    }).populate('customerId vehicleId');

    for (const rental of damagedReturns) {
      // Check if alert already exists
      const existingAlert = await Alert.findOne({
        dealerId: rental.dealerId,
        type: 'DAMAGED_RETURN',
        'relatedEntity.entityId': rental._id,
        status: 'Active'
      });

      if (!existingAlert) {
        await Alert.create({
          dealerId: rental.dealerId,
          type: 'DAMAGED_RETURN',
          priority: rental.conditionOnReturn === 'Broken' ? 'Critical' : 'High',
          title: `Damaged Return - ${rental.rentalId}`,
          message: `Vehicle ${rental.vehicleId.vehicleId} returned in ${rental.conditionOnReturn.toLowerCase()} condition by ${rental.customerId.name}`,
          relatedEntity: {
            entityType: 'Rental',
            entityId: rental._id,
            entityName: rental.rentalId
          },
          actionRequired: true,
          metadata: {
            vehicleId: rental.vehicleId.vehicleId,
            customerId: rental.customerId.name,
            rentalId: rental.rentalId,
            returnCondition: rental.conditionOnReturn
          }
        });
      }
    }

    console.log(`Generated ${damagedReturns.length} damaged return alerts`);
  } catch (error) {
    console.error('Error generating damaged return alerts:', error);
  }
};

module.exports = {
  generateAlerts,
  generateOverdueRentalAlerts,
  generateOverduePaymentAlerts,
  generateMaintenanceDueAlerts,
  generateDamagedReturnAlerts
};