// Copyright (c) 2026 Thoth of Codes.
const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  departmentSlug: { type: String, default: null },   // null = company-wide
  metricGroup:    { type: String, required: true, enum: ['REVENUE','CLIENTS','STAFF','TICKETS','INVENTORY','SESSIONS','USSD','PAYMENTS','OVERALL'] },
  period:         { type: String, enum: ['DAILY','WEEKLY','MONTHLY'], default: 'DAILY' },
  date:           { type: String, required: true }, // YYYY-MM-DD
  data:           { type: mongoose.Schema.Types.Mixed, default: {} },
  generatedAt:    { type: Date, default: Date.now },
}, { timestamps: false });

AnalyticsSchema.index({ departmentSlug: 1, metricGroup: 1, date: -1 });
AnalyticsSchema.index({ period: 1, date: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
