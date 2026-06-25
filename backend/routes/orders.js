// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const {
  getOrders, getOrder, getOrdersByPhone, createOrder, updateOrderStatus, recordOrderPayment,
} = require('../controllers/orderController');
const {
  protect, staffGuard, deptHeadGuard, staffReadScope,
} = require('../middleware/auth');

// Public — customer order tracking
router.get('/my/:phone', getOrdersByPhone);

// Public — place order (store checkout)
router.post('/', createOrder);

// STAFF can view orders and verify/record payments (transaction verification)
router.get('/', protect, staffGuard, staffReadScope, getOrders);
router.get('/:id', protect, staffGuard, staffReadScope, getOrder);
router.put('/:id/payment', protect, staffGuard, staffReadScope, recordOrderPayment);

// Only dept heads and above can update order status
router.put('/:id/status', protect, deptHeadGuard, updateOrderStatus);

module.exports = router;
