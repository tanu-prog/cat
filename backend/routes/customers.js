const express = require('express');
const { body } = require('express-validator');
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerRentalHistory,
  getCustomerAnalytics
} = require('../controllers/customerController');
const { protect, checkOwnership } = require('../middleware/auth');
const Customer = require('../models/Customer');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const customerValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('businessType').isIn(['Construction', 'Mining', 'Agriculture', 'Infrastructure', 'Manufacturing', 'Other']).withMessage('Invalid business type'),
  body('workCategory').trim().isLength({ min: 2 }).withMessage('Work category is required')
];

// Routes
router.get('/', getCustomers);
router.post('/', customerValidation, createCustomer);
router.get('/:id', checkOwnership(Customer), getCustomer);
router.put('/:id', checkOwnership(Customer), customerValidation, updateCustomer);
router.delete('/:id', checkOwnership(Customer), deleteCustomer);
router.get('/:id/rental-history', checkOwnership(Customer), getCustomerRentalHistory);
router.get('/:id/analytics', checkOwnership(Customer), getCustomerAnalytics);

module.exports = router;