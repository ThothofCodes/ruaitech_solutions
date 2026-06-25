// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
const Revenue = require('../models/Revenue');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Consultation = require('../models/Consultation');

// ── FIX (Continuity Audit, Part Two) ───────────────────────────────────────
// This controller used to query company-wide with zero department filter,
// so any staff-level account could see every department's consolidated
// revenue via /api/admin/stats. SUPER_ADMIN holds the highest clearance
// level in this system and is the one role meant to see everything; every
// other role is now scoped to its own department.
//
// Three more bugs were found and fixed while wiring this up:
//   1. Revenue was queried with type: 'INCOME' (uppercase) against a schema
//      enum of 'income'/'expense' (lowercase) — it silently matched zero
//      documents, ever.
//   2. Booking revenue used `booking.total`, but the Booking schema's field
//      is `amountCharged` — every booking contributed `undefined`, turning
//      totalRevenue into NaN as soon as any booking existed in range.
//   3. "Unique clients" was counted via `.clientId` on Order/Booking/
//      Consultation, but the real fields are `client` (Booking/Consultation)
//      and an embedded `customer.phone` (Order) — `.clientId` doesn't exist
//      on any of the three, so the count was always 0 or 1.
// Order's status filter also referenced 'completed'/'paid' as `status`
// values; the real enum only has 'delivered' for a fulfilled order, so
// paymentStatus: 'paid' is the correct revenue-recognition signal instead.

function scopeFilter(req) {
  // Highest clearance: SUPER_ADMIN sees everything, no filter applied.
  if (req.user?.role === 'SUPER_ADMIN') return {};
  const dept = req.user?.department?._id || req.user?.department || null;
  // No department on the account (and not SUPER_ADMIN) — show nothing
  // rather than guessing; this is the safe default until the account is
  // assigned to a department.
  return { department: dept };
}

function getDateRange(range, year) {
  switch (range) {
    case 'daily':
    case 'weekly':
      return [new Date(year, 0, 1), new Date(year, 11, 31, 23, 59, 59, 999)];
    case 'yearly':
      return [new Date(year, 0, 1), new Date(parseInt(year, 10) + 1, 0, 1)];
    case 'monthly':
    default:
      return [new Date(year, 0, 1), new Date(year, 11, 31, 23, 59, 59, 999)];
  }
}

async function fetchSources(startDate, endDate, deptFilter) {
  const revenueEntries = await Revenue.find({
    ...deptFilter,
    date: { $gte: startDate, $lte: endDate },
    type: 'income', // FIX: was 'INCOME' — never matched the real (lowercase) schema enum
  });

  const orders = await Order.find({
    ...deptFilter,
    createdAt: { $gte: startDate, $lte: endDate },
    paymentStatus: 'paid', // FIX: was status:{$in:['delivered','completed','paid']} — 'completed'/'paid' aren't valid Order statuses
  });

  const bookings = await Booking.find({
    ...deptFilter,
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['confirmed', 'completed'] },
  });

  const consultations = await Consultation.find({
    ...deptFilter,
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['confirmed', 'completed'] },
  });

  return {
    revenueEntries, orders, bookings, consultations,
  };
}

function groupByDate(range, year, {
  revenueEntries, orders, bookings, consultations,
}) {
  // Helper: each source contributes (amount, dateField) pairs
  const contributions = [
    ...revenueEntries.map((e) => ({ date: e.date, amount: e.amount })),
    ...orders.map((o) => ({ date: o.createdAt, amount: o.total })),
    ...bookings.map((b) => ({ date: b.createdAt, amount: b.amountCharged })), // FIX: was b.total
    ...consultations.map((c) => ({ date: c.createdAt, amount: c.fee })),
  ];

  if (range === 'daily') {
    const daily = {};
    contributions.forEach(({ date, amount }) => {
      const key = new Date(date).toDateString();
      daily[key] = (daily[key] || 0) + amount;
    });
    return Object.keys(daily).sort().map((d) => ({
      date: new Date(d).toISOString().split('T')[0],
      revenue: daily[d],
    }));
  }

  if (range === 'weekly') {
    const weekly = {};
    contributions.forEach(({ date, amount }) => {
      const d = new Date(date);
      const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
      const key = weekStart.toISOString().split('T')[0];
      weekly[key] = (weekly[key] || 0) + amount;
    });
    return Object.keys(weekly).sort().map((w) => ({ date: w, revenue: weekly[w] }));
  }

  // yearly + monthly both bucket into 12 month slots
  const monthly = Array(12).fill(0).map((_, i) => ({
    date: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
    revenue: 0,
  }));
  contributions.forEach(({ date, amount }) => {
    monthly[new Date(date).getMonth()].revenue += amount;
  });
  return monthly;
}

