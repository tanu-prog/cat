const { validationResult } = require('express-validator');
const Dealer = require('../models/Dealer');

// @desc    Get dealer settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealer._id);
    
    res.status(200).json({
      success: true,
      data: {
        profile: {
          name: dealer.name,
          email: dealer.email,
          phone: dealer.phone,
          businessName: dealer.businessName,
          address: dealer.address
        },
        preferences: dealer.preferences,
        role: dealer.role,
        lastLogin: dealer.lastLogin,
        createdAt: dealer.createdAt
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching settings'
    });
  }
};

// @desc    Update dealer settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
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

    const allowedFields = ['name', 'phone', 'businessName', 'address'];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const dealer = await Dealer.findByIdAndUpdate(
      req.dealer._id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        profile: {
          name: dealer.name,
          email: dealer.email,
          phone: dealer.phone,
          businessName: dealer.businessName,
          address: dealer.address
        }
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/settings/notifications
// @access  Private
const updateNotificationPreferences = async (req, res) => {
  try {
    const { email, sms, push } = req.body;

    const dealer = await Dealer.findByIdAndUpdate(
      req.dealer._id,
      {
        'preferences.notifications': {
          email: email !== undefined ? email : true,
          sms: sms !== undefined ? sms : false,
          push: push !== undefined ? push : true
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        notifications: dealer.preferences.notifications
      }
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification preferences'
    });
  }
};

// @desc    Update theme preferences
// @route   PUT /api/settings/theme
// @access  Private
const updateThemePreferences = async (req, res) => {
  try {
    const { theme, language } = req.body;

    const updates = {};
    if (theme) updates['preferences.theme'] = theme;
    if (language) updates['preferences.language'] = language;

    const dealer = await Dealer.findByIdAndUpdate(
      req.dealer._id,
      updates,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Theme preferences updated successfully',
      data: {
        theme: dealer.preferences.theme,
        language: dealer.preferences.language
      }
    });
  } catch (error) {
    console.error('Update theme preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating theme preferences'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateNotificationPreferences,
  updateThemePreferences
};