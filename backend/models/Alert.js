const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  type: {
    type: String,
    enum: [
      'OVERDUE_RENTAL',
      'OVERDUE_PAYMENT',
      'DAMAGED_RETURN',
      'MAINTENANCE_DUE',
      'REPAIR_REQUIRED',
      'INSURANCE_EXPIRY',
      'CONTRACT_EXPIRY',
      'LOW_FUEL',
      'SYSTEM_ALERT'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required']
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['Customer', 'Vehicle', 'Rental', 'Payment', 'System']
    },
    entityId: mongoose.Schema.Types.ObjectId,
    entityName: String
  },
  status: {
    type: String,
    enum: ['Active', 'Acknowledged', 'Resolved', 'Dismissed'],
    default: 'Active'
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    description: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer'
    },
    takenAt: Date
  },
  dueDate: Date,
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer'
  },
  metadata: {
    overdueAmount: Number,
    overdueDays: Number,
    vehicleId: String,
    customerId: String,
    rentalId: String,
    maintenanceType: String,
    repairCost: Number
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    sentAt: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt field before saving
alertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
alertSchema.index({ dealerId: 1, status: 1 });
alertSchema.index({ dealerId: 1, type: 1 });
alertSchema.index({ dealerId: 1, priority: 1 });
alertSchema.index({ dealerId: 1, isRead: 1 });
alertSchema.index({ dealerId: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);