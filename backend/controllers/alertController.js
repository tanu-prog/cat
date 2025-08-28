const Alert = require('../models/Alert');

// @desc    Get all alerts for dealer
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    const dealerId = req.dealer._id;
    const { 
      status = 'all', 
      type = 'all', 
      priority = 'all',
      page = 1, 
      limit = 20 
    } = req.query;

    // Build filter
    const filter = { dealerId };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    if (type !== 'all') {
      filter.type = type;
    }
    
    if (priority !== 'all') {
      filter.priority = priority;
    }

    // Get alerts with pagination
    const alerts = await Alert.find(filter)
      .populate('relatedEntity.entityId')
      .sort({ createdAt: -1, priority: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count
    const total = await Alert.countDocuments(filter);

    // Get counts by status
    const statusCounts = await Alert.aggregate([
      { $match: { dealerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by priority
    const priorityCounts = await Alert.aggregate([
      { $match: { dealerId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        alerts,
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
          priority: priorityCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {})
        }
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alerts'
    });
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
const getAlert = async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      dealerId: req.dealer._id
    }).populate('relatedEntity.entityId');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alert'
    });
  }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealer._id },
      {
        isRead: true,
        readAt: new Date(),
        readBy: req.dealer._id
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      data: alert
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking alert as read'
    });
  }
};

// @desc    Mark alert as resolved
// @route   PUT /api/alerts/:id/resolve
// @access  Private
const markAsResolved = async (req, res) => {
  try {
    const { actionDescription } = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealer._id },
      {
        status: 'Resolved',
        resolvedAt: new Date(),
        resolvedBy: req.dealer._id,
        actionTaken: {
          description: actionDescription,
          takenBy: req.dealer._id,
          takenAt: new Date()
        }
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert marked as resolved',
      data: alert
    });
  } catch (error) {
    console.error('Mark as resolved error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving alert'
    });
  }
};

// @desc    Dismiss alert
// @route   PUT /api/alerts/:id/dismiss
// @access  Private
const dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, dealerId: req.dealer._id },
      { status: 'Dismissed' },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert dismissed',
      data: alert
    });
  } catch (error) {
    console.error('Dismiss alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while dismissing alert'
    });
  }
};

// @desc    Get unread alerts count
// @route   GET /api/alerts/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Alert.countDocuments({
      dealerId: req.dealer._id,
      isRead: false,
      status: 'Active'
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
};

module.exports = {
  getAlerts,
  getAlert,
  markAsRead,
  markAsResolved,
  dismissAlert,
  getUnreadCount
};