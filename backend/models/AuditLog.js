// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  departmentSlug: String,
  action: { type: String, required: true }, // e.g. 'CREATE_JOB_CARD', 'UPDATE_TRANSACTION'
  resource: String,   // e.g. 'JobCard', 'DeptTransaction'
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

AuditLogSchema.index({ department: 1, timestamp: -1 });
AuditLogSchema.index({ userEmail: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
