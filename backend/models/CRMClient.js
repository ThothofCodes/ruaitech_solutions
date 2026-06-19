// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const InteractionSchema = new mongoose.Schema({
  staffId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type:        { type: String, enum: ['CALL','SMS','EMAIL','VISIT','SERVICE_UPDATE','PAYMENT','NOTE'], default: 'NOTE' },
  summary:     { type: String, required: true, maxlength: 1000 },
  outcome:     { type: String, enum: ['POSITIVE','NEUTRAL','NEGATIVE','PENDING'], default: 'NEUTRAL' },
  followUpDate:{ type: Date, default: null },
  attachments: [String],
}, { timestamps: true });

const CRMClientSchema = new mongoose.Schema({
  department:          { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentSlug:      { type: String, required: true },
  fullName:            { type: String, required: true, trim: true, maxlength: 150 },
  phone:               { type: String, required: true },
  altPhone:            String,
  email:               { type: String, lowercase: true },
  idType:              { type: String, enum: ['NATIONAL_ID','PASSPORT','ALIEN_ID'], default: 'NATIONAL_ID' },
  idNumber:            String,
  kycStatus:           { type: String, enum: ['UNVERIFIED','PARTIAL','VERIFIED'], default: 'UNVERIFIED' },
  address:             String,
  tags:                [String],
  segment:             { type: String, enum: ['LEAD','ACTIVE','INACTIVE','CHURNED'], default: 'LEAD' },
  totalRevenue:        { type: Number, default: 0 },
  outstandingBalance:  { type: Number, default: 0 },
  loyaltyPoints:       { type: Number, default: 0 },
  referralCode:        { type: String, unique: true, sparse: true },
  referredBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'CRMClient', default: null },
  portalAccess:        { type: Boolean, default: false },
  portalOTP:           String,
  portalOTPExpiry:     Date,
  notes:               String,
  interactions:        [InteractionSchema],
  lastInteraction:     Date,
}, { timestamps: true });

CRMClientSchema.index({ department: 1, phone: 1 }, { unique: true });
CRMClientSchema.index({ departmentSlug: 1, segment: 1 });

module.exports = mongoose.model('CRMClient', CRMClientSchema);
