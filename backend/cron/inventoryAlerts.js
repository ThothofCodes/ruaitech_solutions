// Copyright (c) 2026 Thoth of Codes. Inventory alerts — low stock + expiry
const mongoose = require('mongoose');
const { InventoryItem } = require('../models/Inventory');
const Notification = require('../models/Notification');
const { emitDeptNotification } = require('../socket');

exports.runInventoryAlerts = async function () {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const now = new Date();
    const in30days = new Date(now.getTime() + 30 * 86400000);

    // Low stock
    const lowStock = await InventoryItem.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } });
    for (const item of lowStock) {
      const notif = await Notification.create({
        title: `Low Stock — ${item.name}`,
        message: `${item.name} has ${item.quantity} units left (reorder level: ${item.reorderLevel}).`,
        type: 'LOW_STOCK',
        departmentSlug: item.departmentSlug,
      });
      try { emitDeptNotification(item.departmentSlug, { _id: notif._id, title: notif.title, message: notif.message }); } catch (_) {}
    }

    // Expiring items
    const expiring = await InventoryItem.find({ expiryDate: { $lte: in30days, $gte: now } });
    for (const item of expiring) {
      const notif = await Notification.create({
        title: `Expiring Soon — ${item.name}`,
        message: `${item.name} expires on ${item.expiryDate?.toDateString()}. Quantity: ${item.quantity}.`,
        type: 'EXPIRY_ALERT',
        departmentSlug: item.departmentSlug,
      });
      try { emitDeptNotification(item.departmentSlug, { _id: notif._id, title: notif.title, message: notif.message }); } catch (_) {}
    }

    if (lowStock.length || expiring.length) console.log(`[CRON] Inventory: ${lowStock.length} low-stock, ${expiring.length} expiring alerts sent`);
  } catch (err) {
    console.error('[CRON] InventoryAlerts error:', err.message);
  }
};
