const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  rentalId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  actualReturnDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Overdue', 'Cancelled', 'Extended'],
    default: 'Active'
  },
  siteDetails: {
    siteName: String,
    siteAddress: String,
    siteContact: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  conditionOnRent: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Inspection'],
    default: 'Good'
  },
  conditionOnReturn: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Damaged', 'Broken', 'Not Returned']
  },
  operatingHours: {
    initial: { type: Number, default: 0 },
    final: Number,
    total: Number
  },
  fuelUsage: {
    initial: Number,
    final: Number,
    consumed: Number,
    cost: Number
  },
  damageReport: [{
    description: String,
    severity: {
      type: String,
      enum: ['Minor', 'Major', 'Critical']
    },
    repairCost: Number,
    images: [String],
    reportedDate: Date
  }],
  pricing: {
    rateType: {
      type: String,
      enum: ['Hourly', 'Daily', 'Weekly', 'Monthly'],
      required: true
    },
    rate: {
      type: Number,
      required: true
    },
    baseAmount: Number,
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    discounts: [{
      description: String,
      amount: Number
    }],
    totalAmount: Number,
    taxAmount: Number,
    finalAmount: Number
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Refunded'],
    default: 'Pending'
  },
  securityDeposit: {
    amount: Number,
    status: {
      type: String,
      enum: ['Pending', 'Received', 'Refunded', 'Adjusted'],
      default: 'Pending'
    },
    refundDate: Date
  },
  extensions: [{
    newEndDate: Date,
    reason: String,
    additionalAmount: Number,
    approvedBy: String,
    approvedDate: Date
  }],
  notes: String,
  createdBy: {
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
rentalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total operating hours
rentalSchema.pre('save', function(next) {
  if (this.operatingHours.initial && this.operatingHours.final) {
    this.operatingHours.total = this.operatingHours.final - this.operatingHours.initial;
  }
  next();
});

// Index for efficient queries
rentalSchema.index({ dealerId: 1, status: 1 });
rentalSchema.index({ dealerId: 1, customerId: 1 });
rentalSchema.index({ dealerId: 1, vehicleId: 1 });
rentalSchema.index({ dealerId: 1, endDate: 1 });
rentalSchema.index({ dealerId: 1, paymentStatus: 1 });

module.exports = mongoose.model('Rental', rentalSchema);