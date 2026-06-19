// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const ISPClientSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  location: String,
  packageName: { type: String, required: true },
  packageSpeed: String,
  monthlyFee: { type: Number, required: true },
  status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
  billingCycleDay: { type: Number, default: 1 }, // day of month billing renews
  lastPaidDate: Date,
  nextDueDate: Date,
  balance: { type: Number, default: 0 },
  routerAssigned: String,
  zone: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('ISPClient', ISPClientSchema);
