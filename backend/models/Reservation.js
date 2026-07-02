const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format (keeps things simple, avoids timezone headaches)
    required: true,
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD']
  },
  timeSlot: {
    type: String,
    required: true,
    enum: [
      '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00',
      '19:00', '20:00', '21:00'
    ]
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed'
  }
}, { timestamps: true });

// index for fast availability lookups
reservationSchema.index({ date: 1, timeSlot: 1, table: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
