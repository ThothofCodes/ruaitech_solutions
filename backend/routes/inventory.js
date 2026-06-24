// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { upload } = require('../middleware/upload'); // Destructure the upload object
const { protect, authorize } = require('../middleware/auth');

// Apply auth protection to all routes
router.use(protect);

// Routes that don't require specific permissions
router.get('/', inventoryController.getAll);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/expiring', inventoryController.getExpiring);
router.get('/:id', inventoryController.getById);

// Routes that require specific permissions
router.post('/', authorize(['admin', 'SUPER_ADMIN', 'STAFF']), upload.array('attachments', 5), inventoryController.create);
router.patch('/:id', authorize(['admin', 'SUPER_ADMIN', 'STAFF']), upload.array('attachments', 5), inventoryController.update);
router.delete('/:id', authorize(['admin', 'SUPER_ADMIN']), inventoryController.delete);

// Inventory movements
router.post('/movements', authorize(['admin', 'SUPER_ADMIN', 'STAFF']), inventoryController.recordMovement);

module.exports = router;