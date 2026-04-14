import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, Card, CardContent, Grid, Autocomplete, Chip, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RouteIcon from '@mui/icons-material/Route';

// Tamil Nadu Districts and Pondicherry
const TN_DISTRICTS = [
  'Chennai',
  'Kanchipuram', 
  'Chengalpattu',
  'Vellore',
  'Tiruppattur',
  'Ranipet',
  'Tiruvallur',
  'Cuddalore',
  'Villupuram',
  'Kolar',
  'Tiruvannamalai',
  'Kallakurichi',
  'Perambalur',
  'Ariyalur',
  'Tiruchchirappalli',
  'Karur',
  'Dindigul',
  'Madurai',
  'Theni',
  'Sivagangai',
  'Virudhunagar',
  'Ramanathapuram',
  'Tenkasi',
  'Tirunelveli',
  'Kanyakumari',
  'Coimbatore',
  'Tiruppur',
  'Nilgiris',
  'Salem',
  'Namakkal',
  'Erode',
  'The Nilgiris',
  'Pondicherry'
];

const PRESET_SEARCHES = [
  { from: 'Chennai', to: 'Vellore', date: '2026-04-28' },
  { from: 'Kanchipuram', to: 'Vellore', date: '2026-04-28' },
  { from: 'Chennai', to: 'Pondicherry', date: '2026-04-28' },
  { from: 'Chennai', to: 'Coimbatore', date: '2026-04-28' },
  { from: 'Madurai', to: 'Chennai', date: '2026-04-28' }
];