// Get revenue statistics for admin dashboard
exports.getRevenueStats = async (req, res, next) => {
  try {
    const { range = 'monthly', year = new Date().getFullYear() } = req.query;
    const [startDate, endDate] = getDateRange(range, year);
    const deptFilter = scopeFilter(req);

    const {
      revenueEntries, orders, bookings, consultations,
    } = await fetchSources(startDate, endDate, deptFilter);

    const totalRevenue = revenueEntries.reduce((sum, e) => sum + e.amount, 0)
      + orders.reduce((sum, o) => sum + o.total, 0)
      + bookings.reduce((sum, b) => sum + b.amountCharged, 0) // FIX: was b.total
      + consultations.reduce((sum, c) => sum + c.fee, 0);

    const totalOrders = orders.length + bookings.length + consultations.length;

    const pendingOrders = await Order.countDocuments({
      ...deptFilter,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'pending',
    });

    // FIX: was order.clientId / booking.clientId / consult.clientId, none of
    // which exist on these schemas. Booking/Consultation reference `client`;
    // Order has no client ref at all, only an embedded customer.phone.
    const uniqueClients = new Set();
    orders.forEach((o) => o.customer?.phone && uniqueClients.add(`phone:${o.customer.phone}`));
    bookings.forEach((b) => b.client && uniqueClients.add(`client:${b.client}`));
    consultations.forEach((c) => c.client && uniqueClients.add(`client:${c.client}`));

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const groupedRevenue = groupByDate(range, year, {
      revenueEntries, orders, bookings, consultations,
    });

    const ordersByStatus = await Order.aggregate([
      { $match: { ...deptFilter, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // FIX: was grouping by '$serviceCategory', a field that doesn't exist on
    // Order at all (every document silently collapsed into one null bucket).
    // paymentMethod is a real field and gives a genuinely useful breakdown.
    const salesByPaymentMethod = await Order.aggregate([
      { $match: { ...deptFilter, createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, totalRevenue: { $sum: '$total' } } },
    ]);

    res.json({
      success: true,
      scope: req.user?.role === 'SUPER_ADMIN' ? 'all-departments' : 'own-department',
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        activeClients: uniqueClients.size,
        avgOrderValue,
        revenueData: groupedRevenue,
        ordersByStatus: Object.fromEntries(ordersByStatus.map((i) => [i._id, i.count])),
        salesByPaymentMethod: Object.fromEntries(
          salesByPaymentMethod.map((i) => [i._id || 'unspecified', { count: i.count, revenue: i.totalRevenue }]),
        ),
      },
    });
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    next(error);
  }
};

// Get revenue data specifically for the chart
exports.getRevenueChartData = async (req, res, next) => {
  try {
    const { range = 'monthly', year = new Date().getFullYear() } = req.query;
    const [startDate, endDate] = getDateRange(range, year);
    const deptFilter = scopeFilter(req);

    const {
      revenueEntries, orders, bookings, consultations,
    } = await fetchSources(startDate, endDate, deptFilter);

    const groupedRevenue = groupByDate(range, year, {
      revenueEntries, orders, bookings, consultations,
    });

    res.json({ success: true, data: groupedRevenue });
  } catch (error) {
    console.error('Error getting revenue chart data:', error);
    next(error);
  }
};

// Exported for unit testing — see __tests__/adminRevenue.scope.test.js
exports.scopeFilter = scopeFilter;
