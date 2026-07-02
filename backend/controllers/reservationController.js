const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// @desc    Check available tables for a given date, timeSlot, and guest count
// @route   GET /api/reservations/availability?date=YYYY-MM-DD&timeSlot=HH:MM&guests=N
// @access  Private (Customer, Admin)
const checkAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot, guests } = req.query;

    // Validate required params
    if (!date || !timeSlot || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, timeSlot, and guests query parameters',
      });
    }

    const guestCount = parseInt(guests, 10);
    if (isNaN(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Guests must be a positive number',
      });
    }

    // Find all tables that have enough capacity for the guest count
    const suitableTables = await Table.find({ capacity: { $gte: guestCount } });

    if (suitableTables.length === 0) {
      return res.status(200).json({
        success: true,
        availableTables: [],
        message: 'No tables have enough capacity for the requested guest count',
      });
    }

    // Find tables already booked (Confirmed) for this date and timeSlot
    const bookedReservations = await Reservation.find({
      date,
      timeSlot,
      status: 'Confirmed',
    }).select('table');

    const bookedTableIds = bookedReservations.map((r) => r.table.toString());

    // Filter out booked tables
    const availableTables = suitableTables.filter(
      (table) => !bookedTableIds.includes(table._id.toString())
    );

    res.status(200).json({
      success: true,
      count: availableTables.length,
      availableTables,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Customer, Admin)
const createReservation = async (req, res, next) => {
  try {
    const { tableId, date, timeSlot, guests } = req.body;

    // Validate required fields
    if (!tableId || !date || !timeSlot || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tableId, date, timeSlot, and guests',
      });
    }

    const guestCount = parseInt(guests, 10);

    // Verify the table exists and has enough capacity
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    if (table.capacity < guestCount) {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableNumber} has a capacity of ${table.capacity}, but ${guestCount} guests were requested`,
      });
    }

    // Check for double booking - is this table already booked for this date/timeSlot?
    const existingReservation = await Reservation.findOne({
      table: tableId,
      date,
      timeSlot,
      status: 'Confirmed',
    });

    if (existingReservation) {
      return res.status(409).json({
        success: false,
        message: `Table ${table.tableNumber} is already booked for ${date} at ${timeSlot}`,
      });
    }

    // Create the reservation
    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date,
      timeSlot,
      guests: guestCount,
      status: 'Confirmed',
    });

    // Populate table info in the response
    await reservation.populate('table');

    res.status(201).json({
      success: true,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reservations for the logged-in user
// @route   GET /api/reservations/my
// @access  Private (Customer)
const getUserReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table')
      .sort({ date: -1, timeSlot: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a reservation
// @route   PATCH /api/reservations/:id/cancel
// @access  Private (Customer - own only, Admin - any)
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    // Customers can only cancel their own reservations
    if (
      req.user.role === 'Customer' &&
      reservation.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation',
      });
    }

    if (reservation.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Reservation is already cancelled',
      });
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations (Admin) with optional date filter
// @route   GET /api/reservations?date=YYYY-MM-DD
// @access  Private (Admin)
const getAllReservations = async (req, res, next) => {
  try {
    const filter = {};

    // Optional date filter
    if (req.query.date) {
      filter.date = req.query.date;
    }

    const reservations = await Reservation.find(filter)
      .populate('table')
      .populate('user', 'name email')
      .sort({ date: -1, timeSlot: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkAvailability,
  createReservation,
  getUserReservations,
  cancelReservation,
  getAllReservations,
};
