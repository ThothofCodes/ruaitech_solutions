// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = broadcast to all
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // null = all depts
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'alert', 'broadcast'], default: 'info' },
  isRead: { type: Boolean, default: false },
  link: String, // optional deep-link
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ departmentSlug: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
