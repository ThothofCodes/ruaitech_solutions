const mongoose = require('mongoose');
// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { departmentSlug, page = 1, limit = 50 } = req.query;
    const filter = {};
    // Super admin sees all; dept head sees only their dept
    if (req.user.role !== 'SUPER_ADMIN') {
      filter.departmentSlug = req.user.departmentSlug;
    } else if (departmentSlug) {
      filter.departmentSlug = departmentSlug;
    }
    const [logs, total] = await Promise.all([
      AuditLog.find(filter).populate('user', 'name email').sort('-timestamp').skip((page-1)*limit).limit(Number(limit)),
      mongoose.connection.readyState===1 ? AuditLog.countDocuments(filter) : Promise.resolve(0),
    ]);
    res.json({ logs, total, page: Number(page) });
  } catch (err) { next(err); }
};
