const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Vehicle = require('../models/Vehicle');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// Generate unique rental ID
const generateRentalId = async () => {
  const count = await Rental.countDocuments();
  return `RNT${String(count + 1).padStart(6, '0')}`;
};

// @desc    Get all rentals for dealer
// @route   GET /api/rentals
// @access  Private
const getRentals = async (req, res) => {
  try {
    const dealerId = req.dealer._id;
    const { 
      status = 'all', 
      paymentStatus = 'all',
      page = 1, 
      limit = 20,
      search = ''
    } = req.query;

    // Build filter
    const filter = { dealerId };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { rentalId: { $regex: search, $options: 'i' } }
      ];
    }

    // Get rentals with pagination
    const rentals = await Rental.find(filter)
      .populate('customerId', 'name email phone businessType')
      .populate('vehicleId', 'vehicleId type model brand')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Rental.countDocuments(filter);

    // Get counts by status
    const statusCounts = await Rental.aggregate([
      { $match: { dealerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        rentals,
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
    console.error('Get rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rentals'
    });
  }
};

// @desc    Get single rental
// @route   GET /api/rentals/:id
// @access  Private
const getRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('customerId')
      .populate('vehicleId')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    console.error('Get rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental'
    });
  }
};

// @desc    Create new rental
// @route   POST /api/rentals
// @access  Private
const createRental = async (req, res) => {
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

    const { customerId, vehicleId, startDate, endDate, pricing, siteDetails } = req.body;

    // Check if vehicle is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Vehicle is not available for rental'
      });
    }

    // Check if customer exists and is active
    const customer = await Customer.findById(customerId);
    if (!customer || !customer.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found or inactive'
      });
    }

    // Generate rental ID
    const rentalId = await generateRentalId();

    // Calculate pricing
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // days

    let baseAmount = 0;
    switch (pricing.rateType) {
      case 'Daily':
        baseAmount = pricing.rate * duration;
        break;
      case 'Weekly':
        baseAmount = pricing.rate * Math.ceil(duration / 7);
        break;
      case 'Monthly':
        baseAmount = pricing.rate * Math.ceil(duration / 30);
        break;
      default:
        baseAmount = pricing.rate * duration;
    }

    const taxAmount = baseAmount * 0.18; // 18% GST
    const finalAmount = baseAmount + taxAmount;

    const rentalData = {
      dealerId: req.dealer._id,
      customerId,
      vehicleId,
      rentalId,
      startDate,
      endDate,
      siteDetails,
      pricing: {
        ...pricing,
        baseAmount,
        taxAmount,
        finalAmount
      },
      createdBy: req.dealer._id
    };

    const rental = await Rental.create(rentalData);

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(vehicleId, {
      status: 'Rented',
      currentRental: rental._id
    });

    // Create payment record
    const paymentId = `PAY${String(await Payment.countDocuments() + 1).padStart(6, '0')}`;
    const invoiceNumber = `INV${String(await Payment.countDocuments() + 1).padStart(6, '0')}`;
    
    await Payment.create({
      dealerId: req.dealer._id,
      rentalId: rental._id,
      customerId,
      paymentId,
      invoiceNumber,
      amount: finalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: 'Pending',
      createdBy: req.dealer._id
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate('customerId', 'name email phone')
      .populate('vehicleId', 'vehicleId type model');

    res.status(201).json({
      success: true,
      message: 'Rental created successfully',
      data: populatedRental
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating rental'
    });
  }
};

// @desc    Update rental
// @route   PUT /api/rentals/:id
// @access  Private
const updateRental = async (req, res) => {
  try {
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId vehicleId');

    res.status(200).json({
      success: true,
      message: 'Rental updated successfully',
      data: rental
    });
  } catch (error) {
    console.error('Update rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating rental'
    });
  }
};

// @desc    Return rental
// @route   PUT /api/rentals/:id/return
// @access  Private
const returnRental = async (req, res) => {
  try {
    const { conditionOnReturn, operatingHours, fuelUsage, damageReport } = req.body;

    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        actualReturnDate: new Date(),
        conditionOnReturn,
        operatingHours,
        fuelUsage,
        damageReport
      },
      { new: true }
    );

    // Update vehicle status
    await Vehicle.findByIdAndUpdate(rental.vehicleId, {
      status: 'Available',
      condition: conditionOnReturn,
      currentRental: null,
      'operatingHours.total': operatingHours.final || 0
    });

    res.status(200).json({
      success: true,
      message: 'Rental returned successfully',
      data: rental
    });
  } catch (error) {
    console.error('Return rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while returning rental'
    });
  }
};

// @desc    Extend rental
// @route   PUT /api/rentals/:id/extend
// @access  Private
const extendRental = async (req, res) => {
  try {
    const { newEndDate, reason, additionalAmount } = req.body;

    const rental = await Rental.findById(req.params.id);

    rental.extensions.push({
      newEndDate,
      reason,
      additionalAmount,
      approvedBy: req.dealer.name,
      approvedDate: new Date()
    });

    rental.endDate = newEndDate;
    rental.status = 'Extended';
    rental.pricing.finalAmount += additionalAmount || 0;

    await rental.save();

    res.status(200).json({
      success: true,
      message: 'Rental extended successfully',
      data: rental
    });
  } catch (error) {
    console.error('Extend rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while extending rental'
    });
  }
};

// @desc    Get rental analytics
// @route   GET /api/rentals/analytics
// @access  Private
const getRentalAnalytics = async (req, res) => {
  try {
    const dealerId = req.dealer._id;
    const { period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Revenue analytics
    const revenueData = await Rental.aggregate([
      {
        $match: {
          dealerId,
          createdAt: { $gte: startDate }
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

    // Status distribution
    const statusData = await Rental.aggregate([
      { $match: { dealerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenue: revenueData,
        status: statusData,
        period: parseInt(period)
      }
    });
  } catch (error) {
    console.error('Get rental analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching rental analytics'
    });
  }
};

module.exports = {
  getRentals,
  getRental,
  createRental,
  updateRental,
  returnRental,
  extendRental,
  getRentalAnalytics
};