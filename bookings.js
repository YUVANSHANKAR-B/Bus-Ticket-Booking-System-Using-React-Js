const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bus = require('../models/bus');
const { auth } = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
  const { busId, seatNumbers, paymentMethod, paymentDetails } = req.body;
  const userId = req.user.id;

  try {
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'No seats selected' });
    }

    // Check seat availability
    const unavailableSeats = seatNumbers.filter(seat => !bus.availableSeats.includes(seat));
    if (unavailableSeats.length > 0) {
      return res.status(400).json({ message: 'Some seats are not available', unavailableSeats });
    }

    // Calculate total price
    const totalPrice = seatNumbers.length * bus.price;

    const booking = new Booking({
      userId,
      busId,
      seatNumbers,
      totalPrice,
      paymentMethod: paymentMethod || 'card',
      paymentDetails: paymentDetails || {},
      paymentStatus: 'paid',
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    });
    await booking.save();

    // Update bus available seats
    bus.availableSeats = bus.availableSeats.filter(seat => !seatNumbers.includes(seat));
    await bus.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('busId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Restore seats
    const bus = await Bus.findById(booking.busId);
    bus.availableSeats.push(...booking.seatNumbers);
    await bus.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;