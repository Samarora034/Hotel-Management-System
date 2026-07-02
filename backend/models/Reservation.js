const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reservation must belong to a user'],
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Reservation must be assigned to a table'],
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Please provide a reservation date'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please provide a time slot'],
      enum: [
        '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00',
        '19:00', '20:00', '21:00',
      ],
    },
    guests: {
      type: Number,
      required: [true, 'Please provide number of guests'],
      min: [1, 'At least 1 guest is required'],
      max: [20, 'Cannot exceed 20 guests per reservation'],
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

// Compound index to optimize availability queries
reservationSchema.index({ date: 1, timeSlot: 1, table: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
