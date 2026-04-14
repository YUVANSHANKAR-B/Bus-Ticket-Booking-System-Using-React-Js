import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingConfirmation = () => {
  const location = useLocation();
  const { bus, selectedSeats, booking } = location.state || {};
  const navigate = useNavigate();

  if (!bus || !booking) return <Typography>No booking data available</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Booking Confirmed!
      </Typography>
      <Box sx={{ mt: 2, textAlign: 'left' }}>
        <Typography variant="body1" sx={{ mb: 1 }}>Bus: <strong>{bus.busNumber}</strong></Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Route: <strong>{bus.from} to {bus.to}</strong></Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Seats: <strong>{selectedSeats.join(', ')}</strong></Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Amount Paid: <strong>₹{booking.totalPrice}</strong></Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Payment Method: <strong>{booking.paymentMethod === 'card' ? 'Credit / Debit Card' : booking.paymentMethod === 'netbanking' ? 'Net Banking' : 'UPI'}</strong></Typography>
        {booking.transactionId && (
          <Typography variant="body1" sx={{ mb: 1 }}>Transaction ID: <strong>{booking.transactionId}</strong></Typography>
        )}
        <Typography variant="body1" sx={{ mb: 1 }}>Departure: <strong>{new Date(bus.departureTime).toLocaleString()}</strong></Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Booking ID: <strong>{booking._id}</strong></Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>Status: <strong>{booking.status}</strong></Typography>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" onClick={() => navigate('/profile')}>
          View My Bookings
        </Button>
      </Box>
    </Container>
  );
};

export default BookingConfirmation;