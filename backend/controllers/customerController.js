const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');

// @desc    Get all customers for dealer
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  try {
    const dealerId = req.dealer._id;
    const { 
      status = 'all', 
      businessType = 'all',
      page = 1, 
      limit = 20,
      search = ''
    } = req.query;

    // Build filter
    const filter = { dealerId, isActive: true };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (businessType !== 'all') {
      filter.businessType = businessType;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get customers with pagination
    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Customer.countDocuments(filter);

    // Get counts by status
    const statusCounts = await Customer.aggregate([
      { $match: { dealerId, isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        counts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customers'
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = async (req, res) => {
  try {
    const customer = req.resource; // Set by checkOwnership middleware

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer'
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const customerData = {
      ...req.body,
      dealerId: req.dealer._id
    };

    const customer = await Customer.create(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Create customer error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating customer'
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating customer'
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting customer'
    });
  }
};

// @desc    Get customer rental history
// @route   GET /api/customers/:id/rental-history
// @access  Private
const getCustomerRentalHistory = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    const rentals = await Rental.find({ customerId })
      .populate('vehicleId', 'vehicleId type model brand')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error('Get rental history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental history'
    });
  }
};

// @desc    Get customer analytics
// @route   GET /api/customers/:id/analytics
// @access  Private
const getCustomerAnalytics = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Get rental analytics
    const analytics = await Rental.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: null,
          totalRentals: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.finalAmount' },
          averageRentalDuration: { $avg: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 1000 * 60 * 60 * 24] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0] || { totalRentals: 0, totalRevenue: 0, averageRentalDuration: 0 }
    });
  } catch (error) {
    console.error('Get customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer analytics'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerRentalHistory,
  getCustomerAnalytics
};