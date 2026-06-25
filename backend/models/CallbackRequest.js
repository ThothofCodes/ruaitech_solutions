// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const callbackRequestSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  contact: { // Phone or email
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  contactType: {
    type: String,
    enum: ['phone', 'email'],
    required: true,
  },
  preferredTime: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed'],
    default: 'pending',
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  contactedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  contactedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

callbackRequestSchema.index({ status: 1, preferredTime: 1 });
callbackRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CallbackRequest', callbackRequestSchema);
