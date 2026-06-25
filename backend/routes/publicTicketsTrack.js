// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
// Phase 9 market research, Tier 1 #1 — public ticket status tracker.
// Public: No auth. Customers submit their ticket reference number.
const router = require('express').Router();
const ctrl = require('../controllers/ticketController');

router.post('/track', ctrl.trackTicket);

module.exports = router;
