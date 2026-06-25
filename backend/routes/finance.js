// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const router = require('express').Router();
const {
  getIncome, getDeptBreakdown, getTransactions, createTransaction, deleteTransaction,
} = require('../controllers/financeController');
const {
  protect, deptHeadGuard, superAdminGuard, deptScope, staffGuard,
} = require('../middleware/auth');

router.get('/income', protect, deptHeadGuard, deptScope, getIncome);
router.get('/breakdown', protect, superAdminGuard, getDeptBreakdown);
router.get('/transactions', protect, staffGuard, deptScope, getTransactions);
router.post('/transactions', protect, staffGuard, deptScope, createTransaction);
router.delete('/transactions/:id', protect, deptHeadGuard, deleteTransaction);

module.exports = router;
