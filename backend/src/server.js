require('dotenv').config();
const express = require('express');
const cors = require('cors');

const bookingRoutes = require('./routes/bookings');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
