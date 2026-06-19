// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  dueDate: Date,
  status: { type: String, enum: ['pending', 'in-progress', 'review', 'approved', 'paid'], default: 'pending' },
  paidAt: Date,
  mpesaRef: String,
}, { _id: true });

const WebProjectSchema = new mongoose.Schema({
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  projectName: { type: String, required: true },
  clientName: { type: String, required: true },
  clientEmail: String,
  clientPhone: String,
  projectType: {
    type: String,
    enum: ['brochure-website', 'ecommerce', 'web-app', 'mobile-app', 'maintenance', 'retainer', 'other'],
  },
  status: {
    type: String,
    enum: ['proposal', 'active', 'review', 'delivered', 'on-hold', 'cancelled'],
    default: 'proposal',
  },
  totalValue: Number,
  amountPaid: { type: Number, default: 0 },
  milestones: [MilestoneSchema],
  startDate: Date,
  deadline: Date,
  deliveredAt: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  isRetainer: { type: Boolean, default: false },
  retainerMonthlyFee: Number,
}, { timestamps: true });

module.exports = mongoose.model('WebProject', WebProjectSchema);
