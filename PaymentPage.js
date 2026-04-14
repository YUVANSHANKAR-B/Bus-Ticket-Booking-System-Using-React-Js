import React, { useState } from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Chip, Divider, Alert, CircularProgress, Tabs, Tab, TextField, MenuItem, InputAdornment, Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'upi', label: 'UPI' }
];

const BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank'
];

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, selectedSeats } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardInfo, setCardInfo] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState(BANKS[0]);
  const [upiId, setUpiId] = useState('');
  const [showQr, setShowQr] = useState(false);

  if (!bus || !selectedSeats || selectedSeats.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          No payment data available
        </Typography>
        <Typography sx={{ mb: 4 }}>Please select seats again from the search page.</Typography>
        <Button variant="contained" onClick={() => navigate('/search')}>
          Back to Search
        </Button>
      </Container>
    );
  }

  const totalPrice = selectedSeats.length * bus.price;

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      if (!cardInfo.name || !cardInfo.number || !cardInfo.expiry || !cardInfo.cvv) {
        return 'Please enter complete card details.';
      }
      if (cardInfo.number.replace(/\s/g, '').length !== 16) {
        return 'Enter a valid 16-digit card number.';
      }
      if (cardInfo.cvv.length !== 3) {
        return 'Enter a valid 3-digit CVV.';
      }
    }

    if (paymentMethod === 'netbanking' && !bank) {
      return 'Please select a bank.';
    }

    if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        return 'Enter a valid UPI ID.';
      }
    }

    return null;
  };

  const handlePay = async () => {
    const validationError = validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          busId: bus._id,
          seatNumbers: selectedSeats,
          paymentMethod,
          paymentDetails: paymentMethod === 'card'
            ? { cardHolder: cardInfo.name, cardLast4: cardInfo.number.slice(-4) }
            : paymentMethod === 'netbanking'
              ? { bank }
              : { upiId }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate('/booking', { state: { bus, selectedSeats, booking: response.data } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Payment Summary
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 1, color: 'text.secondary' }}>
            {bus.from} → {bus.to} | {new Date(bus.departureTime).toLocaleString()}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="body1">Bus Number: <strong>{bus.busNumber}</strong></Typography>
            <Typography variant="body1">Selected Seats: <strong>{selectedSeats.join(', ')}</strong></Typography>
            <Typography variant="body1">Fare per seat: <strong>₹{bus.price}</strong></Typography>
            <Typography variant="body1">Total amount: <strong>₹{totalPrice}</strong></Typography>
          </Box>

          <Tabs
            value={paymentMethod}
            onChange={(event, value) => setPaymentMethod(value)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            {PAYMENT_METHODS.map((method) => (
              <Tab key={method.value} label={method.label} value={method.value} />
            ))}
          </Tabs>

          {paymentMethod === 'card' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Card Holder Name"
                value={cardInfo.name}
                onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Card Number"
                value={cardInfo.number}
                onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value.replace(/\D/g, '') })}
                inputProps={{ maxLength: 16 }}
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry (MM/YY)"
                    value={cardInfo.expiry}
                    onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                    placeholder="MM/YY"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cardInfo.cvv}
                    onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '') })}
                    inputProps={{ maxLength: 3 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {paymentMethod === 'netbanking' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                select
                fullWidth
                label="Choose Bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
              >
                {BANKS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                After clicking pay, you will be redirected to the bank’s secure payment gateway.
              </Typography>
            </Box>
          )}

          {paymentMethod === 'upi' && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Enter UPI ID"
                placeholder="example@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="outlined" fullWidth onClick={() => setShowQr(!showQr)}>
                {showQr ? 'Hide UPI QR Scanner' : 'Show UPI QR Scanner'}
              </Button>
              {showQr && (
                <Box sx={{ mt: 2, p: 3, border: '1px dashed', borderColor: 'divider', textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Scan this QR code with your UPI app or enter the UPI ID above.
                  </Typography>
                  <Box sx={{ width: 180, height: 180, mx: 'auto', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      UPI QR Scanner
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handlePay}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'Processing Payment...' : `Pay ₹${totalPrice}`}
          </Button>

          <Button
            variant="text"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate(-1)}
          >
            Back to Seat Selection
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PaymentPage;
