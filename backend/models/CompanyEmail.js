// Copyright (c) 2026 Thoth of Codes.
const mongoose = require('mongoose');

const CompanyEmailSchema = new mongoose.Schema({
  companyEmail: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
  },
  linkedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentSlug: { type: String, required: true },
  provisionedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provisionedAt: { type: Date },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED'], default: 'PENDING' },
  lastLogin: { type: Date, default: null },
  passwordResetToken: { type: String, default: null },
  tokenExpiry: { type: Date, default: null },
  aliases: [{ type: String }],
  revocationReason: { type: String, default: null },
  retentionExpiresAt: { type: Date, default: null },
}, { timestamps: true });

CompanyEmailSchema.index({ linkedUserId: 1 });
CompanyEmailSchema.index({ departmentSlug: 1, status: 1 });

module.exports = mongoose.model('CompanyEmail', CompanyEmailSchema);
