// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['internet', 'printing', 'gaming', 'web-dev', 'cybersecurity', 'hardware', 'it-support', 'social-media', 'other'],
    required: true,
  },
  description: String,
  basePrice: { type: Number, required: true, min: 0 },
  priceUnit: { type: String, default: 'per session' },
  isActive: { type: Boolean, default: true },
  totalRevenue: { type: Number, default: 0 },
  bookingCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
