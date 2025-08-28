const { validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');

// @desc    Get all vehicles for dealer
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    const dealerId = req.dealer._id;
    const { 
      status = 'all', 
      type = 'all',
      condition = 'all',
      page = 1, 
      limit = 20,
      search = ''
    } = req.query;

    // Build filter
    const filter = { dealerId, isActive: true };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (type !== 'all') {
      filter.type = type;
    }

    if (condition !== 'all') {
      filter.condition = condition;
    }

    if (search) {
      filter.$or = [
        { vehicleId: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Get vehicles with pagination
    const vehicles = await Vehicle.find(filter)
      .populate('currentRental', 'rentalId customerId startDate endDate')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Vehicle.countDocuments(filter);

    // Get counts by status
    const statusCounts = await Vehicle.aggregate([
      { $match: { dealerId, isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by type
    const typeCounts = await Vehicle.aggregate([
      { $match: { dealerId, isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        vehicles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        counts: {
          status: statusCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          type: typeCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicles'
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('currentRental')
      .populate({
        path: 'currentRental',
        populate: {
          path: 'customerId',
          select: 'name email phone businessType'
        }
      });

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Get vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle'
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
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

    const vehicleData = {
      ...req.body,
      dealerId: req.dealer._id
    };

    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating vehicle'
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
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

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle'
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting vehicle'
    });
  }
};

// @desc    Get vehicle rental history
// @route   GET /api/vehicles/:id/history
// @access  Private
const getVehicleHistory = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    const rentals = await Rental.find({ vehicleId })
      .populate('customerId', 'name email phone businessType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error('Get vehicle history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vehicle history'
    });
  }
};

// @desc    Update vehicle status
// @route   PUT /api/vehicles/:id/status
// @access  Private
const updateVehicleStatus = async (req, res) => {
  try {
    const { status, condition } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (condition) updateData.condition = condition;

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Vehicle status updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating vehicle status'
    });
  }
};

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleHistory,
  updateVehicleStatus
};