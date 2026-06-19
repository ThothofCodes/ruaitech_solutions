// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const { getServices, getService, createService, updateService, deleteService, seedServices } = require('../controllers/serviceController');
const { protect, deptAdminGuard, superAdminGuard } = require('../middleware/auth');

// Public reads
router.get('/', getServices);
router.get('/:id', getService);

// Seed — Super Admin only
router.post('/seed', protect, superAdminGuard, seedServices);

// Create/Update/Delete — DEPT_HEAD_OWNER or SUPER_ADMIN
router.post('/',    protect, deptAdminGuard, createService);
router.put('/:id',  protect, deptAdminGuard, updateService);
router.delete('/:id', protect, deptAdminGuard, deleteService);

module.exports = router;
