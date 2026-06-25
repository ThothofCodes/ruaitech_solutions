// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const {
  getPricingRules, getEstimate, updatePricingRule, seedPricingRules,
} = require('../controllers/calculatorController');
const { protect, admin } = require('../middleware/auth');

router.get('/pricing-rules', getPricingRules);
router.post('/estimate', getEstimate);
// seed before /:id to avoid wildcard capture
router.post('/seed', protect, admin, seedPricingRules);
router.put('/pricing-rules/:id', protect, admin, updatePricingRule);

module.exports = router;
