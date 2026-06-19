// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const ctrl = require('../controllers/deptModuleController');
const { protect, staffGuard, deptScope } = require('../middleware/auth');

router.use(protect, staffGuard, deptScope);

// Hardware Repair — Job Cards
router.get('/jobcards', ctrl.getJobCards);
router.post('/jobcards', ctrl.createJobCard);
router.put('/jobcards/:id', ctrl.updateJobCard);

// PlayStation Arena — Sessions
router.get('/sessions', ctrl.getSessions);
router.post('/sessions/start', ctrl.startSession);
router.put('/sessions/:id/end', ctrl.endSession);

// Web Development — Projects
router.get('/projects', ctrl.getProjects);
router.post('/projects', ctrl.createProject);
router.put('/projects/:id', ctrl.updateProject);

// Gov Admin — Documents
router.get('/govdocs', ctrl.getGovDocs);
router.post('/govdocs', ctrl.createGovDoc);
router.put('/govdocs/:id', ctrl.updateGovDoc);

// Internet Distribution — ISP Clients
// FIX: was '/ispcliients' (typo) — GET 404'd at the documented path while
// POST/PUT below were already spelled correctly, so only the list view broke.
router.get('/ispclients', ctrl.getISPClients);
router.post('/ispclients', ctrl.createISPClient);
router.put('/ispclients/:id', ctrl.updateISPClient);

module.exports = router;
