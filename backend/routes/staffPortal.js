// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const ctrl = require('../controllers/staffPortalController');
const { protect, staffGuard, deptHeadGuard } = require('../middleware/auth');

router.use(protect, staffGuard);

// Memos
router.get('/memos', ctrl.getMemos);
router.post('/memos', deptHeadGuard, ctrl.createMemo);
router.patch('/memos/:id/ack', ctrl.acknowledgeMemo);
router.patch('/memos/:id/archive', deptHeadGuard, ctrl.archiveMemo);

// Assessments
router.get('/assessments', ctrl.getAssessments);
router.get('/assessments/today', ctrl.getTodayAssessment);
router.get('/assessments/history', ctrl.getPerformanceHistory);
router.post('/assessments/worklog', ctrl.submitWorkLog);
router.post('/assessments/score', deptHeadGuard, ctrl.scoreAssessment);

module.exports = router;
