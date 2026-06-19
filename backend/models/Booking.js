// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  amountCharged: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['mpesa', 'cash', 'bank'] },
  mpesaRef: String,
  notes: String,
  // Schema is ready for department scoping (see Revenue.js for the pattern
  // and adminRevenueController.js for how it's enforced); not yet
  // auto-populated at booking creation since that flow is customer-facing.
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
