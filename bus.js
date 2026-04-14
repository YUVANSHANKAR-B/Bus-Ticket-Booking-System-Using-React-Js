const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in hours
  busType: { type: String, required: true, enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'] },
  totalSeats: { type: Number, required: true },
  availableSeats: [{ type: Number }], // Array of available seat numbers
  price: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
