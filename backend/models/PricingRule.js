// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
  service: { type: String, required: true },
  tier: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  price: { type: Number, required: true, min: 0 },
  rushMultiplier: { type: Number, default: 1.0 },
  isActive: { type: Boolean, default: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

PricingRuleSchema.index({ service: 1, tier: 1 }, { unique: true });

module.exports = mongoose.model('PricingRule', PricingRuleSchema);
