// Copyright (c) 2026 Thoth of Codes. SLA breach auto-monitor — runs every 15 minutes
const mongoose   = require('mongoose');
const Ticket     = require('../models/Ticket');
const { emitDeptNotification, emitSystemStatus } = require('../socket');
const Notification = require('../models/Notification');

exports.runSLAMonitor = async function() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const now     = new Date();
    // Find open tickets past their SLA deadline that aren't already flagged
    const breached = await Ticket.find({
      status:    { $in:['OPEN','IN_PROGRESS'] },
      slaBreach: { $ne: true },
      slaDeadline:{ $lt: now },
    });

    for (const ticket of breached) {
      ticket.slaBreach = true;
      await ticket.save();
      // Notify dept head and Super Admin
      const notif = await Notification.create({
        title:           `SLA Breach — ${ticket.ticketId}`,
        message:         `Ticket "${ticket.title}" has exceeded its SLA deadline.`,
        type:            'SLA_BREACH',
        departmentSlug:  ticket.departmentSlug,
        recipient:       null,
      });
      try { emitDeptNotification(ticket.departmentSlug, { _id:notif._id, title:notif.title, message:notif.message }); } catch(_){}
    }
    if (breached.length > 0) {
      console.log(`[CRON] SLA Monitor: ${breached.length} tickets flagged as breached`);
      try { emitSystemStatus({ status:'ok', slaBreaches: breached.length }); } catch(_){}
    }
  } catch (err) {
    console.error('[CRON] SLAMonitor error:', err.message);
  }
};
