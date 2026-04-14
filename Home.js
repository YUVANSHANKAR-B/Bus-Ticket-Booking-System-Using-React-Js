import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Bus Ticket Booking
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        Book your bus tickets easily and securely.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" size="large" component={Link} to="/search">
          Search Buses
        </Button>
      </Box>
    </Container>
  );
};

export default Home;