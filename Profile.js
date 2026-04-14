import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Card, CardContent, Button, Grid, Box, Chip } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingBookings = bookings.filter((booking) => booking.status === 'confirmed');
  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          Here is your travel dashboard. Review upcoming trips, payment history, and booking details in one place.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2">Total Bookings</Typography>
                <Typography variant="h5">{bookings.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2">Upcoming Trips</Typography>
                <Typography variant="h5">{upcomingBookings.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="subtitle2">Total Spent</Typography>
                <Typography variant="h5">₹{totalSpent}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom>
          Profile Details
        </Typography>
        <Typography variant="body1">Name: <strong>{user?.name || 'Guest'}</strong></Typography>
        <Typography variant="body1">Email: <strong>{user?.email || 'Not available'}</strong></Typography>
        <Typography variant="body1">Member since: <strong>{user?.createdAt ? new Date(user.createdAt).toDateString() : 'N/A'}</strong></Typography>
      </Box>

      <Typography variant="h5" gutterBottom>
        Booking History
      </Typography>
      <Grid container spacing={2}>
        {bookings.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography>No bookings yet. Start by booking a bus and the details will appear here.</Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          bookings.map((booking) => (
            <Grid item xs={12} key={booking._id}>
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">{booking.busId.busNumber} | {booking.busId.from} → {booking.busId.to}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Booking ID: {booking._id}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Seats: {booking.seatNumbers.join(', ')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Total Paid: ₹{booking.totalPrice}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Payment Method: <strong>{booking.paymentMethod === 'card' ? 'Card' : booking.paymentMethod === 'netbanking' ? 'Net Banking' : 'UPI'}</strong>
                      </Typography>
                      {booking.transactionId && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Transaction: {booking.transactionId}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Chip label={booking.status.toUpperCase()} color={booking.status === 'confirmed' ? 'success' : 'error'} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Date: {new Date(booking.bookingDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  {booking.status === 'confirmed' && (
                    <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={() => handleCancel(booking._id)}>
                      Cancel Booking
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default Profile;