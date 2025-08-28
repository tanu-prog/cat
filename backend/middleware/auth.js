const jwt = require('jsonwebtoken');
const Dealer = require('../models/Dealer');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get dealer from token
      const dealer = await Dealer.findById(decoded.id).select('-password');
      
      if (!dealer) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. Dealer not found.'
        });
      }

      if (!dealer.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      req.dealer = dealer;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.dealer) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    if (!roles.includes(req.dealer.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.dealer.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Check if dealer owns the resource
const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check if the resource belongs to the authenticated dealer
      if (resource.dealerId.toString() !== req.dealer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in ownership verification'
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  checkOwnership
};