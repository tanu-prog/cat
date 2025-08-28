const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['Construction', 'Mining', 'Agriculture', 'Infrastructure', 'Manufacturing', 'Other']
  },
  workCategory: {
    type: String,
    required: [true, 'Work category is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  contactPerson: {
    name: String,
    designation: String,
    phone: String,
    email: String
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  outstandingDues: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: String,
    enum: ['Immediate', '15 days', '30 days', '45 days', '60 days'],
    default: '30 days'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Overdue'],
    default: 'Active'
  },
  rentalHistory: [{
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle'
    },
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental'
    },
    startDate: Date,
    endDate: Date,
    returnCondition: {
      type: String,
      enum: ['Good', 'Damaged', 'Broken', 'Needs Inspection']
    },
    totalAmount: Number,
    paidAmount: Number
  }],
  frequentlyRentedMachines: [{
    vehicleType: String,
    count: Number,
    lastRented: Date
  }],
  usagePatterns: {
    peakHours: [String],
    peakDays: [String],
    peakMonths: [String],
    averageRentalDuration: Number
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
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
customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
customerSchema.index({ dealerId: 1, email: 1 });
customerSchema.index({ dealerId: 1, status: 1 });
customerSchema.index({ dealerId: 1, businessType: 1 });

module.exports = mongoose.model('Customer', customerSchema);