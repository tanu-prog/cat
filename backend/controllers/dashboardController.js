const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');
const Alert = require('../models/Alert');
const Payment = require('../models/Payment');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const dealerId = req.dealer._id;

    // Get counts and statistics
    const [
      totalCustomers,
      activeCustomers,
      overdueCustomers,
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      activeRentals,
      overdueRentals,
      totalAlerts,
      unreadAlerts,
      overduePayments
    ] = await Promise.all([
      Customer.countDocuments({ dealerId, isActive: true }),
      Customer.countDocuments({ dealerId, status: 'Active' }),
      Customer.countDocuments({ dealerId, status: 'Overdue' }),
      Vehicle.countDocuments({ dealerId, isActive: true }),
      Vehicle.countDocuments({ dealerId, status: 'Available' }),
      Vehicle.countDocuments({ dealerId, status: 'Rented' }),
      Vehicle.countDocuments({ dealerId, status: 'Under Maintenance' }),
      Rental.countDocuments({ dealerId, status: 'Active' }),
      Rental.countDocuments({ dealerId, status: 'Overdue' }),
      Alert.countDocuments({ dealerId, status: 'Active' }),
      Alert.countDocuments({ dealerId, isRead: false }),
      Payment.countDocuments({ dealerId, paymentStatus: 'Overdue' })
    ]);

    // Get recent rentals with customer and vehicle details
    const recentRentals = await Rental.find({ dealerId })
      .populate('customerId', 'name businessType')
      .populate('vehicleId', 'vehicleId type model')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get vehicles by type
    const vehiclesByType = await Vehicle.aggregate([
      { $match: { dealerId, isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get rental status distribution
    const rentalStatusDistribution = await Rental.aggregate([
      { $match: { dealerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get monthly rental trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Rental.aggregate([
      { 
        $match: { 
          dealerId, 
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.finalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top customers by rental count
    const topCustomers = await Rental.aggregate([
      { $match: { dealerId } },
      { $group: { _id: '$customerId', rentalCount: { $sum: 1 } } },
      { $sort: { rentalCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      { $unwind: '$customer' },
      {
        $project: {
          name: '$customer.name',
          businessType: '$customer.businessType',
          rentalCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          customers: {
            total: totalCustomers,
            active: activeCustomers,
            overdue: overdueCustomers
          },
          vehicles: {
            total: totalVehicles,
            available: availableVehicles,
            rented: rentedVehicles,
            maintenance: maintenanceVehicles
          },
          rentals: {
            active: activeRentals,
            overdue: overdueRentals
          },
          alerts: {
            total: totalAlerts,
            unread: unreadAlerts
          },
          payments: {
            overdue: overduePayments
          }
        },
        recentRentals,
        vehiclesByType,
        rentalStatusDistribution,
        monthlyTrends,
        topCustomers
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const dealerId = req.dealer._id;
    const { period = '30' } = req.query; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Revenue analytics
    const revenueData = await Rental.aggregate([
      {
        $match: {
          dealerId,
          createdAt: { $gte: startDate },
          status: { $in: ['Completed', 'Active'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$pricing.finalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Utilization rate
    const utilizationData = await Vehicle.aggregate([
      { $match: { dealerId, isActive: true } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Customer satisfaction (based on return conditions)
    const satisfactionData = await Rental.aggregate([
      {
        $match: {
          dealerId,
          conditionOnReturn: { $exists: true },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$conditionOnReturn',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueData,
        utilization: utilizationData,
        satisfaction: satisfactionData,
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
};

module.exports = {
  getDashboardData,
  getAnalytics
};