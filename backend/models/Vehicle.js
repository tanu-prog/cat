const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  vehicleId: {
    type: String,
    required: [true, 'Vehicle ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Excavator', 'Bulldozer', 'Crane', 'Loader', 'Grader', 'Dump Truck', 'Compactor', 'Other']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Vehicle brand is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
    min: [1990, 'Year must be after 1990'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  specifications: {
    enginePower: String,
    operatingWeight: String,
    bucketCapacity: String,
    maxDiggingDepth: String,
    maxReach: String,
    fuelCapacity: String,
    other: String
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Needs Maintenance', 'Under Repair', 'Damaged'],
    default: 'Good'
  },
  status: {
    type: String,
    enum: ['Available', 'Rented', 'Reserved', 'Under Maintenance', 'Out of Service'],
    default: 'Available'
  },
  location: {
    depot: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  rentalRate: {
    hourly: Number,
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  currentRental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental'
  },
  maintenanceSchedule: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceType: String,
    notes: String
  },
  operatingHours: {
    total: { type: Number, default: 0 },
    sinceLastMaintenance: { type: Number, default: 0 }
  },
  fuelConsumption: {
    average: Number,
    lastRecorded: Number,
    unit: { type: String, default: 'L/hr' }
  },
  documents: [{
    type: String,
    name: String,
    url: String,
    uploadDate: Date
  }],
  images: [{
    url: String,
    caption: String,
    uploadDate: Date
  }],
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageAmount: Number
  },
  purchaseDetails: {
    purchaseDate: Date,
    purchasePrice: Number,
    supplier: String,
    warrantyExpiry: Date
  },
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
vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
vehicleSchema.index({ dealerId: 1, vehicleId: 1 });
vehicleSchema.index({ dealerId: 1, status: 1 });
vehicleSchema.index({ dealerId: 1, type: 1 });
vehicleSchema.index({ dealerId: 1, condition: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);