// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const {
  getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, seedProducts,
} = require('../controllers/productController');
const { protect, deptAdminGuard, superAdminGuard } = require('../middleware/auth');
// FIX: upload.js now exports { upload, uploadProductImages } — destructure accordingly.
// The old default export was `upload` (a multer instance using CloudinaryStorage);
// the new export is `upload` (multer with memoryStorage) + uploadProductImages helper.
const { upload } = require('../middleware/upload');

// Public reads
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Seed — Super Admin only
router.post('/seed', protect, superAdminGuard, seedProducts);

// Create/Update/Delete — DEPT_HEAD_OWNER or SUPER_ADMIN
router.post('/',      protect, deptAdminGuard, upload.array('images', 5), createProduct);
router.put('/:id',   protect, deptAdminGuard, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, deptAdminGuard, deleteProduct);

module.exports = router;
