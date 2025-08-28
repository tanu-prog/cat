const express = require('express');
const { getDashboardData, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getDashboardData);
router.get('/analytics', getAnalytics);

module.exports = router;