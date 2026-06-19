// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const { getMyNotifications, markRead, broadcast } = require('../controllers/notificationController');
const { getAuditLogs } = require('../controllers/auditController');
const { getRevenueStats, getRevenueChartData } = require('../controllers/adminRevenueController');
const { protect, superAdminGuard, staffGuard } = require('../middleware/auth');

// Notifications and audit logs
router.get('/notifications', protect, staffGuard, getMyNotifications);
router.put('/notifications/:id/read', protect, staffGuard, markRead);
router.post('/notifications/broadcast', protect, superAdminGuard, broadcast);
router.get('/audit', protect, staffGuard, getAuditLogs);

// Revenue endpoints
router.get('/stats', protect, staffGuard, getRevenueStats);
router.get('/revenue', protect, staffGuard, getRevenueChartData);

module.exports = router;