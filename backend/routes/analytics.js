// Copyright (c) 2026 Thoth of Codes.
const router = require('express').Router();
const { protect, staffGuard, superAdminGuard } = require('../middleware/auth');
const ctrl   = require('../controllers/analyticsController');

router.get('/',              protect, staffGuard, ctrl.getSnapshots);
router.get('/summary',       protect, staffGuard, ctrl.getSummary);
router.get('/departments',   protect, superAdminGuard, ctrl.getDeptComparison);
router.post('/trigger',      protect, superAdminGuard, ctrl.triggerSnapshot);

module.exports = router;
