// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const ctrl   = require('../controllers/crmController');
const { protect, staffGuard, deptHeadGuard, superAdminGuard } = require('../middleware/auth');

// OTP auth — public
router.post('/request-otp',  ctrl.requestOTP);
router.post('/verify-otp',   ctrl.verifyPortalOTP);

// Staff and above
router.use(protect, staffGuard);
router.get('/',              ctrl.getClients);
router.post('/',             ctrl.createClient);
router.get('/:id',           ctrl.getClient);
router.patch('/:id',         ctrl.updateClient);
router.post('/:id/interactions', ctrl.addInteraction);

// Dept head and above
router.post('/:id/portal-invite', deptHeadGuard, ctrl.sendPortalInvite);
router.post('/bulk-sms',          deptHeadGuard, ctrl.bulkSMS);

// Super Admin
router.get('/directory/all', superAdminGuard, ctrl.getClients);

router.post('/:id/redeem-points',   protect, staffGuard, require('../controllers/crmController').redeemPoints);
router.post('/:id/referral-code',   protect, staffGuard, require('../controllers/crmController').generateReferralCode);
module.exports = router;
