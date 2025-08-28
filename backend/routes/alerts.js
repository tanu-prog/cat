const express = require('express');
const {
  getAlerts,
  getAlert,
  markAsRead,
  markAsResolved,
  dismissAlert,
  getUnreadCount
} = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getAlerts);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getAlert);
router.put('/:id/read', markAsRead);
router.put('/:id/resolve', markAsResolved);
router.put('/:id/dismiss', dismissAlert);

module.exports = router;