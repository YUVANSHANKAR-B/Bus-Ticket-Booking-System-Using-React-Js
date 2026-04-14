require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Bus = require('./models/bus');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const admin = new User({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Clear existing buses
    await Bus.deleteMany({});

    // Sample buses - Indian cities with Tamil Nadu focus
    const buses = [
      // Kanchipuram to Vellore routes (16-04-2026)
      {
        busNumber: 'KV001',
        from: 'Kanchipuram',
        to: 'Vellore',
        departureTime: new Date('2026-04-16T06:30:00'),
        duration: 2,
        busType: 'AC',
        totalSeats: 40,
        availableSeats: Array.from({ length: 35 }, (_, i) => i + 1),
        price: 150
      },
      {
        busNumber: 'KV002',
        from: 'Kanchipuram',
        to: 'Vellore',
        departureTime: new Date('2026-04-16T09:15:00'),
        duration: 2,
        busType: 'Non-AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 45 }, (_, i) => i + 1),
        price: 100
      },
      {
        busNumber: 'KV003',
        from: 'Kanchipuram',
        to: 'Vellore',
        departureTime: new Date('2026-04-16T12:00:00'),
        duration: 2,
        busType: 'Semi-Sleeper',
        totalSeats: 45,
        availableSeats: Array.from({ length: 42 }, (_, i) => i + 1),
        price: 120
      },
      {
        busNumber: 'KV004',
        from: 'Kanchipuram',
        to: 'Vellore',
        departureTime: new Date('2026-04-16T15:45:00'),
        duration: 2,
        busType: 'AC',
        totalSeats: 40,
        availableSeats: Array.from({ length: 30 }, (_, i) => i + 1),
        price: 150
      },
      {
        busNumber: 'KV005',
        from: 'Kanchipuram',
        to: 'Vellore',
        departureTime: new Date('2026-04-16T18:30:00'),
        duration: 2,
        busType: 'Non-AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 38 }, (_, i) => i + 1),
        price: 100
      },
      // Vellore to Kanchipuram routes
      {
        busNumber: 'VK001',
        from: 'Vellore',
        to: 'Kanchipuram',
        departureTime: new Date('2026-04-16T07:00:00'),
        duration: 2,
        busType: 'Non-AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 48 }, (_, i) => i + 1),
        price: 100
      },
      {
        busNumber: 'VK002',
        from: 'Vellore',
        to: 'Kanchipuram',
        departureTime: new Date('2026-04-16T10:30:00'),
        duration: 2,
        busType: 'AC',
        totalSeats: 40,
        availableSeats: Array.from({ length: 25 }, (_, i) => i + 1),
        price: 150
      },
      {
        busNumber: 'VK003',
        from: 'Vellore',
        to: 'Kanchipuram',
        departureTime: new Date('2026-04-16T14:15:00'),
        duration: 2,
        busType: 'Semi-Sleeper',
        totalSeats: 45,
        availableSeats: Array.from({ length: 40 }, (_, i) => i + 1),
        price: 120
      },
      // Chennai routes
      {
        busNumber: 'TN001',
        from: 'Chennai',
        to: 'Coimbatore',
        departureTime: new Date('2026-04-16T06:00:00'),
        duration: 8,
        busType: 'AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 50 }, (_, i) => i + 1),
        price: 450
      },
      {
        busNumber: 'TN002',
        from: 'Chennai',
        to: 'Madurai',
        departureTime: new Date('2026-04-16T08:30:00'),
        duration: 6,
        busType: 'Non-AC',
        totalSeats: 45,
        availableSeats: Array.from({ length: 45 }, (_, i) => i + 1),
        price: 550
      },
      {
        busNumber: 'TN003',
        from: 'Chennai',
        to: 'Tiruchchirappalli',
        departureTime: new Date('2026-04-16T10:00:00'),
        duration: 5,
        busType: 'Sleeper',
        totalSeats: 40,
        availableSeats: Array.from({ length: 40 }, (_, i) => i + 1),
        price: 350
      },
      {
        busNumber: 'TN004',
        from: 'Coimbatore',
        to: 'Chennai',
        departureTime: new Date('2026-04-16T14:00:00'),
        duration: 8,
        busType: 'AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 50 }, (_, i) => i + 1),
        price: 450
      },
      {
        busNumber: 'TN005',
        from: 'Madurai',
        to: 'Chennai',
        departureTime: new Date('2026-04-16T16:30:00'),
        duration: 6,
        busType: 'Non-AC',
        totalSeats: 45,
        availableSeats: Array.from({ length: 45 }, (_, i) => i + 1),
        price: 550
      },
      {
        busNumber: 'TN006',
        from: 'Tiruchchirappalli',
        to: 'Chennai',
        departureTime: new Date('2026-04-16T18:00:00'),
        duration: 5,
        busType: 'Semi-Sleeper',
        totalSeats: 40,
        availableSeats: Array.from({ length: 40 }, (_, i) => i + 1),
        price: 350
      },
      {
        busNumber: 'CD001',
        from: 'Chennai',
        to: 'Chengalpattu',
        departureTime: new Date('2026-04-16T07:30:00'),
        duration: 1.5,
        busType: 'Non-AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 48 }, (_, i) => i + 1),
        price: 80
      },
      {
        busNumber: 'RV001',
        from: 'Ranipet',
        to: 'Vellore',
        departureTime: new Date('2026-04-16T10:30:00'),
        duration: 1,
        busType: 'Non-AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 45 }, (_, i) => i + 1),
        price: 60
      },
      {
        busNumber: 'TV002',
        from: 'Tiruvallur',
        to: 'Chennai',
        departureTime: new Date('2026-04-16T06:45:00'),
        duration: 1.5,
        busType: 'Non-AC',
        totalSeats: 48,
        availableSeats: Array.from({ length: 43 }, (_, i) => i + 1),
        price: 70
      },
      {
        busNumber: 'IS001',
        from: 'Chennai',
        to: 'Bangalore',
        departureTime: new Date('2026-04-16T07:00:00'),
        duration: 6,
        busType: 'AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 50 }, (_, i) => i + 1),
        price: 600
      },
      {
        busNumber: 'IS002',
        from: 'Chennai',
        to: 'Pondicherry',
        departureTime: new Date('2026-04-16T11:00:00'),
        duration: 3,
        busType: 'AC',
        totalSeats: 40,
        availableSeats: Array.from({ length: 35 }, (_, i) => i + 1),
        price: 200
      },
      {
        busNumber: 'CHV001',
        from: 'Chennai',
        to: 'Vellore',
        departureTime: new Date('2026-04-28T07:00:00'),
        duration: 2,
        busType: 'AC',
        totalSeats: 40,
        availableSeats: Array.from({ length: 40 }, (_, i) => i + 1),
        price: 160
      },
      {
        busNumber: 'CHV002',
        from: 'Chennai',
        to: 'Vellore',
        departureTime: new Date('2026-04-28T13:30:00'),
        duration: 2,
        busType: 'Non-AC',
        totalSeats: 50,
        availableSeats: Array.from({ length: 45 }, (_, i) => i + 1),
        price: 110
      },
      {
        busNumber: 'KPV001',
        from: 'Kanchipuram',
        to: 'Vellore',
        departureTime: new Date('2026-04-28T09:00:00'),
        duration: 2,
        busType: 'Semi-Sleeper',
        totalSeats: 45,
        availableSeats: Array.from({ length: 42 }, (_, i) => i + 1),
        price: 120
      },
      {
        busNumber: 'CHP001',
        from: 'Chennai',
        to: 'Pondicherry',
        departureTime: new Date('2026-04-28T11:00:00'),
        duration: 3,
        busType: 'AC',
        totalSeats: 42,
        availableSeats: Array.from({ length: 42 }, (_, i) => i + 1),
        price: 220
      },
      {
        busNumber: 'CVC001',
        from: 'Chengalpattu',
        to: 'Vellore',
        departureTime: new Date('2026-04-28T08:45:00'),
        duration: 2.5,
        busType: 'Non-AC',
        totalSeats: 48,
        availableSeats: Array.from({ length: 48 }, (_, i) => i + 1),
        price: 130
      }
    ];

    await Bus.insertMany(buses);
    console.log(buses.length + ' buses created successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
