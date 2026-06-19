// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: {
    type: String,
    enum: ['booking', 'order', 'consultation', 'salary', 'rent', 'utilities', 'stock', 'marketing', 'other'],
    required: true,
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['mpesa', 'cash', 'bank'] },
  reference: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // FIX (Continuity Audit, Part Two): previously there was no way to scope a
  // ledger entry to a department at all, so /api/admin/revenue leaked every
  // department's financials to any staff-level account. SUPER_ADMIN still
  // sees every entry regardless of this field (highest clearance level) —
  // see adminRevenueController.js. Nullable for backward compatibility with
  // entries created before this field existed.
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Revenue', RevenueSchema);
