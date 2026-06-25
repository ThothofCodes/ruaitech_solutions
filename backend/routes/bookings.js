// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const {
  getBookings, getBooking, createBooking, updateBooking, recordPayment, deleteBooking,
} = require('../controllers/bookingController');
const {
  protect, staffGuard, deptHeadGuard, staffReadScope,
} = require('../middleware/auth');

// STAFF can view bookings (service requests) and record payments (transaction verification)
router.get('/', protect, staffGuard, staffReadScope, getBookings);
router.get('/:id', protect, staffGuard, staffReadScope, getBooking);
router.put('/:id/payment', protect, staffGuard, staffReadScope, recordPayment);

// Only dept heads and above can create, update status, or delete bookings
router.post('/', protect, deptHeadGuard, createBooking);
router.put('/:id', protect, deptHeadGuard, updateBooking);
router.delete('/:id', protect, deptHeadGuard, deleteBooking);

module.exports = router;
