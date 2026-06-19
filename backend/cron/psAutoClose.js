// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
//
// Phase 9 market research, Tier 1 #2 — PlayStation Arena auto-close.
// Every minute, find active sessions whose prepaid block has run out and
// close them automatically: calculate final duration/charge, mark the
// session completed, and push a live update to anyone watching the Sessions
// board. Open-ended walk-in sessions (plannedDurationMinutes: null) are
// never touched here — those still end only when staff ends them manually.
const PSSession = require('../models/PSSession');

async function runPSAutoClose() {
  try {
    const now = new Date();
    // A session is "expired" if its planned block has elapsed. Computed in
    // JS rather than a Mongo date-math query since plannedDurationMinutes is
    // a per-document offset from startTime, not a fixed column to compare
    // against $now directly.
    const candidates = await PSSession.find({
      status: 'active',
      plannedDurationMinutes: { $ne: null, $gt: 0 },
    });

    const expired = candidates.filter((s) => {
      const plannedEnd = new Date(s.startTime.getTime() + s.plannedDurationMinutes * 60000);
      return plannedEnd <= now;
    });

    if (!expired.length) return;

    let emitSessionUpdate;
    try { emitSessionUpdate = require('../socket').emitSessionUpdate; } catch (_) { emitSessionUpdate = null; }

    for (const session of expired) {
      session.endTime = now;
      session.durationMinutes = Math.ceil((session.endTime - session.startTime) / 60000);
      session.totalCharged = Math.ceil((session.durationMinutes / 60) * session.hourlyRate);
      session.status = 'completed';
      session.autoClosed = true;
      await session.save();

      // Reuses the exact same event ('session:update' on room dept:{slug})
      // that startSession/endSession already emit — Sessions.js already
      // listens for this and reloads, so auto-close needs no new frontend
      // wiring beyond the countdown display itself.
      if (emitSessionUpdate) {
        try { emitSessionUpdate('playstation', session); } catch (_) {}
      }
    }

    console.log(`[PS-AUTO-CLOSE] Closed ${expired.length} expired session(s) at ${now.toISOString()}`);
  } catch (err) {
    console.error('[PS-AUTO-CLOSE] Error:', err.message);
  }
}

module.exports = { runPSAutoClose };
