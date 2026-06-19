// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true },
  clientType: { type: String, enum: ['individual', 'sme', 'institution', 'ngo'], default: 'individual' },
  notes: String,
  totalSpent: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
