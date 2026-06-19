// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const { mpesaCallback } = require('../controllers/paymentController');

router.post('/mpesa/callback', mpesaCallback);

module.exports = router;
