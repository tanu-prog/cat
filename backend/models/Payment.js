const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  rentalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Cheque', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled', 'Refunded'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: Date,
  overdueDays: {
    type: Number,
    default: 0
  },
  lateFee: {
    type: Number,
    default: 0
  },
  discount: {
    amount: { type: Number, default: 0 },
    reason: String,
    approvedBy: String
  },
  tax: {
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  paymentDetails: {
    transactionId: String,
    chequeNumber: String,
    bankName: String,
    upiId: String,
    cardLast4: String,
    reference: String
  },
  paymentHistory: [{
    amount: Number,
    method: String,
    date: Date,
    reference: String,
    notes: String
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

// Calculate balance amount before saving
paymentSchema.pre('save', function(next) {
  this.balanceAmount = this.amount - this.paidAmount;
  this.updatedAt = Date.now();
  
  // Calculate overdue days
  if (this.dueDate && this.paymentStatus !== 'Paid') {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    if (today > dueDate) {
      this.overdueDays = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
      if (this.paymentStatus === 'Pending' || this.paymentStatus === 'Partial') {
        this.paymentStatus = 'Overdue';
      }
    }
  }
  
  next();
});

// Index for efficient queries
paymentSchema.index({ dealerId: 1, paymentStatus: 1 });
paymentSchema.index({ dealerId: 1, customerId: 1 });
paymentSchema.index({ dealerId: 1, rentalId: 1 });
paymentSchema.index({ dealerId: 1, dueDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);