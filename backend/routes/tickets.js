// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const ctrl   = require('../controllers/ticketController');
const { protect, staffGuard, deptHeadGuard, superAdminGuard } = require('../middleware/auth');

router.use(protect, staffGuard);

router.get('/',                ctrl.getTickets);
router.post('/',               ctrl.createTicket);
router.get('/my',              ctrl.getMyTickets);
router.get('/escalated',       superAdminGuard, ctrl.getEscalated);
router.get('/:id',             ctrl.getTicket);
router.patch('/:id/assign',    deptHeadGuard, ctrl.assignTicket);
router.post('/:id/reply',      ctrl.replyTicket);
router.patch('/:id/status',    deptHeadGuard, ctrl.updateStatus);
router.post('/:id/escalate',   deptHeadGuard, ctrl.escalateTicket);
router.patch('/:id/resolve',   deptHeadGuard, ctrl.updateStatus);
router.post('/:id/rate',       ctrl.rateTicket);

module.exports = router;
