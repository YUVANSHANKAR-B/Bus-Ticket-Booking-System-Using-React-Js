import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, TextField, Button, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminPanel = () => {
  const [busForm, setBusForm] = useState({ busNumber: '', from: '', to: '', departureTime: '', totalSeats: '', price: '' });
  const [buses, setBuses] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    fetchBuses();
  }, [user]);

  const fetchBuses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/buses');
      setBuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBusChange = (e) => {
    setBusForm({ ...busForm, [e.target.name]: e.target.value });
  };

  const handleAddBus = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/buses', busForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBuses();
      setBusForm({ busNumber: '', from: '', to: '', departureTime: '', totalSeats: '', price: '' });
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'admin') return <Typography>Access denied</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Add New Bus</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Bus Number" name="busNumber" value={busForm.busNumber} onChange={handleBusChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="From" name="from" value={busForm.from} onChange={handleBusChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="To" name="to" value={busForm.to} onChange={handleBusChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Departure Time" name="departureTime" type="datetime-local" value={busForm.departureTime} onChange={handleBusChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Total Seats" name="totalSeats" type="number" value={busForm.totalSeats} onChange={handleBusChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Price" name="price" type="number" value={busForm.price} onChange={handleBusChange} />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleAddBus} sx={{ mt: 2 }}>
          Add Bus
        </Button>
      </Box>
      <Typography variant="h6">All Buses</Typography>
      <Grid container spacing={2}>
        {buses.map((bus) => (
          <Grid item xs={12} sm={6} md={4} key={bus._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{bus.busNumber}</Typography>
                <Typography>{bus.from} to {bus.to}</Typography>
                <Typography>Seats: {bus.availableSeats.length}/{bus.totalSeats}</Typography>
                <Typography>Price: ${bus.price}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminPanel;