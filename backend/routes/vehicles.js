const express = require('express');
const { body } = require('express-validator');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleHistory,
  updateVehicleStatus
} = require('../controllers/vehicleController');
const { protect, checkOwnership } = require('../middleware/auth');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const vehicleValidation = [
  body('vehicleId').trim().isLength({ min: 3, max: 20 }).withMessage('Vehicle ID must be between 3 and 20 characters'),
  body('type').isIn(['Excavator', 'Bulldozer', 'Crane', 'Loader', 'Grader', 'Dump Truck', 'Compactor', 'Other']).withMessage('Invalid vehicle type'),
  body('model').trim().isLength({ min: 2 }).withMessage('Model is required'),
  body('brand').trim().isLength({ min: 2 }).withMessage('Brand is required'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Invalid year')
];

// Routes
router.get('/', getVehicles);
router.post('/', vehicleValidation, createVehicle);
router.get('/:id', checkOwnership(Vehicle), getVehicle);
router.put('/:id', checkOwnership(Vehicle), vehicleValidation, updateVehicle);
router.delete('/:id', checkOwnership(Vehicle), deleteVehicle);
router.get('/:id/history', checkOwnership(Vehicle), getVehicleHistory);
router.put('/:id/status', checkOwnership(Vehicle), updateVehicleStatus);

module.exports = router;