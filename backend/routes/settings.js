const express = require('express');
const { body } = require('express-validator');
const {
  getSettings,
  updateSettings,
  updateNotificationPreferences,
  updateThemePreferences
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const settingsValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('businessName').optional().trim().isLength({ min: 2 }).withMessage('Business name is required')
];

// Routes
router.get('/', getSettings);
router.put('/', settingsValidation, updateSettings);
router.put('/notifications', updateNotificationPreferences);
router.put('/theme', updateThemePreferences);

module.exports = router;