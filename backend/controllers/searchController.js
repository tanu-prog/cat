const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Rental = require('../models/Rental');

// @desc    Global search
// @route   GET /api/search?q=searchTerm&type=all
// @access  Private
const globalSearch = async (req, res) => {
  try {
    const { q: searchTerm, type = 'all', limit = 20 } = req.query;
    const dealerId = req.dealer._id;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search term must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(searchTerm.trim(), 'i');
    const results = {
      customers: [],
      vehicles: [],
      rentals: [],
      total: 0
    };

    // Search customers
    if (type === 'all' || type === 'customers') {
      const customers = await Customer.find({
        dealerId,
        isActive: true,
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { businessType: searchRegex },
          { workCategory: searchRegex }
        ]
      })
      .select('name email phone businessType status outstandingDues')
      .limit(parseInt(limit))
      .lean();

      results.customers = customers.map(customer => ({
        ...customer,
        type: 'customer',
        title: customer.name,
        subtitle: `${customer.businessType} • ${customer.status}`,
        description: customer.email
      }));
    }

    // Search vehicles
    if (type === 'all' || type === 'vehicles') {
      const vehicles = await Vehicle.find({
        dealerId,
        isActive: true,
        $or: [
          { vehicleId: searchRegex },
          { type: searchRegex },
          { model: searchRegex },
          { brand: searchRegex },
          { condition: searchRegex },
          { status: searchRegex }
        ]
      })
      .select('vehicleId type model brand condition status location')
      .limit(parseInt(limit))
      .lean();

      results.vehicles = vehicles.map(vehicle => ({
        ...vehicle,
        type: 'vehicle',
        title: vehicle.vehicleId,
        subtitle: `${vehicle.brand} ${vehicle.model}`,
        description: `${vehicle.type} • ${vehicle.status} • ${vehicle.condition}`
      }));
    }

    // Search rentals
    if (type === 'all' || type === 'rentals') {
      const rentals = await Rental.find({
        dealerId,
        $or: [
          { rentalId: searchRegex },
          { status: searchRegex },
          { paymentStatus: searchRegex }
        ]
      })
      .populate('customerId', 'name businessType')
      .populate('vehicleId', 'vehicleId type model')
      .select('rentalId status paymentStatus startDate endDate pricing')
      .limit(parseInt(limit))
      .lean();

      results.rentals = rentals.map(rental => ({
        ...rental,
        type: 'rental',
        title: rental.rentalId,
        subtitle: `${rental.customerId?.name} • ${rental.vehicleId?.vehicleId}`,
        description: `${rental.status} • Payment: ${rental.paymentStatus}`
      }));
    }

    // Calculate total results
    results.total = results.customers.length + results.vehicles.length + results.rentals.length;

    // If searching for all, limit total results and sort by relevance
    if (type === 'all') {
      const allResults = [
        ...results.customers,
        ...results.vehicles,
        ...results.rentals
      ];

      // Simple relevance scoring based on exact matches
      allResults.forEach(item => {
        const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const subtitleMatch = item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
        item.relevanceScore = (titleMatch ? 2 : 0) + (subtitleMatch ? 1 : 0);
      });

      // Sort by relevance and limit
      const sortedResults = allResults
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, parseInt(limit));

      // Redistribute sorted results
      results.customers = sortedResults.filter(item => item.type === 'customer');
      results.vehicles = sortedResults.filter(item => item.type === 'vehicle');
      results.rentals = sortedResults.filter(item => item.type === 'rental');
    }

    res.status(200).json({
      success: true,
      data: {
        searchTerm,
        type,
        results,
        pagination: {
          limit: parseInt(limit),
          total: results.total
        }
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
};

module.exports = {
  globalSearch
};