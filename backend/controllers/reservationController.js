const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// GET /api/reservations/availability?date=YYYY-MM-DD&timeSlot=HH:MM&guests=N
const checkAvailability = async (req, res, next) => {
  try {
    const { date, timeSlot, guests } = req.query;

    if (!date || !timeSlot || !guests) {
      return res.status(400).json({ success: false, message: 'date, timeSlot, and guests are required' });
    }

    const guestCount = parseInt(guests);
    if (!guestCount || guestCount < 1) {
      return res.status(400).json({ success: false, message: 'guests must be a positive number' });
    }

    // get all tables that can fit the party
    const tables = await Table.find({ capacity: { $gte: guestCount } });

    if (tables.length === 0) {
      return res.json({ success: true, availableTables: [], message: 'No tables big enough' });
    }

    // find which tables are already booked for this slot
    const booked = await Reservation.find({
      date,
      timeSlot,
      status: 'Confirmed'
    }).select('table');

    const bookedIds = booked.map(r => r.table.toString());

    // filter out the booked ones
    const available = tables.filter(t => !bookedIds.includes(t._id.toString()));

    res.json({ success: true, count: available.length, availableTables: available });
  } catch (err) {
    next(err);
  }
};

// POST /api/reservations
const createReservation = async (req, res, next) => {
  try {
    const { tableId, date, timeSlot, guests } = req.body;

    if (!tableId || !date || !timeSlot || !guests) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const guestCount = parseInt(guests);

    // make sure the table exists and can hold the party
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    if (table.capacity < guestCount) {
      return res.status(400).json({
        success: false,
        message: `Table ${table.tableNumber} only seats ${table.capacity}, but you need ${guestCount}`
      });
    }

    // double-booking check — someone might have booked it between search and submit
    const conflict = await Reservation.findOne({
      table: tableId,
      date,
      timeSlot,
      status: 'Confirmed'
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Table ${table.tableNumber} is already booked for ${date} at ${timeSlot}`
      });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date,
      timeSlot,
      guests: guestCount,
      status: 'Confirmed'
    });

    await reservation.populate('table');

    res.status(201).json({ success: true, reservation });
  } catch (err) {
    next(err);
  }
};

// GET /api/reservations/my
const getUserReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table')
      .sort({ date: -1, timeSlot: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/reservations/:id/cancel
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // customers can only cancel their own bookings
    if (req.user.role === 'Customer' && reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own reservations' });
    }

    if (reservation.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    res.json({ success: true, message: 'Reservation cancelled', reservation });
  } catch (err) {
    next(err);
  }
};

// GET /api/reservations (admin only, optional ?date=YYYY-MM-DD filter)
const getAllReservations = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.date) query.date = req.query.date;

    const reservations = await Reservation.find(query)
      .populate('table')
      .populate('user', 'name email')
      .sort({ date: -1, timeSlot: -1 });

    res.json({ success: true, count: reservations.length, reservations });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkAvailability,
  createReservation,
  getUserReservations,
  cancelReservation,
  getAllReservations
};
