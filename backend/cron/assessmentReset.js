// Copyright (c) 2026 Thoth of Codes. Daily assessment reset — midnight EAT
const mongoose  = require('mongoose');
const User      = require('../models/User');
const { Assessment } = require('../models/StaffPortal');

exports.runAssessmentReset = async function() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const today = new Date().toISOString().slice(0,10);
    const staff = await User.find({ role:'STAFF', isActive:true }, '_id departmentSlug');
    let created = 0;
    for (const s of staff) {
      const exists = await Assessment.findOne({ staffId: s._id, date: today });
      if (!exists) {
        await Assessment.create({
          staffId:         s._id,
          departmentSlug:  s.departmentSlug,
          date:            today,
          status:          'PENDING_LOG',
          compositeScore:  0,
          kpiScores:       [],
        });
        created++;
      }
    }
    console.log(`[CRON] AssessmentReset: ${created} assessment records created for ${today}`);
  } catch (err) {
    console.error('[CRON] AssessmentReset error:', err.message);
  }
};
