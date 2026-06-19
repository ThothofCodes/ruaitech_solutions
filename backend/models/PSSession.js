// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const PSSessionSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  stationNumber: { type: Number, required: true },
  stationName: String,
  clientName: String,
  clientPhone: String,
  gameTitle: String,
  sessionType: { type: String, enum: ['walk-in', 'booking', 'tournament'], default: 'walk-in' },
  startTime: { type: Date, required: true },
  endTime: Date,
  // Phase 9 market research, Tier 1 #2 — when a customer prepays for a fixed
  // block (e.g. "1 hour"), this is what the countdown timer and auto-close
  // cron count down against. Left null for open-ended walk-in sessions,
  // which keep behaving exactly as before (manual end only).
  plannedDurationMinutes: { type: Number, default: null },
  autoClosed: { type: Boolean, default: false },
  durationMinutes: Number,
  hourlyRate: { type: Number, default: 60 },
  totalCharged: Number,
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['mpesa', 'cash'], default: 'cash' },
  mpesaRef: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PSSession', PSSessionSchema);
