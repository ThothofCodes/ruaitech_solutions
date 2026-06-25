// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

// ── Memo ──────────────────────────────────────────────────────────────────
const MemoSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentSlug: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 120 },
  body: { type: String, required: true },
  priority: { type: String, enum: ['ROUTINE', 'IMPORTANT', 'URGENT'], default: 'ROUTINE' },
  recipients: { type: mongoose.Schema.Types.Mixed, default: 'ALL' }, // 'ALL' or [ObjectId]
  attachments: [String],
  requiresAck: { type: Boolean, default: false },
  ackDeadline: Date,
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
  readBy: [{ userId: mongoose.Schema.Types.ObjectId, readAt: Date }],
  scheduledAt: Date,
  publishedAt: Date,
}, { timestamps: true });

// ── Assessment ────────────────────────────────────────────────────────────
const AssessmentSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentSlug: String,
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  kpiScores: [{ kpiLabel: String, score: Number, weight: Number }],
  compositeScore: { type: Number, default: 0 },
  adminComments: String,
  adminFeedback: String,
  workLog: {
    tasks: String,
    blockers: String,
    hoursWorked: Number,
    notes: String,
  },
  logSubmittedAt: Date,
  status: { type: String, enum: ['PENDING_LOG', 'LOG_SUBMITTED', 'ASSESSED', 'REVIEWED'], default: 'PENDING_LOG' },
}, { timestamps: true });

AssessmentSchema.index({ staffId: 1, date: 1 }, { unique: true });
AssessmentSchema.index({ department: 1, date: 1 });

module.exports = {
  Memo: mongoose.model('Memo', MemoSchema),
  Assessment: mongoose.model('Assessment', AssessmentSchema),
};
