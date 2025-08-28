const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Dealer = require('../models/Dealer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register dealer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
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

    const { name, email, password, phone, businessName, address } = req.body;

    // Check if dealer already exists
    const existingDealer = await Dealer.findOne({ email });
    if (existingDealer) {
      return res.status(400).json({
        success: false,
        message: 'Dealer with this email already exists'
      });
    }

    // Create dealer
    const dealer = await Dealer.create({
      name,
      email,
      password,
      phone,
      businessName,
      address
    });

    // Generate token
    const token = generateToken(dealer._id);

    res.status(201).json({
      success: true,
      message: 'Dealer registered successfully',
      data: {
        dealer,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login dealer
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
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

    const { email, password } = req.body;

    // Check if dealer exists and get password
    const dealer = await Dealer.findOne({ email }).select('+password');
    if (!dealer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!dealer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await dealer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    dealer.lastLogin = new Date();
    await dealer.save();

    // Generate token
    const token = generateToken(dealer._id);

    // Remove password from response
    dealer.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        dealer,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current dealer
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.dealer._id);
    
    res.status(200).json({
      success: true,
      data: dealer
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update dealer profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'businessName', 'address', 'preferences'];
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
      message: 'Profile updated successfully',
      data: dealer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    // Get dealer with password
    const dealer = await Dealer.findById(req.dealer._id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await dealer.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    dealer.password = newPassword;
    await dealer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const dealer = await Dealer.findOne({ email });
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'No dealer found with this email'
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the database with expiry
    // 3. Send email with reset link
    
    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Implementation for password reset
    // This would verify the reset token and update password
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};