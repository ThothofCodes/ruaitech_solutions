// Copyright (c) 2026 Thoth of Codes. USSD — public endpoint, called by Africa's Talking
const router = require('express').Router();
const ctrl = require('../controllers/ussdController');
// Africa's Talking calls this — must be public, no auth
router.post('/callback', ctrl.handle);
module.exports = router;
