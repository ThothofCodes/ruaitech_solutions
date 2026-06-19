// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const AvailabilitySlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
}, { timestamps: true });

module.exports = mongoose.model('AvailabilitySlot', AvailabilitySlotSchema);
