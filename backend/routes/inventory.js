// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const ctrl   = require('../controllers/inventoryController');
const { protect, staffGuard, deptHeadGuard, superAdminGuard } = require('../middleware/auth');

router.use(protect, staffGuard);

router.get('/',              ctrl.getItems);
router.post('/',             deptHeadGuard, ctrl.createItem);
router.patch('/:id',         deptHeadGuard, ctrl.updateItem);
router.post('/movements',    ctrl.recordMovement);
router.get('/low-stock',     ctrl.getLowStock);
router.get('/expiring',      ctrl.getExpiring);
router.get('/master',        superAdminGuard, ctrl.getMasterView);
router.get('/movements/:itemId', ctrl.getMovements);

module.exports = router;