const BusSearch = () => {
  const [search, setSearch] = useState({ from: '', to: '', date: '' });
  const [buses, setBuses] = useState([]);
  const [allBuses, setAllBuses] = useState([]);
  const [cities, setCities] = useState(TN_DISTRICTS);
  const [recommendations, setRecommendations] = useState([]);
  const [connectingRoutes, setConnectingRoutes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBuses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/buses');
        const sortedBuses = res.data.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        setAllBuses(sortedBuses);
        setBuses(sortedBuses);
        // Combine database cities with TN_DISTRICTS
        const uniqueCities = [...new Set([...TN_DISTRICTS, ...res.data.flatMap(bus => [bus.from, bus.to])])];
        setCities(uniqueCities);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllBuses();
  }, []);

  const handleChange = (name, value) => {
    setSearch({ ...search, [name]: value });
  };

  const formatDateDisplay = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date)) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fetchSearchResults = async (params) => {
    try {
      const res = await axios.get('http://localhost:5000/api/buses', { params });
      const sortedBuses = res.data.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
      setBuses(sortedBuses);
      setRecommendations([]);
      setConnectingRoutes([]);

      if (sortedBuses.length === 0 && params.from && params.to) {
        const recRes = await axios.get('http://localhost:5000/api/buses');
        const allBusData = recRes.data;
        const searchDateString = params.date ? new Date(params.date).toDateString() : null;

        const sameRouteAllDates = allBusData.filter(bus =>
          bus.from.toLowerCase() === params.from.toLowerCase() &&
          bus.to.toLowerCase() === params.to.toLowerCase()
        );

        const alternateDateRoutes = sameRouteAllDates
          .filter(bus => !searchDateString || new Date(bus.departureTime).toDateString() !== searchDateString)
          .sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

        if (alternateDateRoutes.length > 0) {
          setRecommendations(alternateDateRoutes.slice(0, 4));
          return;
        }

        const dateBuses = allBusData.filter(bus => {
          if (!params.date) return true;
          const busDate = new Date(bus.departureTime);
          return busDate.toDateString() === searchDateString;
        });

        const connecting = [];
        for (const busA of dateBuses) {
          if (busA.from.toLowerCase() === params.from.toLowerCase()) {
            for (const busB of dateBuses) {
              if (
                busB.to.toLowerCase() === params.to.toLowerCase() &&
                busA.to.toLowerCase() === busB.from.toLowerCase() &&
                new Date(busA.departureTime) < new Date(busB.departureTime)
              ) {
                connecting.push({ busA, busB });
              }
            }
          }
        }

        if (connecting.length > 0) {
          setConnectingRoutes(connecting);
          return;
        }

        const suggestions = dateBuses.filter(bus =>
          bus.from.toLowerCase() === params.from.toLowerCase()
        );
        setRecommendations(suggestions.slice(0, 4));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    fetchSearchResults(search);
  };

  const handlePresetSearch = (preset) => {
    setSearch(preset);
    fetchSearchResults(preset);
  };

  const handleSelectBus = (busId) => {
    navigate(`/seats/${busId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Bus Ticket Booking
      </Typography>
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
        Find and book buses across India - Tamil Nadu & All States
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              fullWidth
              options={cities}
              value={search.from}
              onChange={(event, newValue) => handleChange('from', newValue)}
              onOpen={() => {}} // Always show dropdown
              renderInput={(params) => <TextField {...params} label="From" placeholder="Select a district" />}
              ListboxProps={{ style: { maxHeight: '200px' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              fullWidth
              options={cities}
              value={search.to}
              onChange={(event, newValue) => handleChange('to', newValue)}
              onOpen={() => {}} // Always show dropdown
              renderInput={(params) => <TextField {...params} label="To" placeholder="Select a district" />}
              ListboxProps={{ style: { maxHeight: '200px' } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={search.date}
              onChange={(e) => handleChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleSearch} sx={{ mt: 2 }} size="large">
          Search Buses
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Popular Route Suggestions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {PRESET_SEARCHES.map((preset, idx) => (
            <Chip
              key={idx}
              label={`${preset.from} → ${preset.to} · ${formatDateDisplay(preset.date)}`}
              clickable
              onClick={() => handlePresetSearch(preset)}
            />
          ))}
        </Box>
      </Box>

      {/* Popular Routes Section */}
      {buses.length === 0 && connectingRoutes.length === 0 && recommendations.length === 0 && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
            <RouteIcon sx={{ mr: 1 }} />
            Popular Routes in Tamil Nadu & Pondicherry
          </Typography>
          <Grid container spacing={1}>
            {TN_DISTRICTS.slice(0, 8).map((district, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <Typography variant="body2">{district}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 4, fontWeight: 'bold' }}>
        {buses.length > 0 ? `✓ Available Buses (${buses.length} routes found)` : connectingRoutes.length > 0 ? '🔄 Connecting Routes Available' : 'Search Results'}
      </Typography>

      {(buses.length > 0 ? buses : recommendations).length > 0 && buses.length === 0 && connectingRoutes.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No direct buses available for your search. Here are alternative options:
        </Alert>
      )}
      <Grid container spacing={2}>
        {(buses.length > 0 ? buses : recommendations).map((bus) => {
          const departureDate = new Date(bus.departureTime);
          const arrivalTime = new Date(departureDate.getTime() + bus.duration * 60 * 60 * 1000);
          return (
            <Grid item xs={12} sm={6} md={4} key={bus._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, '&:hover': { boxShadow: 6 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {bus.busNumber}
                    </Typography>
                    <Chip label={bus.busType} color={bus.busType === 'AC' ? 'primary' : 'secondary'} size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'green' }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {bus.from} → {bus.to}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, color: 'blue' }} />
                    <Typography variant="body2">
                      Dep: {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | 
                      Arr: {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Duration: {bus.duration} hours | Date: {departureDate.toLocaleDateString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventSeatIcon sx={{ mr: 1, color: 'orange' }} />
                    <Typography variant="body2">
                      Available Seats: {bus.availableSeats.length}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoneyIcon sx={{ mr: 1, color: 'green' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'green' }}>
                        ₹{bus.price}
                      </Typography>
                    </Box>
                    <Button variant="contained" onClick={() => handleSelectBus(bus._id)} size="small">
                      Book Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      {connectingRoutes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            ✓ Found {connectingRoutes.length} connecting route(s) for your journey
          </Alert>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <RouteIcon sx={{ mr: 1 }} />
            Connecting Routes with Timing
          </Typography>
          <Grid container spacing={2}>
            {connectingRoutes.map((route, index) => {
              const depA = new Date(route.busA.departureTime);
              const arrA = new Date(depA.getTime() + route.busA.duration * 60 * 60 * 1000);
              const depB = new Date(route.busB.departureTime);
              const arrB = new Date(depB.getTime() + route.busB.duration * 60 * 60 * 1000);
              const layoverTime = Math.round((new Date(route.busB.departureTime) - arrA) / (1000 * 60));
              const totalTime = route.busA.duration + route.busB.duration + (layoverTime / 60);
              
              return (
                <Grid item xs={12} key={index}>
                  <Card sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 }, border: '2px solid #4CAF50' }}>
                    <CardContent>
                      <Box sx={{ mb: 2, p: 1, bgcolor: '#E8F5E9', borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                          <RouteIcon sx={{ mr: 1, color: '#4CAF50' }} />
                          {route.busA.from} → {route.busA.to} → {route.busB.to}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Total Journey Time: {totalTime.toFixed(1)} hours | Layover: {layoverTime} mins
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 2, bgcolor: '#E3F2FD' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              🚌 LEG 1: {route.busA.busNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{route.busA.from} → {route.busA.to}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                              <AccessTimeIcon sx={{ mr: 1, fontSize: 'small', color: 'blue' }} />
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {depA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {arrA.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                            <Typography variant="caption">Type: {route.busA.busType} | Duration: {route.busA.duration}h</Typography>
                            <Typography variant="h6" sx={{ mt: 1, color: 'green', fontWeight: 'bold' }}>
                              ₹{route.busA.price}
                            </Typography>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 2, bgcolor: '#F3E5F5' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                              🚌 LEG 2: {route.busB.busNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{route.busB.from} → {route.busB.to}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                              <AccessTimeIcon sx={{ mr: 1, fontSize: 'small', color: 'purple' }} />
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {depB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {arrB.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                            <Typography variant="caption">Type: {route.busB.busType} | Duration: {route.busB.duration}h</Typography>
                            <Typography variant="h6" sx={{ mt: 1, color: 'green', fontWeight: 'bold' }}>
                              ₹{route.busB.price}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Total Cost:</Typography>
                          <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                            ₹{route.busA.price + route.busB.price}
                          </Typography>
                        </Box>
                        <Button variant="contained" size="large" sx={{ bgcolor: '#4CAF50' }}>
                          Book This Route
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Recommendations/Suggestions Section */}
      {recommendations.length > 0 && buses.length === 0 && connectingRoutes.length === 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            💡 Suggestions: Buses from {search.from} on your selected date
          </Alert>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Available Routes from {search.from}
          </Typography>
          <Grid container spacing={2}>
            {recommendations.map((bus) => {
              const departureDate = new Date(bus.departureTime);
              const arrivalTime = new Date(departureDate.getTime() + bus.duration * 60 * 60 * 1000);
              return (
                <Grid item xs={12} sm={6} md={4} key={bus._id}>
                  <Card sx={{ height: '100%', boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {bus.busNumber}
                      </Typography>
                      <Chip label={bus.busType} size="small" sx={{ mb: 1 }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ mr: 1, color: 'green', fontSize: 'small' }} />
                        <Typography variant="body2">{bus.from} → {bus.to}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ mr: 1, color: 'blue', fontSize: 'small' }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventSeatIcon sx={{ mr: 1, color: 'orange', fontSize: 'small' }} />
                        <Typography variant="body2">{bus.availableSeats.length} Seats Available</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" sx={{ color: 'green', fontWeight: 'bold' }}>
                          ₹{bus.price}
                        </Typography>
                        <Button variant="contained" size="small" onClick={() => handleSelectBus(bus._id)}>
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Grid>
  </Container>
  );
};

export default BusSearch;