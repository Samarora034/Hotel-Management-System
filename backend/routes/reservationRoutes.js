const express = require('express');
const router = express.Router();
const {
  checkAvailability,
  createReservation,
  getUserReservations,
  cancelReservation,
  getAllReservations,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

// All reservation routes require authentication
router.use(protect);

// Customer & Admin routes
router.get('/availability', checkAvailability);
router.post('/', createReservation);
router.get('/my', getUserReservations);
router.patch('/:id/cancel', cancelReservation);

// Admin-only routes
router.get('/', authorize('Admin'), getAllReservations);

module.exports = router;
