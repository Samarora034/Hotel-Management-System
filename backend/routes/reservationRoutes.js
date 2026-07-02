const express = require('express');
const router = express.Router();
const {
  checkAvailability,
  createReservation,
  getUserReservations,
  cancelReservation,
  getAllReservations
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

// everything below requires login
router.use(protect);

router.get('/availability', checkAvailability);
router.post('/', createReservation);
router.get('/my', getUserReservations);
router.patch('/:id/cancel', cancelReservation);

// admin only
router.get('/', authorize('Admin'), getAllReservations);

module.exports = router;
