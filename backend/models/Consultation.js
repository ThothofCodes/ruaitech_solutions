// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  consultationType: {
    type: String,
    enum: [
      'web-development', 'cybersecurity', 'networking', 'hardware-advisory',
      'business-digitisation', 'social-media-strategy', 'data-recovery', 'general-it',
    ],
    required: true,
  },
  topic: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  duration: { type: Number, enum: [30, 60, 90], required: true },
  medium: { type: String, enum: ['in-person', 'phone', 'video', 'whatsapp'], required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  fee: { type: Number, required: true, min: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  mpesaRef: String,
  checkoutRequestId: String,
  consultantNotes: String,
  clientSummary: String,
  followUpRequired: { type: Boolean, default: false },
  attachments: { type: [String], default: [] },
  // Schema is ready for department scoping (see Revenue.js for the pattern
  // and adminRevenueController.js for how it's enforced); not yet
  // auto-populated at consultation creation since that flow is customer-facing.
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Consultation', ConsultationSchema);
