// Copyright (c) 2026 Thoth of Codes.
const router = require('express').Router();
const { protect, superAdminGuard, deptHeadGuard } = require('../middleware/auth');
const ctrl = require('../controllers/emailAllocationController');

router.post('/request', protect, deptHeadGuard, ctrl.requestEmail);
router.get('/queue', protect, superAdminGuard, ctrl.getQueue);
router.get('/directory', protect, superAdminGuard, ctrl.getDirectory);
router.post('/provision/:requestId', protect, superAdminGuard, ctrl.provision);
router.post('/reject/:requestId', protect, superAdminGuard, ctrl.reject);
router.patch('/suspend/:emailId', protect, superAdminGuard, ctrl.suspend);
router.delete('/revoke/:emailId', protect, superAdminGuard, ctrl.revoke);
router.post('/reset-password/:emailId', protect, superAdminGuard, ctrl.resetPassword);

module.exports = router;
