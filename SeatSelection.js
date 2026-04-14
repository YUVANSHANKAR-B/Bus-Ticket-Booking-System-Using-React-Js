import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const SeatSelection = () => {
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchBus = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/buses/${busId}`);
      setBus(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [busId]);

  useEffect(() => {
    if (!user) navigate('/login');
    fetchBus();
  }, [busId, user, navigate, fetchBus]);

  const handleSeatClick = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBook = () => {
    navigate('/payment', { state: { bus, selectedSeats } });
  };

  if (!bus) return <Typography>Loading...</Typography>;

  const totalSeats = Array.from({ length: bus.totalSeats }, (_, i) => i + 1);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Select Seats for {bus.busNumber}
      </Typography>
      <Typography>From {bus.from} to {bus.to} - {new Date(bus.departureTime).toLocaleString()}</Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={1} sx={{ maxWidth: 400 }}>
          {totalSeats.map(seat => (
            <Grid item xs={3} key={seat}>
              <Paper
                sx={{
                  p: 1,
                  textAlign: 'center',
                  cursor: bus.availableSeats.includes(seat) ? 'pointer' : 'not-allowed',
                  backgroundColor: selectedSeats.includes(seat) ? 'primary.main' :
                                   bus.availableSeats.includes(seat) ? 'success.light' : 'error.light',
                  color: 'white'
                }}
                onClick={() => bus.availableSeats.includes(seat) && handleSeatClick(seat)}
              >
                {seat}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography>Selected Seats: {selectedSeats.join(', ')}</Typography>
        <Typography>Total Price: ${selectedSeats.length * bus.price}</Typography>
        <Button variant="contained" onClick={handleBook} disabled={selectedSeats.length === 0}>
          Proceed to Payment
        </Button>
      </Box>
    </Container>
  );
};

export default SeatSelection;