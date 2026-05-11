const { Router } = require('express');
const db = require('../lib/db');
const authMiddleware = require('../middleware/authMiddleware');
const { sendBookingConfirmation, sendCustomerConfirmation } = require('../email/mailer');

const router = Router();

// POST /api/bookings — public, customer submits
router.post('/', async (req, res) => {
  try {
    const {
      firstName, lastName, phone, email,
      streetAddress, city, state, zipCode,
      lawnMowing, lawnMowingDate,
      dethatching, dethatchingDate,
      sprinklerBlowout, sprinklerBlowoutDate,
      paymentMethod, notes, communityName,
    } = req.body;

    if (!firstName || !lastName || !phone || !streetAddress || !city || !state || !zipCode) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }
    if (!lawnMowing && !dethatching && !sprinklerBlowout) {
      return res.status(400).json({ error: 'Please select at least one service.' });
    }
    if (!['cash', 'zelle'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Please choose a payment method.' });
    }
    if (lawnMowing && !lawnMowingDate) {
      return res.status(400).json({ error: 'Please select a date for lawn mowing.' });
    }
    if (dethatching && !dethatchingDate) {
      return res.status(400).json({ error: 'Please select a date for dethatching.' });
    }
    if (sprinklerBlowout && !sprinklerBlowoutDate) {
      return res.status(400).json({ error: 'Please select a date for sprinkler blowout.' });
    }

    const booking = await db.createBooking({
      firstName, lastName, phone,
      email: email || null,
      streetAddress, city, state, zipCode,
      lawnMowing: !!lawnMowing,
      lawnMowingDate: lawnMowing ? new Date(lawnMowingDate) : null,
      dethatching: !!dethatching,
      dethatchingDate: dethatching ? new Date(dethatchingDate) : null,
      sprinklerBlowout: !!sprinklerBlowout,
      sprinklerBlowoutDate: sprinklerBlowout ? new Date(sprinklerBlowoutDate) : null,
      paymentMethod,
      notes: notes || null,
      communityName: communityName || null,
    });

    sendBookingConfirmation(booking).catch(console.error);
    sendCustomerConfirmation(booking).catch(console.error);

    res.status(201).json({ success: true, bookingId: booking.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save booking. Please try again.' });
  }
});

// GET /api/bookings/cities — must be before /:id
router.get('/cities', authMiddleware, async (req, res) => {
  try {
    const rows = await db.groupBookingsByCity();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cities.' });
  }
});

// GET /api/bookings — admin only, with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { city, status, service, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const bookings = await db.findBookings({ city, status, service, sortBy, sortOrder });

    const byCity = bookings.reduce((acc, b) => {
      const key = b.city.trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(b);
      return acc;
    }, {});

    res.json({ bookings, byCity, total: bookings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await db.findBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking.' });
  }
});

// PATCH /api/bookings/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const booking = await db.updateBooking(req.params.id, { status, adminNotes });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.deleteBooking(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

module.exports = router;
