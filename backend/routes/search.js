const express = require('express');
const { globalSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', globalSearch);

module.exports = router;