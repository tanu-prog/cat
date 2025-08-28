const express = require('express');
const { body } = require('express-validator');
const {
  getRentals,
  getRental,
  createRental,
  updateRental,
  returnRental,
  extendRental,
  getRentalAnalytics
} = require('../controllers/rentalController');
const { protect, checkOwnership } = require('../middleware/auth');
const Rental = require('../models/Rental');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const rentalValidation = [
  body('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('pricing.rateType').isIn(['Hourly', 'Daily', 'Weekly', 'Monthly']).withMessage('Invalid rate type'),
  body('pricing.rate').isNumeric().withMessage('Rate must be a number')
];

// Routes
router.get('/', getRentals);
router.post('/', rentalValidation, createRental);
router.get('/analytics', getRentalAnalytics);
router.get('/:id', checkOwnership(Rental), getRental);
router.put('/:id', checkOwnership(Rental), updateRental);
router.put('/:id/return', checkOwnership(Rental), returnRental);
router.put('/:id/extend', checkOwnership(Rental), extendRental);

module.exports = router;